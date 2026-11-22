import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import {
  AVATAR_FALLBACK,
  BACKOFFICE,
  BRAND,
  SWATCHES,
  THEMES,
  blend,
  chartSeries,
  contrastRatio,
  formatOklch,
  kebab,
  oklch,
  onColor,
  parseColor,
  validateSeries,
  type ThemeTokens,
} from 'ui-toolkit/tokens';
import { FOUNDATION_STYLES, fmt } from './shared';

type Kind = 'text' | 'fill' | 'ui' | 'surface' | 'soft' | 'decor';
interface Row {
  token: keyof ThemeTokens;
  kind: Kind;
  /** token di testo/on da verificare sopra questo */
  pair?: keyof ThemeTokens;
  note?: string;
}

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Superfici',
    rows: [
      { token: 'bg', kind: 'surface', note: 'fondo pagina' },
      { token: 'surface', kind: 'surface', note: 'card, un gradino sopra bg' },
      { token: 'surfaceStrong', kind: 'surface', note: 'input, secondary button' },
      { token: 'surfaceSolid', kind: 'surface', note: 'fallback glass, popover' },
      { token: 'surfaceSunken', kind: 'surface', note: 'hover ghost, righe tabella' },
    ],
  },
  {
    title: 'Testo',
    rows: [
      { token: 'text', kind: 'text' },
      { token: 'textMuted', kind: 'text' },
      { token: 'accentText', kind: 'text', note: 'testo "arancio" leggibile' },
      { token: 'dangerText', kind: 'text' },
      { token: 'successText', kind: 'text' },
      { token: 'warningText', kind: 'text' },
    ],
  },
  {
    title: 'Azione e stati',
    rows: [
      { token: 'primary', kind: 'fill', pair: 'onPrimary' },
      { token: 'primaryHover', kind: 'fill', pair: 'onPrimary' },
      { token: 'primaryBorder', kind: 'decor', note: 'bordo bottoni primari' },
      { token: 'danger', kind: 'fill', pair: 'onDanger' },
      { token: 'dangerHover', kind: 'fill', pair: 'onDanger' },
      { token: 'success', kind: 'fill', pair: 'onSuccess' },
      { token: 'warning', kind: 'fill', pair: 'onWarning' },
      { token: 'navActiveBg', kind: 'fill', pair: 'navActiveFg', note: 'tab bar, segmented' },
    ],
  },
  {
    title: 'Soft (sfondi badge e chip)',
    rows: [
      { token: 'brandSoft', kind: 'soft', pair: 'accentText' },
      { token: 'dangerSoft', kind: 'soft', pair: 'dangerText' },
      { token: 'successSoft', kind: 'soft', pair: 'successText' },
      { token: 'warningSoft', kind: 'soft', pair: 'warningText' },
    ],
  },
  {
    title: 'Bordi e focus',
    rows: [
      { token: 'border', kind: 'decor', note: 'divisori decorativi' },
      { token: 'borderStrong', kind: 'ui', note: 'bordi di controlli, ≥ 3:1' },
      { token: 'glassEdge', kind: 'decor', note: 'bordo card glass' },
      { token: 'focus', kind: 'ui', note: 'outline 3px, offset 2px' },
    ],
  },
  {
    title: 'Altro',
    rows: [
      { token: 'skeleton', kind: 'decor' },
      { token: 'skeletonShine', kind: 'decor' },
      { token: 'backdrop', kind: 'decor', note: 'backdrop dialog + blur 4px' },
    ],
  },
];

type Values = Record<string, string>;

interface Cell {
  value: string;
  oklch: string;
  ratio: string;
  pass: boolean | null;
  label: string;
  bg: string;
  swatchBg: string;
  swatchFg: string;
  swatchBorder: string;
  sample: boolean;
}

