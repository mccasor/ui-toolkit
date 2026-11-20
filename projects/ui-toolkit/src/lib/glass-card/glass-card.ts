import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type GlassCardVariant = 'default' | 'strong' | 'brand';
export type GlassCardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card di vetro. Radius 1.25rem, overflow hidden, classe `.glass`.
 * - `brand`: glow arancio in alto a sinistra + bordo arancio 55%.
 * - `interactive`: lift 2px + shadow-float (200ms), active scale(0.99).
 *
 * Per una card navigabile usare `<a uiGlassCard interactive href="…">`: un solo elemento focusabile.
 */
@Component({
  selector: 'ui-glass-card, a[uiGlassCard], button[uiGlassCard], article[uiGlassCard], section[uiGlassCard]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'ui-glass-card',
    '[class.glass]': "variant() !== 'strong'",
    '[class.glass-strong]': "variant() === 'strong'",
    '[class.ui-glass-card--brand]': "variant() === 'brand'",
    '[class.ui-glass-card--interactive]': 'interactive()',
    '[attr.data-padding]': 'padding()',
  },
  styles: `
    :host {
      display: block;
      box-sizing: border-box;
      border-radius: var(--ui-radius-card);
      overflow: hidden;
      color: var(--ui-text);
      text-align: start;
    }
    :host([data-padding='sm']) { padding: var(--ui-card-padding-sm); }
    :host([data-padding='md']) { padding: var(--ui-card-padding-md); }
    :host([data-padding='lg']) { padding: var(--ui-card-padding-lg); }
    :host(.ui-glass-card--brand) {
      background-image: radial-gradient(120% 80% at 0% 0%, var(--ui-brand-soft), transparent 60%);
      border-color: color-mix(in srgb, var(--ui-primary) 55%, transparent);
      border-left: var(--ui-brand-card-edge) solid var(--ui-brand-card-edge-color);
    }
    :host(a), :host(button) {
      font: inherit;
      text-decoration: none;
      width: 100%;
      cursor: pointer;
    }
    :host(.ui-glass-card--interactive) {
      transition:
        transform var(--ui-duration-card) var(--ui-ease),
        box-shadow var(--ui-duration-card) var(--ui-ease);
    }
    @media (hover: hover) {
      :host(.ui-glass-card--interactive:hover) {
        transform: translateY(var(--ui-card-lift));
        box-shadow: var(--ui-shadow-float);
      }
    }
    :host(.ui-glass-card--interactive:active) {
      transform: scale(var(--ui-card-active-scale));
    }
  `,
})
export class GlassCard {
  readonly variant = input<GlassCardVariant>('default');
  readonly padding = input<GlassCardPadding>('md');
  readonly interactive = input(false, { transform: booleanAttribute });
}
