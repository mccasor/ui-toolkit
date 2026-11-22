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
        Due soli livelli di elevazione, ombre corte (blur ≤ 20px): <strong>glass</strong> (card a riposo) e <strong>float</strong> (hover di card interattive, tab attiva, toast, tab bar,
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
      <p class="ui-body-sm fd-muted">Dark: <span class="fd-code">{{ s.dark.glass }}</span>, <span class="fd-code">{{ s.dark.float }}</span></p>
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
        Superfici piene e calde, niente vetro sfocato né mesh: l'elevazione è data dalla luminosità (bg, poi surface, poi surface-strong) e da
        un'ombra corta. Le classi mantengono il nome storico <span class="fd-code">.glass</span> / <span class="fd-code">.glass-strong</span>.
        Con high contrast i bordi diventano border-strong; con reduced transparency il backdrop degli overlay diventa opaco.
      </p>
      <div class="row">
        <div class="tile glass">
          <h2 class="ui-card-title">.glass</h2>
          <p class="ui-body-sm fd-muted">surface, bordo glass-edge, shadow-glass</p>
        </div>
        <div class="tile glass-strong">
          <h2 class="ui-card-title">.glass-strong</h2>
          <p class="ui-body-sm fd-muted">surface-strong: un gradino più chiaro (input, popover)</p>
        </div>
        <div class="tile glass brand">
          <h2 class="ui-card-title">Card brand</h2>
          <p class="ui-body-sm fd-muted">fondo arancio all'8% piatto, bordo arancio 55%</p>
        </div>
        <div class="tile sunken">
          <h2 class="ui-card-title">Incassata</h2>
          <p class="ui-body-sm fd-muted">surface-sunken (righe, hover ghost)</p>
        </div>
      </div>
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
        background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-surface));
        border-color: color-mix(in srgb, var(--ui-primary) 55%, transparent);
      }
      .sunken { background: var(--ui-surface-sunken); border: 1px solid var(--ui-border); }
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
export const Superfici: StoryObj = {
  name: 'Superfici',
  render: () => ({ template: `<fd-glass />`, moduleMetadata: { imports: [GlassPage] } }),
};
export const SuperficiDark: StoryObj = {
  name: 'Superfici (dark)',
  globals: { theme: 'dark' },
  render: () => ({ template: `<fd-glass />`, moduleMetadata: { imports: [GlassPage] } }),
};
export const SuperficiHighContrast: StoryObj = {
  name: 'Superfici (high contrast)',
  globals: { contrast: 'more' },
  render: () => ({ template: `<fd-glass />`, moduleMetadata: { imports: [GlassPage] } }),
};
