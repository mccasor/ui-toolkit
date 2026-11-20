import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { THEMES, blend, contrastRatio, deriveTone, formatOklch, type ToneRoles } from 'ui-toolkit/tokens';
import { FOUNDATION_STYLES, fmt } from './shared';

interface Check {
  label: string;
  ratio: number;
  min: number;
}

@Component({
  selector: 'fd-tone-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <p class="fd-intro">
        <span class="fd-code">deriveTone(hue, {{ '{' }} l, c {{ '}' }})</span> genera fill, hover, border, text e soft con la stessa firma di Torneo (h fisso, si
        muovono L e C). Il text viene spinto in L finché non supera 4.5:1 su surface-solid e sul soft composto.
      </p>
      <section class="glass fd-card controls" aria-label="Parametri">
        <label>
          <span class="ui-label">Hue {{ hue() }}°</span>
          <input type="range" min="0" max="359" [value]="hue()" (input)="hue.set(+$any($event.target).value)" aria-describedby="hue-hint" />
          <span id="hue-hint" class="ui-caption fd-muted">0–359, tinta OKLCH</span>
        </label>
        <label>
          <span class="ui-label">L fill {{ l().toFixed(2) }}</span>
          <input type="range" min="0.55" max="0.83" step="0.01" [value]="l()" (input)="l.set(+$any($event.target).value)" />
        </label>
        <label>
          <span class="ui-label">C fill {{ c().toFixed(2) }}</span>
          <input type="range" min="0.12" max="0.2" step="0.01" [value]="c()" (input)="c.set(+$any($event.target).value)" />
        </label>
        <div class="presets" role="group" aria-label="Esempi">
          @for (p of presets; track p.label) {
            <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" (click)="apply(p)">{{ p.label }}</button>
          }
        </div>
      </section>

      <div class="modes">
        @for (m of modes(); track m.name) {
          <section class="panel" [attr.data-theme]="m.name" [attr.aria-label]="'Ruoli ' + m.name">
            <h2 class="ui-card-title fd-h2">{{ m.name }}</h2>
            <ul class="roles">
              <li>
                <span class="sw" [style.background]="m.r.fill" [style.color]="m.r.on">Aa</span>
                <span><strong>fill</strong> <span class="fd-code">{{ m.r.fill }}</span><br /><span class="fd-code fd-muted">{{ ok(m.r.fill) }}</span></span>
              </li>
              <li>
                <span class="sw" [style.background]="m.r.fillHover" [style.color]="m.r.on">Aa</span>
                <span><strong>fill-hover</strong> <span class="fd-code">{{ m.r.fillHover }}</span><br /><span class="fd-code fd-muted">{{ ok(m.r.fillHover) }}</span></span>
              </li>
              <li>
                <span class="sw" [style.background]="m.r.fill" [style.border-color]="m.r.fillBorder"></span>
                <span><strong>fill-border</strong> <span class="fd-code">{{ m.r.fillBorder }}</span><br /><span class="fd-code fd-muted">{{ ok(m.r.fillBorder) }}</span></span>
              </li>
              <li>
                <span class="sw txt" [style.color]="m.r.text">Aa</span>
                <span><strong>text</strong> <span class="fd-code">{{ m.r.text }}</span><br /><span class="fd-code fd-muted">{{ ok(m.r.text) }}</span></span>
              </li>
              <li>
                <span class="sw" [style.background]="m.r.soft" [style.color]="m.r.text">Aa</span>
                <span><strong>soft</strong> <span class="fd-code">{{ m.r.soft }}</span><br /><span class="fd-code fd-muted">alpha {{ m.r.softAlpha }}</span></span>
              </li>
            </ul>
            <table class="fd-table">
              <caption class="sr-only">Verifica AA {{ m.name }}</caption>
              <tbody>
                @for (k of m.checks; track k.label) {
                  <tr>
                    <th scope="row">{{ k.label }}</th>
                    <td class="fd-code">{{ fmt(k.ratio) }}</td>
                    <td [class]="k.ratio >= k.min ? 'fd-pass' : 'fd-fail'" [attr.data-check]="k.label">{{ k.ratio >= k.min ? '✓' : '✗' }} ≥ {{ k.min }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </section>
        }
      </div>

      <section class="glass fd-card" aria-labelledby="css-h">
        <h2 id="css-h" class="ui-card-title fd-h2">CSS</h2>
        <pre class="fd-code css" tabindex="0" aria-label="CSS generato">{{ css() }}</pre>
      </section>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .controls { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); align-items: end; }
      label { display: grid; gap: 0.25rem; }
      input[type='range'] { width: 100%; min-height: var(--ui-touch-target); accent-color: var(--ui-primary); }
      .presets { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .modes { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); }
      .panel { background: var(--ui-surface-solid); color: var(--ui-text); border: 1px solid var(--ui-border); border-radius: var(--ui-radius-card); padding: var(--ui-card-padding-md); }
      .panel h2 { text-transform: capitalize; }
      .roles { list-style: none; margin: 0 0 1rem; padding: 0; display: grid; gap: 0.75rem; }
      .roles li { display: flex; gap: 0.75rem; align-items: center; font-size: var(--ui-font-size-sm); }
      .roles strong { margin-right: 0.375rem; }
      .sw { width: 2.75rem; height: 2.75rem; flex: none; border-radius: var(--ui-radius-tile); display: grid; place-items: center; font-weight: 800; border: 3px solid transparent; box-sizing: border-box; }
      .txt { border-color: var(--ui-border); }
      .css { margin: 0; white-space: pre; overflow-x: auto; }
    `,
  ],
})
class ToneGenerator {
  protected readonly hue = signal(255);
  protected readonly l = signal(0.55);
  protected readonly c = signal(0.17);
  protected readonly fmt = fmt;
  protected readonly presets = [
    { label: 'Blu (esempio doc)', h: 255, l: 0.55, c: 0.17 },
    { label: 'Arancio brand', h: 78, l: 0.83, c: 0.158 },
    { label: 'Rosso brand', h: 27, l: 0.55, c: 0.2 },
    { label: 'Viola', h: 305, l: 0.55, c: 0.17 },
    { label: 'Verde acqua', h: 185, l: 0.6, c: 0.12 },
  ];

  private readonly tone = computed(() => deriveTone(this.hue(), { l: this.l(), c: this.c() }));

  protected readonly modes = computed(() => {
    const t = this.tone();
    return (['light', 'dark'] as const).map((name) => {
      const r: ToneRoles = t[name];
      const surface = THEMES[name].surfaceSolid;
      const checks: Check[] = [
        { label: 'on su fill', ratio: contrastRatio(r.on, r.fill), min: 4.5 },
        { label: 'on su fill-hover', ratio: contrastRatio(r.on, r.fillHover), min: 4.5 },
        { label: 'text su surface-solid', ratio: contrastRatio(r.text, surface), min: 4.5 },
        { label: 'text su soft composto', ratio: contrastRatio(r.text, blend(r.soft, surface)), min: 4.5 },
        { label: 'text su bg', ratio: contrastRatio(r.text, THEMES[name].bg), min: 4.5 },
      ];
      return { name, r, checks };
    });
  });

  protected readonly css = computed(() => {
    const t = this.tone();
    const h = t.hue;
    return [
      `/* tinta h ${h} */`,
      `:root {`,
      `  --tone-${h}: ${t.light.fill};`,
      `  --tone-${h}-hover: ${t.light.fillHover};`,
      `  --tone-${h}-border: ${t.light.fillBorder};`,
      `  --on-tone-${h}: ${t.light.on};`,
      `  --tone-${h}-text: ${t.light.text};`,
      `  --tone-${h}-soft: ${t.light.soft};`,
      `}`,
      `[data-theme='dark'] {`,
      `  --tone-${h}-text: ${t.dark.text};`,
      `  --tone-${h}-soft: ${t.dark.soft};`,
      `}`,
    ].join('\n');
  });

  protected ok = (hex: string) => formatOklch(hex);
  protected apply(p: { h: number; l: number; c: number }) {
    this.hue.set(p.h);
    this.l.set(p.l);
    this.c.set(p.c);
  }
}

const meta: Meta = {
  title: 'Foundations/Generatore di toni',
  tags: ['!autodocs'],
  render: () => ({ template: `<fd-tone-generator />`, moduleMetadata: { imports: [ToneGenerator] } }),
};
export default meta;

export const Generatore: StoryObj = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Arancio brand' }));
    // tutte le verifiche AA passano per gli esempi
    await expect(canvasElement.querySelectorAll('.fd-fail').length).toBe(0);
    await userEvent.click(c.getByRole('button', { name: 'Blu (esempio doc)' }));
    await expect(canvasElement.querySelectorAll('.fd-fail').length).toBe(0);
  },
};
