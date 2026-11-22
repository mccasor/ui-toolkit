import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  isDevMode,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CHART_MAX_SERIES, chartSeries, relativeLuminance, withAlpha, type Mode } from 'ui-toolkit/tokens';
import { prefersReducedMotion } from '../util/media';
import { uniqueId } from '../util/id';

/** Sottoinsieme dei tipi Chart.js usato dall'API pubblica (chart.js è una peer dependency opzionale). */
export type ChartKind = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
export type ChartPoint = number | null | { x: number | string; y: number; r?: number };
export interface ChartDataset {
  label?: string;
  data: ChartPoint[];
  /** serie di riferimento (media, anno precedente): disegnata in text-muted, fuori dalla rampa */
  context?: boolean;
  [key: string]: unknown;
}
export interface ChartData {
  labels?: (string | number)[];
  datasets: ChartDataset[];
}

interface ActiveElement {
  datasetIndex: number;
  index: number;
}
interface ChartInstance {
  data: ChartData;
  options: Record<string, unknown>;
  update(mode?: string): void;
  destroy(): void;
  isDatasetVisible(i: number): boolean;
  setActiveElements(els: ActiveElement[]): void;
  tooltip?: { setActiveElements(els: ActiveElement[], pos: { x: number; y: number }): void };
}

/** Tratteggi per serie (linee): con la rampa di luminosità la serie non è mai distinta dal solo colore. */
const DASHES: number[][] = [[], [6, 4], [2, 3]];
const CONTEXT_DASH = [4, 4];
const CATEGORICAL = ['line', 'bar', 'radar'];

/**
 * Wrapper Chart.js 4 caricato on demand (`import('chart.js/auto')`).
 * Colori di assi (text-muted), griglia (border) e serie (palette agganciata alla banda del modo) letti dai token
 * e aggiornati al cambio tema; animazioni off con reduced motion.
 * Accessibilità: canvas `role="img"` con `ariaLabel` + tabella sr-only con i dati. Il canvas è focusabile:
 * ←/→ (Home/End) scorrono le categorie mostrando il tooltip e annunciandone i valori in una live region, Esc chiude.
 * Codifica: una rampa di luminosità sulla tinta accento (max 3 serie, la prima è la più contrastata), serie `context` in
 * text-muted; linee senza marker e con tratteggi diversi; barre sempre da zero; legenda solo con più serie.
 */