function cell(row: Row, v: Values): Cell {
  const val = v[row.token] ?? '';
  const bg = v['bg'] ?? '#fff';
  const solid = v['surfaceSolid'] ?? '#fff';
  const alpha = val ? parseColor(val).a : 1;
  const ok = (val && formatOklch(alpha < 1 ? blend(val, bg) : val)) || '';
  const base: Cell = { value: val, oklch: ok + (alpha < 1 ? `, α ${alpha}` : ''), ratio: '—', pass: null, label: '', bg, swatchBg: 'transparent', swatchFg: v['text'] ?? '', swatchBorder: 'transparent', sample: false };
  if (!val) return base;
  switch (row.kind) {
    case 'text': {
      const r = Math.min(contrastRatio(val, bg), contrastRatio(val, solid));
      return { ...base, ratio: fmt(r), pass: r >= 4.5, label: 'min su bg / surface-solid', swatchFg: val, sample: true };
    }
    case 'fill': {
      const on = v[row.pair!];
      const r = contrastRatio(on, val);
      return { ...base, ratio: fmt(r), pass: r >= 4.5, label: `${kebab(row.pair!)} sopra`, swatchBg: val, swatchFg: on, sample: true };
    }
    case 'ui': {
      const r = Math.min(contrastRatio(val, bg), contrastRatio(val, solid));
      return { ...base, ratio: fmt(r), pass: r >= 3, label: 'min su bg / surface-solid (≥ 3)', swatchBorder: val };
    }
    case 'soft': {
      const t = v[row.pair!];
      const r = contrastRatio(t, blend(val, solid));
      return { ...base, ratio: fmt(r), pass: r >= 4.5, label: `${kebab(row.pair!)} sopra`, swatchBg: val, swatchFg: t, sample: true };
    }
    case 'surface': {
      const r = contrastRatio(v['text'], blend(val, bg));
      const rm = contrastRatio(v['textMuted'], blend(val, bg));
      return { ...base, ratio: `${fmt(r)}, ${fmt(rm)}`, pass: Math.min(r, rm) >= 4.5, label: 'text, text-muted sopra', swatchBg: val, swatchFg: v['text'], sample: true };
    }
    default:
      return { ...base, swatchBg: val, swatchBorder: v['border'] ?? 'transparent' };
  }
}

