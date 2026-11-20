import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SHADOW } from 'ui-toolkit/tokens';
import { FOUNDATION_STYLES } from './shared';

@Component({
  selector: 'fd-shadows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <p class="fd-intro">
        Due soli livelli di elevazione: <strong>glass</strong> (card a riposo) e <strong>float</strong> (hover di card interattive, tab attiva, toast, tab bar,
        menu). Tinte calde in light, nere in dark. Il backoffice azzera shadow-glass e usa un float leggero.
      </p>
      <div class="row">
        <div class="tile glass">
          <h2 class="ui-card-title">shadow-glass</h2>
          <p class="fd-code fd-muted">{{ s.light.glass }}</p>
        </div>
        <div class="tile float">
          <h2 class="ui-card-title">shadow-float</h2>
          <p class="fd-code fd-muted">{{ s.light.float }}</p>
        </div>
      </div>
      <p class="ui-body-sm fd-muted">Dark: <span class="fd-code">{{ s.dark.glass }}</span> · <span class="fd-code">{{ s.dark.float }}</span></p>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .row { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
      .tile { border-radius: var(--ui-radius-card); padding: var(--ui-card-padding-lg); }
      .tile h2 { margin: 0 0 0.5rem; }
      .tile p { margin: 0; overflow-wrap: anywhere; }
      .float { background: var(--ui-surface-solid); border: 1px solid var(--ui-glass-edge); box-shadow: var(--ui-shadow-float); }
    `,
  ],
})
class ShadowsPage {
  protected readonly s = SHADOW;
}

@Component({
  selector: 'fd-glass',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <p class="fd-intro">
        Vetro: background surface, backdrop-filter blur(18px) saturate(170%), bordo glass-edge, shadow-glass. Ha senso solo sul mesh (body::before, 4
        radial-gradient con --ui-mesh-alpha 0.45 light / 0.30 dark). Fallback a surface-solid senza backdrop-filter, con reduced transparency o high contrast:
        usa la toolbar per verificarli.
      </p>
      <div class="row">
        <div class="tile glass">
          <h2 class="ui-card-title">.glass</h2>
          <p class="ui-body-sm fd-muted">surface 72% (light) / 70% (dark)</p>
        </div>
        <div class="tile glass-strong">
          <h2 class="ui-card-title">.glass-strong</h2>
          <p class="ui-body-sm fd-muted">surface-strong 86%</p>
        </div>
        <div class="tile glass brand">
          <h2 class="ui-card-title">Card brand</h2>
          <p class="ui-body-sm fd-muted">glow brand-soft in alto a sinistra, bordo arancio 55%</p>
        </div>
        <div class="tile solid">
          <h2 class="ui-card-title">Fallback</h2>
          <p class="ui-body-sm fd-muted">surface-solid (senza vetro)</p>
        </div>
      </div>
      <div class="mesh-demo ui-mesh" aria-label="Mesh isolato" role="img"></div>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .row { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
      .tile { border-radius: var(--ui-radius-card); padding: var(--ui-card-padding-md); }
      .tile h2 { margin: 0 0 0.25rem; }
      .tile p { margin: 0; }
      .brand {
        background-image: radial-gradient(120% 80% at 0% 0%, var(--ui-brand-soft), transparent 60%);
        border-color: color-mix(in srgb, var(--ui-primary) 55%, transparent);
      }
      .solid { background: var(--ui-surface-solid); border: 1px solid var(--ui-border); }
      .mesh-demo { height: 12rem; border-radius: var(--ui-radius-card); overflow: hidden; background: var(--ui-bg); border: 1px solid var(--ui-border); }
    `,
  ],
})
class GlassPage {}

const meta: Meta = { title: 'Foundations/Superfici', tags: ['!autodocs'] };
export default meta;

export const Ombre: StoryObj = {
  name: 'Ombre ed elevazione',
  render: () => ({ template: `<fd-shadows />`, moduleMetadata: { imports: [ShadowsPage] } }),
};
export const VetroEMesh: StoryObj = {
  name: 'Vetro e mesh',
  render: () => ({ template: `<fd-glass />`, moduleMetadata: { imports: [GlassPage] } }),
};
export const VetroEMeshDark: StoryObj = {
  name: 'Vetro e mesh (dark)',
  globals: { theme: 'dark' },
  render: () => ({ template: `<fd-glass />`, moduleMetadata: { imports: [GlassPage] } }),
};
export const VetroReducedTransparency: StoryObj = {
  name: 'Vetro (reduced transparency)',
  globals: { transparency: 'reduce' },
  render: () => ({ template: `<fd-glass />`, moduleMetadata: { imports: [GlassPage] } }),
};
export const VetroHighContrast: StoryObj = {
  name: 'Vetro (high contrast)',
  globals: { contrast: 'more' },
  render: () => ({ template: `<fd-glass />`, moduleMetadata: { imports: [GlassPage] } }),
};