@Component({
  selector: 'ui-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box" [style.height]="height()">
      <canvas
        #canvas
        role="img"
        tabindex="0"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="hintId"
        (keydown)="onKey($event)"
        (blur)="clearActive()"
      ></canvas>
    </div>
    <span class="sr-only" [id]="hintId">Usa le frecce sinistra e destra per scorrere i valori.</span>
    <span class="sr-only" aria-live="polite">{{ announcement() }}</span>
    <table class="sr-only">
      <caption>{{ ariaLabel() }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ categoryLabel() }}</th>
          @for (d of data().datasets; track $index) {
            <th scope="col">{{ d.label ?? 'Serie ' + ($index + 1) }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (l of rows(); track $index; let i = $index) {
          <tr>
            <th scope="row">{{ l }}</th>
            @for (d of data().datasets; track $index) {
              <td>{{ format(d.data[i]) }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  host: { class: 'ui-chart', '[attr.data-mode]': 'mode()', '[attr.aria-busy]': 'ready() ? null : "true"' },
  styles: `
    :host { display: block; position: relative; min-width: 0; }
    .box { position: relative; width: 100%; }
    canvas { display: block; border-radius: var(--ui-radius-control); }
  `,
})
export class Chart {
  readonly type = input.required<ChartKind>();
  readonly data = input.required<ChartData>();
  /** opzioni Chart.js (unite sopra a quelle derivate dai token) */
  readonly options = input<Record<string, unknown>>({});
  /** descrizione del grafico per gli screen reader (obbligatoria) */
  readonly ariaLabel = input.required<string>();
  readonly height = input('12rem');
  /** intestazione della colonna categorie nella tabella sr-only */
  readonly categoryLabel = input('Categoria');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly mode = signal<Mode>('light');
  protected readonly ready = signal(false);
  protected readonly announcement = signal('');
  protected readonly hintId = uniqueId('ui-chart-hint');
  private activeIndex = -1;
  private nf = new Intl.NumberFormat(locale());
  private readonly themeTick = signal(0);
  private chart: ChartInstance | null = null;
  private ChartCtor: (new (el: HTMLCanvasElement, cfg: unknown) => ChartInstance) | null = null;
  private builtType: ChartKind | null = null;

  protected readonly rows = computed(() => this.data().labels ?? this.data().datasets[0]?.data.map((_, i) => i + 1) ?? []);

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(async () => {
      const mod = (await import('chart.js/auto')) as unknown as { default: new (el: HTMLCanvasElement, cfg: unknown) => ChartInstance };
      this.ChartCtor = mod.default;
      this.render();
      this.ready.set(true);
    });

    // cambio tema: data-theme/class su <html> o su un contenitore, preferenza di sistema
    afterNextRender(() => {
      const bump = () => this.themeTick.update((n) => n + 1);
      const mo = new MutationObserver(bump);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'data-contrast', 'data-motion'] });
      const scope = this.host.closest('.bo, [data-theme]');
      if (scope && scope !== document.documentElement) mo.observe(scope, { attributes: true, attributeFilter: ['data-theme', 'class'] });
      const mql = matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', bump);
      destroy.onDestroy(() => {
        mo.disconnect();
        mql.removeEventListener('change', bump);
        this.chart?.destroy();
      });
    });

    effect(() => {
      this.type();
      this.data();
      this.options();
      this.themeTick();
      untracked(() => this.render());
    });
  }

  private tokens() {
    const cs = getComputedStyle(this.host);
    const v = (n: string) => cs.getPropertyValue(n).trim();
    const bg = v('--ui-surface-solid') || v('--ui-bg');
    const mode: Mode = bg && relativeLuminance(bg) < 0.2 ? 'dark' : 'light';
    return { mode, muted: v('--ui-text-muted'), text: v('--ui-text'), border: v('--ui-border'), surface: bg, font: v('--ui-font-sans') };
  }

  private config() {
    const t = this.tokens();
    this.mode.set(t.mode);
    const type = this.type();
    const series = chartSeries(t.mode);
    const radial = ['pie', 'doughnut', 'polarArea'].includes(type);
    const categorical = CATEGORICAL.includes(type);
    const horizontal = (this.options() as { indexAxis?: string }).indexAxis === 'y';
    const multi = this.data().datasets.length > 1;
    if (isDevMode()) {
      if (radial) console.warn(`[ui-chart] "${this.ariaLabel()}": per una parte del tutto usare una barra orizzontale impilata, non ${type}.`);
      const loud = this.data().datasets.filter((d) => !d.context).length;
      if (!radial && loud > CHART_MAX_SERIES)
        console.warn(`[ui-chart] "${this.ariaLabel()}": ${loud} serie in evidenza, massimo ${CHART_MAX_SERIES}. Segnare le altre come context, o usare piccoli multipli o una tabella.`);
    }
    const line = type === 'line' || type === 'radar';
    let k = 0;
    const datasets = this.data().datasets.map((d) => {
      const i = d.context ? -1 : k++;
      const c = i < 0 || i >= series.length ? t.muted : series[i];
      const colors = radial ? (d.data.map((_, j) => series[j] ?? t.muted) as string[]) : c;
      return {
        borderWidth: type === 'bar' ? 0 : 2,
        borderColor: radial ? t.surface : c,
        backgroundColor: line ? withAlpha(c, type === 'radar' ? 0.2 : 0.12) : colors,
        fill: false,
        pointBackgroundColor: c,
        pointBorderColor: c,
        pointRadius: line ? 0 : 3,
        pointHoverRadius: 5,
        pointHitRadius: 12,
        borderDash: line ? (i < 0 ? CONTEXT_DASH : DASHES[i % DASHES.length]) : undefined,
        cubicInterpolationMode: 'monotone',
        borderRadius: type === 'bar' ? 2 : undefined,
        maxBarThickness: 24,
        ...d,
      };
    });
    const ticks = { color: t.muted, font: { family: t.font, size: 12, weight: 600 } };
    // indice (categorie) senza griglia, valori con griglia leggera e baseline a zero per le barre
    const index = { ticks, grid: { display: false }, border: { color: t.border } };
    const value = { ticks: { ...ticks, maxTicksLimit: 5 }, grid: { color: t.border }, border: { display: false }, beginAtZero: type === 'bar' };
    const scales = radial
      ? undefined
      : type === 'radar'
        ? { r: { angleLines: { color: t.border }, grid: { color: t.border }, pointLabels: ticks, ticks: { ...ticks, backdropColor: 'transparent' }, beginAtZero: true } }
        : categorical
          ? horizontal
            ? { x: value, y: index }
            : { x: index, y: value }
          : { x: { ...value, beginAtZero: false }, y: { ...value, beginAtZero: false } };
    const base = {
      responsive: true,
      maintainAspectRatio: false,
      locale: locale(),
      animation: prefersReducedMotion() ? false : { duration: 400 },
      color: t.muted,
      font: { family: t.font },
      interaction: categorical ? { mode: 'index', intersect: false } : { mode: 'nearest', intersect: true },
      plugins: {
        legend: {
          display: multi || radial,
          align: 'start',
          labels: {
            color: t.muted,
            font: { family: t.font, size: 12, weight: 600 },
            usePointStyle: true,
            ...(line ? { pointStyle: 'line', pointStyleWidth: 20 } : { pointStyle: 'rect' }),
            boxWidth: 8,
            boxHeight: 8,
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: t.text,
          titleColor: t.surface,
          bodyColor: t.surface,
          titleFont: { family: t.font, weight: 700 },
          bodyFont: { family: t.font },
          usePointStyle: true,
          boxPadding: 4,
        },
      },
      scales,
    };
    return { type, data: { labels: this.data().labels, datasets }, options: deepMerge(base, this.options()) };
  }

  /** valore leggibile per tabella e annunci */
  protected format(p: ChartPoint | undefined): string {
    if (p == null) return '—';
    if (typeof p === 'number') return this.nf.format(p);
    return [p.x, p.y, p.r].filter((v) => v != null).map((v) => (typeof v === 'number' ? this.nf.format(v) : v)).join(', ');
  }

  protected onKey(e: KeyboardEvent) {
    const n = this.rows().length;
    if (!this.chart || !n) return;
    const keys: Record<string, () => number> = {
      ArrowRight: () => (this.activeIndex + 1) % n,
      ArrowDown: () => (this.activeIndex + 1) % n,
      ArrowLeft: () => (this.activeIndex <= 0 ? n - 1 : this.activeIndex - 1),
      ArrowUp: () => (this.activeIndex <= 0 ? n - 1 : this.activeIndex - 1),
      Home: () => 0,
      End: () => n - 1,
    };
    if (e.key === 'Escape') return this.clearActive();
    const next = keys[e.key];
    if (!next) return;
    e.preventDefault();
    this.activeIndex = next();
    this.showActive();
  }

  protected clearActive() {
    this.activeIndex = -1;
    this.announcement.set('');
    if (!this.chart) return;
    this.chart.setActiveElements([]);
    this.chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
    this.chart.update('none');
  }

  private showActive() {
    const chart = this.chart!;
    const i = this.activeIndex;
    const ds = this.data().datasets;
    const radial = ['pie', 'doughnut', 'polarArea'].includes(this.type());
    const els = radial ? [{ datasetIndex: 0, index: i }] : ds.map((_, d) => ({ datasetIndex: d, index: i })).filter((el) => chart.isDatasetVisible(el.datasetIndex));
    chart.setActiveElements(els);
    chart.tooltip?.setActiveElements(els, { x: 0, y: 0 });
    chart.update('none');
    const label = String(this.rows()[i]);
    const values = radial
      ? this.format(ds[0]?.data[i])
      : ds.map((d, k) => `${d.label ?? 'Serie ' + (k + 1)} ${this.format(d.data[i])}`).join(', ');
    this.announcement.set(`${label}: ${values}`);
  }

  private render() {
    if (!this.ChartCtor) return;
    const cfg = this.config();
    if (this.chart && this.builtType === cfg.type) {
      this.chart.data = cfg.data as ChartData;
      this.chart.options = cfg.options;
      this.chart.update('none');
      return;
    }
    this.chart?.destroy();
    this.activeIndex = -1;
    this.chart = new this.ChartCtor(this.canvas().nativeElement, cfg);
    this.builtType = cfg.type;
  }
}

function locale(): string {
  return (typeof document !== 'undefined' && document.documentElement.lang) || 'it-IT';
}

function deepMerge<T extends Record<string, unknown>>(a: T, b: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const cur = out[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && cur && typeof cur === 'object' ? deepMerge(cur as Record<string, unknown>, v as Record<string, unknown>) : v;
  }
  return out as T;
}