@Component({
  selector: 'fd-colors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <p class="fd-intro">
        Valori letti <strong>dal vivo</strong> dalle custom properties di <span class="fd-code">tokens.css</span> (light e dark), OKLCH e rapporto di
        contrasto WCAG calcolati con gli helper di <span class="fd-code">ui-toolkit/tokens</span>. Le trasparenze sono composte sul bg del tema.
      </p>
      <div #probeLight data-theme="light" hidden></div>
      <div #probeDark data-theme="dark" hidden></div>

      <section class="glass fd-card" aria-labelledby="brand-h">
        <h2 id="brand-h" class="ui-card-title fd-h2">Brand</h2>
        <div class="fd-grid">
          @for (b of brand; track b.name) {
            <div class="brand">
              <div class="chip" [style.background]="b.hex" [style.color]="b.on">
                @if (b.text) {
                  Aa
                }
              </div>
              <div>
                <strong>{{ b.name }}</strong>
                <div class="fd-code">{{ b.hex }}</div>
                <div class="fd-code fd-muted">doc {{ b.doc }}, calc {{ b.calc }}</div>
                <div class="ui-caption fd-muted">{{ b.use }}</div>
              </div>
            </div>
          }
        </div>
      </section>

      @for (g of groups; track g.title) {
        <section class="glass fd-card" [attr.aria-label]="g.title">
          <div class="fd-scroll" tabindex="0" [attr.aria-label]="'Tabella ' + g.title">
            <table class="fd-table">
              <caption class="ui-card-title fd-h2">{{ g.title }}</caption>
              <thead>
                <tr>
                  <th scope="col" class="ui-table-header">Token</th>
                  <th scope="col" class="ui-table-header">Light</th>
                  <th scope="col" class="ui-table-header">Dark</th>
                </tr>
              </thead>
              <tbody>
                @for (r of g.rows; track r.token) {
                  <tr>
                    <th scope="row">
                      <span class="fd-code">--ui-{{ kebab(r.token) }}</span>
                      @if (r.note) {
                        <div class="ui-caption fd-muted">{{ r.note }}</div>
                      }
                    </th>
                    @for (c of [cell(r, light()), cell(r, dark())]; track $index) {
                      <td>
                        <div class="tok">
                          <div class="frame" [style.background]="c.bg">
                            <div class="chip" [style.background]="c.swatchBg" [style.color]="c.swatchFg" [style.border-color]="c.swatchBorder">
                              @if (c.sample) {
                                Aa
                              }
                            </div>
                          </div>
                          <div>
                            <div class="fd-code">{{ c.value }}</div>
                            <div class="fd-code fd-muted">{{ c.oklch }}</div>
                            @if (c.pass !== null) {
                              <div>
                                <span [class]="c.pass ? 'fd-pass' : 'fd-fail'">{{ c.pass ? 'AA ✓' : 'AA ✗' }}</span>
                                {{ c.ratio }} <span class="ui-caption fd-muted">{{ c.label }}</span>
                              </div>
                            }
                          </div>
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .tok { display: flex; gap: 0.75rem; align-items: center; min-width: 15rem; }
      .frame { padding: 0.375rem; border-radius: var(--ui-radius-tile); flex: none; }
      .chip { width: 2.75rem; height: 2.75rem; border-radius: var(--ui-radius-tile); border: 2px solid transparent; display: grid; place-items: center; font-weight: 800; box-sizing: border-box; }
      .brand { display: flex; gap: 0.75rem; align-items: center; }
      .brand .chip { width: 3.5rem; height: 3.5rem; border-color: var(--ui-border); }
    `,
  ],
})
class ColorsPage {
  protected readonly groups = GROUPS;
  protected readonly kebab = kebab;
  protected readonly cell = cell;
  private readonly probeLight = viewChild.required<ElementRef<HTMLElement>>('probeLight');
  private readonly probeDark = viewChild.required<ElementRef<HTMLElement>>('probeDark');
  protected readonly light = signal<Values>({});
  protected readonly dark = signal<Values>({});
  protected readonly brand = Object.entries(BRAND).map(([name, b]) => ({
    name,
    hex: b.hex,
    use: b.use,
    on: onColor(b.hex),
    // il green è solo per i soft: nessun testo sopra (né ink né bianco raggiungono 4.5:1)
    text: contrastRatio(onColor(b.hex), b.hex) >= 4.5,
    doc: `${b.oklch[0]} / ${b.oklch[1]} / ${b.oklch[2] ?? '–'}`,
    calc: oklch(b.hex)
      .map((n, i) => (i === 2 ? Math.round(n) : n.toFixed(i === 0 ? 2 : 3)))
      .join(' / '),
  }));

  constructor() {
    afterNextRender(() => {
      const read = (el: HTMLElement) => {
        const cs = getComputedStyle(el);
        return Object.fromEntries(Object.keys(THEMES.light).map((k) => [k, cs.getPropertyValue(`--ui-${kebab(k)}`).trim()]));
      };
      this.light.set(read(this.probeLight().nativeElement));
      this.dark.set(read(this.probeDark().nativeElement));
    });
  }
}

@Component({
  selector: 'fd-palettes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <section class="glass fd-card" aria-labelledby="bo-h">
        <h2 id="bo-h" class="ui-card-title fd-h2">Backoffice (tema piatto desktop)</h2>
        <div class="fd-scroll" tabindex="0" aria-label="Tabella token backoffice">
          <table class="fd-table">
            <thead>
              <tr>
                <th scope="col" class="ui-table-header">Token</th>
                <th scope="col" class="ui-table-header">Light</th>
                <th scope="col" class="ui-table-header">Dark</th>
              </tr>
            </thead>
            <tbody>
              @for (k of boKeys; track k) {
                <tr>
                  <th scope="row" class="fd-code">--bo-{{ kebab(k) }}</th>
                  @for (m of boModes; track m.name) {
                    <td>
                      <div class="tok">
                        @if (isColor(m.t[k])) {
                          <span class="sw" [style.background]="m.t[k]"></span>
                        }
                        <span class="fd-code">{{ m.t[k] }}</span>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="glass fd-card" aria-labelledby="sw-h">
        <h2 id="sw-h" class="ui-card-title fd-h2">Swatch utente (11) con on calcolato</h2>
        <div class="fd-grid">
          @for (s of swatches; track s.id) {
            <div class="tok">
              <span class="chip" [style.background]="s.fill" [style.color]="s.on">Aa</span>
              <div>
                <strong>{{ s.label }}</strong>
                <div class="fd-code">{{ s.fill }} / {{ s.on }}</div>
                <div><span class="fd-pass">AA ✓</span> {{ ratio(s.on, s.fill) }}</div>
              </div>
            </div>
          }
        </div>
      </section>

      <section class="glass fd-card" aria-labelledby="av-h">
        <h2 id="av-h" class="ui-card-title fd-h2">Fallback avatar (hash del nome)</h2>
        <div class="fd-grid">
          @for (a of avatar; track a.fill) {
            <div class="tok">
              <span class="chip round" [style.background]="a.fill" [style.color]="a.on">MR</span>
              <span class="fd-code">{{ a.fill }} / {{ a.on }}, {{ ratio(a.on, a.fill) }}</span>
            </div>
          }
        </div>
      </section>

      <section class="glass fd-card" aria-labelledby="ch-h">
        <h2 id="ch-h" class="ui-card-title fd-h2">Serie grafici (rampa sull'accento)</h2>
        <p class="fd-intro">
          Una sola tinta, tre gradini di luminosità in ordine fisso (la prima serie è la più contrastata): banda OKLCH L 0.42–0.66 (light) /
          0.57–0.83 (dark), C ≥ 0.09, contrasto ≥ 3:1, ΔE OKLab ≥ 12 tra serie adiacenti e ≥ 8 simulando protanopia e deuteranopia (Machado 2009).
          Oltre tre serie: contesto in text-muted, piccoli multipli o tabella.
        </p>
        @for (m of chart; track m.mode) {
          <div class="series" [style.background]="m.surface">
            @for (c of m.colors; track $index) {
              <span class="bar" [style.background]="c" [attr.title]="c"></span>
            }
          </div>
          <p class="ui-body-sm">
            {{ m.mode }}: <span [class]="m.issues === 0 ? 'fd-pass' : 'fd-fail'">{{ m.issues === 0 ? 'valida ✓' : m.issues + ' problemi' }}</span>
            <span class="fd-code fd-muted"> {{ m.colors.join(', ') }}</span>
          </p>
        }
      </section>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .tok { display: flex; gap: 0.75rem; align-items: center; }
      .sw { width: 1.5rem; height: 1.5rem; border-radius: var(--ui-radius-skeleton-text); border: 1px solid var(--ui-border); flex: none; }
      .chip { width: 2.75rem; height: 2.75rem; border-radius: var(--ui-radius-tile); display: grid; place-items: center; font-weight: 800; flex: none; }
      .round { border-radius: var(--ui-radius-pill); font-family: var(--ui-font-display); }
      .series { display: flex; gap: 0.375rem; padding: 0.75rem; border-radius: var(--ui-radius-tile); }
      .bar { flex: 1; height: 2.5rem; border-radius: var(--ui-radius-skeleton-text); }
    `,
  ],
})
class PalettesPage {
  protected readonly kebab = kebab;
  protected readonly boKeys = Object.keys(BACKOFFICE.light) as (keyof typeof BACKOFFICE.light)[];
  protected readonly boModes = [
    { name: 'light', t: BACKOFFICE.light },
    { name: 'dark', t: BACKOFFICE.dark },
  ];
  protected readonly swatches = SWATCHES;
  protected readonly avatar = AVATAR_FALLBACK;
  protected readonly chart = (['light', 'dark'] as const).map((mode) => {
    const colors = chartSeries(mode);
    return { mode, colors, surface: THEMES[mode].surfaceSolid, issues: validateSeries(colors, mode).length };
  });
  protected isColor = (v: string) => /^(#|rgb)/.test(v);
  protected ratio = (a: string, b: string) => fmt(contrastRatio(a, b));
}

const meta: Meta = {
  title: 'Foundations/Colori',
  tags: ['!autodocs'],
  parameters: { a11y: { test: 'error' } },
};
export default meta;

export const TokenSemantici: StoryObj = {
  name: 'Token semantici',
  render: () => ({ template: `<fd-colors />`, moduleMetadata: { imports: [ColorsPage] } }),
};

export const PaletteEBackoffice: StoryObj = {
  name: 'Backoffice, swatch e grafici',
  render: () => ({ template: `<fd-palettes />`, moduleMetadata: { imports: [PalettesPage] } }),
};
