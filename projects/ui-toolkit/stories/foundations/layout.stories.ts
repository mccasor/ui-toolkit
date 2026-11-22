import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { LAYOUT, RADIUS, SPACE, Z, kebab } from 'ui-toolkit/tokens';
import { FOUNDATION_STYLES } from './shared';

@Component({
  selector: 'fd-spacing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <section class="glass fd-card" aria-labelledby="sp-h">
        <h2 id="sp-h" class="ui-card-title fd-h2">Griglia 4px</h2>
        <p class="fd-intro">Scala Tailwind (1 = 0.25rem). Gradini più usati, in ordine: 2, 3, 4, 1, 1.5, 6.</p>
        <ul class="scale">
          @for (s of scale; track s[0]) {
            <li>
              <span class="fd-code k">{{ s[0] }}</span>
              <span class="bar" [style.width]="s[1]"></span>
              <span class="fd-code fd-muted">{{ s[1] }}</span>
            </li>
          }
        </ul>
      </section>

      <section class="glass fd-card" aria-labelledby="pad-h">
        <h2 id="pad-h" class="ui-card-title fd-h2">Padding card e gap</h2>
        <div class="pads">
          @for (p of pads; track p[0]) {
            <div class="pad" [style.padding]="p[1]">
              <div class="inner">{{ p[0] }}, {{ p[1] }}</div>
            </div>
          }
        </div>
        <dl class="kv">
          <dt>Gap in riga</dt>
          <dd class="fd-code">{{ space.gapInline }}</dd>
          <dt>Gap tra card in lista</dt>
          <dd class="fd-code">{{ space.gapList }}</dd>
          <dt>Gap tra sezioni</dt>
          <dd class="fd-code">{{ space.gapSection }} – {{ space.gapSectionLg }}</dd>
        </dl>
      </section>

      <section class="glass fd-card" aria-labelledby="lay-h">
        <h2 id="lay-h" class="ui-card-title fd-h2">Layout</h2>
        <dl class="kv">
          @for (l of layout; track l[0]) {
            <dt class="fd-code">--ui-{{ l[0] }}</dt>
            <dd class="fd-code fd-muted">{{ l[1] }}</dd>
          }
        </dl>
      </section>

      <section class="glass fd-card" aria-labelledby="z-h">
        <h2 id="z-h" class="ui-card-title fd-h2">Z-index</h2>
        <dl class="kv">
          @for (z of zs; track z[0]) {
            <dt class="fd-code">--ui-z-{{ z[0] }}</dt>
            <dd class="fd-code fd-muted">{{ z[1] }}</dd>
          }
          <dt>Overlay CDK</dt>
          <dd class="fd-muted">sopra tutti</dd>
        </dl>
      </section>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .scale { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
      .scale li { display: grid; grid-template-columns: 2.5rem auto 1fr; gap: 0.75rem; align-items: center; }
      .bar { height: 1rem; background: var(--ui-primary); border-radius: 2px; }
      .pads { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
      .pad { background: var(--ui-brand-soft); border-radius: var(--ui-radius-card); }
      .inner { background: var(--ui-surface-solid); border-radius: var(--ui-radius-tile); padding: 0.5rem 0.75rem; font-size: var(--ui-font-size-sm); font-weight: 600; }
      .kv { display: grid; grid-template-columns: max-content 1fr; gap: 0.375rem 1rem; margin: 0; font-size: var(--ui-font-size-sm); }
      .kv dd { margin: 0; }
    `,
  ],
})
class SpacingPage {
  protected readonly space = SPACE;
  protected readonly scale = Object.entries(SPACE.scale);
  protected readonly pads = Object.entries(SPACE.cardPadding);
  protected readonly layout: [string, string][] = [
    ['container-max', LAYOUT.containerMax],
    ['page-padding-x', LAYOUT.pagePaddingX],
    ['page-padding-top', LAYOUT.pagePaddingTop],
    ['header-height', LAYOUT.headerHeight],
    ['tabbar-height', LAYOUT.tabbarHeight],
    ['sticky-top', LAYOUT.stickyTop],
    ['tabbar-reserve', LAYOUT.tabbarReserve],
    ['touch-target', LAYOUT.touchTarget],
    ['control-height-sm / md / lg', Object.values(LAYOUT.controlHeight).join(' / ')],
    ['breakpoint', Object.values(LAYOUT.breakpoints).join(', ')],
  ];
  protected readonly zs = Object.entries(Z).map(([k, v]) => [kebab(k), v]);
}

@Component({
  selector: 'fd-radius',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <section class="glass fd-card" aria-labelledby="r-h">
        <h2 id="r-h" class="ui-card-title fd-h2">Radius</h2>
        <div class="fd-grid">
          @for (r of radii; track r[0]) {
            <div class="item">
              <div class="box" [style.border-radius]="'var(--ui-radius-' + r[0] + ')'"></div>
              <div class="fd-code">--ui-radius-{{ r[0] }}</div>
              <div class="fd-code fd-muted">{{ r[1] }}</div>
            </div>
          }
        </div>
        <p class="ui-body-sm fd-muted">
          Backoffice: card {{ bo.card }}, control {{ bo.control }} (cambia il tema dalla toolbar: i box card e control si aggiornano).
        </p>
      </section>
      <section class="glass fd-card" aria-labelledby="b-h">
        <h2 id="b-h" class="ui-card-title fd-h2">Bordi</h2>
        <div class="fd-grid">
          <div class="item"><div class="box b1"></div><span class="fd-code">border</span><span class="ui-caption fd-muted">divisori decorativi</span></div>
          <div class="item"><div class="box b2"></div><span class="fd-code">border-strong</span><span class="ui-caption fd-muted">controlli</span></div>
          <div class="item"><div class="box b3 glass"></div><span class="fd-code">glass-edge</span><span class="ui-caption fd-muted">bordo card</span></div>
          <div class="item"><div class="box b4"></div><span class="fd-code">primary-border</span><span class="ui-caption fd-muted">bottoni primari</span></div>
          <div class="item"><div class="box b5"></div><span class="fd-code">4px stato</span><span class="ui-caption fd-muted">toast</span></div>
        </div>
      </section>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .item { display: grid; gap: 0.25rem; justify-items: start; font-size: var(--ui-font-size-sm); }
      .box { width: 5rem; height: 5rem; background: var(--ui-surface-solid); border: 1px solid var(--ui-border-strong); box-sizing: border-box; }
      .b1 { border-color: var(--ui-border); border-radius: var(--ui-radius-card); }
      .b2 { border-radius: var(--ui-radius-control); }
      .b3 { border-radius: var(--ui-radius-card); }
      .b4 { background: var(--ui-primary); border-color: var(--ui-primary-border); border-radius: var(--ui-radius-control); }
      .b5 { border-color: var(--ui-border); border-radius: var(--ui-radius-toast); }
    `,
  ],
})
class RadiusPage {
  protected readonly radii = Object.entries(RADIUS)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => [kebab(k), v as string]);
  protected readonly bo = RADIUS.backoffice;
}

const meta: Meta = { title: 'Foundations/Spaziatura e radius', tags: ['!autodocs'] };
export default meta;

export const Spaziatura: StoryObj = {
  render: () => ({ template: `<fd-spacing />`, moduleMetadata: { imports: [SpacingPage] } }),
};
export const Radius: StoryObj = {
  name: 'Radius e bordi',
  render: () => ({ template: `<fd-radius />`, moduleMetadata: { imports: [RadiusPage] } }),
};
export const RadiusBackoffice: StoryObj = {
  name: 'Radius (backoffice)',
  globals: { theme: 'backoffice' },
  render: () => ({ template: `<fd-radius />`, moduleMetadata: { imports: [RadiusPage] } }),
};
