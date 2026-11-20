import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { chartSeries, relativeLuminance, withAlpha, type Mode } from 'ui-toolkit/tokens';
import { prefersReducedMotion } from '../util/media';

/** Sottoinsieme dei tipi Chart.js usato dall'API pubblica (chart.js è una peer dependency opzionale). */
export type ChartKind = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
export interface ChartDataset {
  label?: string;
  data: (number | null)[];
  [key: string]: unknown;
}
export interface ChartData {
  labels?: (string | number)[];
  datasets: ChartDataset[];
}

interface ChartInstance {
  data: ChartData;
  options: Record<string, unknown>;
  update(mode?: string): void;
  destroy(): void;
}

/**
 * Wrapper Chart.js 4 caricato on demand (`import('chart.js/auto')`).
 * Colori di assi (text-muted), griglia (border) e serie (palette agganciata alla banda del modo) letti dai token
 * e aggiornati al cambio tema; animazioni off con reduced motion.
 * Accessibilità: canvas `role="img"` con `ariaLabel` + tabella sr-only con i dati.
 */
@Component({
  selector: 'ui-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box" [style.height]="height()">
      <canvas #canvas role="img" [attr.aria-label]="ariaLabel()"></canvas>
    </div>
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
              <td>{{ d.data[i] ?? '—' }}</td>
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
    canvas { display: block; }
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
    const series = chartSeries(t.mode);
    const radial = ['pie', 'doughnut', 'polarArea'].includes(this.type());
    const datasets = this.data().datasets.map((d, i) => {
      const c = series[i % series.length];
      const colors = radial ? (d.data.map((_, j) => series[j % series.length]) as string[]) : c;
      return {
        borderWidth: 2,
        borderColor: radial ? t.surface : c,
        backgroundColor: this.type() === 'line' ? withAlpha(c, 0.15) : colors,
        pointBackgroundColor: c,
        cubicInterpolationMode: 'monotone',
        pointRadius: 3,
        ...d,
      };
    });
    const axis = {
      ticks: { color: t.muted, font: { family: t.font, size: 12, weight: 600 } },
      grid: { color: t.border },
      border: { color: t.border },
    };
    const base = {
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReducedMotion() ? false : { duration: 400 },
      color: t.muted,
      font: { family: t.font },
      plugins: {
        legend: { labels: { color: t.muted, font: { family: t.font, size: 12, weight: 600 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8 } },
        tooltip: { backgroundColor: t.text, titleColor: t.surface, bodyColor: t.surface, titleFont: { family: t.font, weight: 700 }, bodyFont: { family: t.font } },
      },
      scales: radial ? undefined : { x: axis, y: axis },
    };
    return { type: this.type(), data: { labels: this.data().labels, datasets }, options: deepMerge(base, this.options()) };
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
    this.chart = new this.ChartCtor(this.canvas().nativeElement, cfg);
    this.builtType = cfg.type;
  }
}

function deepMerge<T extends Record<string, unknown>>(a: T, b: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const cur = out[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && cur && typeof cur === 'object' ? deepMerge(cur as Record<string, unknown>, v as Record<string, unknown>) : v;
  }
  return out as T;
}
