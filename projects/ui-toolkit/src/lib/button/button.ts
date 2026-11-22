import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  InjectionToken,
  isDevMode,
  type Signal,
} from '@angular/core';

/**
 * Ambito che disabilita le azioni di scrittura (es. dati in sola lettura): i bottoni con l'attributo `write` sono
 * disabilitati finché il segnale vale `true`. L'app lo fornisce dove serve: `{ provide: UI_DISABLED_SCOPE, useValue: locked }`.
 */
export const UI_DISABLED_SCOPE = new InjectionToken<Signal<boolean>>('UI_DISABLED_SCOPE');

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Bottone: attributo su `<button>` e `<a>` con la stessa resa.
 *
 * - `type` di default `button` (mai submit per errore).
 * - `loading`: spinner 1em a sinistra, `aria-busy`, disabilitato.
 * - Su `<a>` lo stato disabled diventa `aria-disabled="true"` e il click viene bloccato.
 * - `iconOnly` richiede `aria-label` (avviso in dev mode).
 * - `write`: azione di scrittura, disabilitata quando lo `UI_DISABLED_SCOPE` fornito vale `true`.
 *
 * Gli stili sono le classi `.ui-btn*` di `ui-toolkit/styles/base.css`.
 */
@Component({
  selector: 'button[uiButton], a[uiButton]',
  exportAs: 'uiButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <span class="ui-spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  host: {
    class: 'ui-btn',
    '[class.ui-btn--primary]': "variant() === 'primary'",
    '[class.ui-btn--secondary]': "variant() === 'secondary'",
    '[class.ui-btn--ghost]': "variant() === 'ghost'",
    '[class.ui-btn--danger]': "variant() === 'danger'",
    '[class.ui-btn--sm]': "size() === 'sm'",
    '[class.ui-btn--lg]': "size() === 'lg'",
    '[class.ui-btn--block]': 'block()',
    '[class.ui-btn--icon]': 'iconOnly()',
    '[attr.type]': 'isAnchor ? null : type()',
    '[attr.disabled]': '!isAnchor && inactive() ? "" : null',
    '[attr.aria-disabled]': 'isAnchor && inactive() ? "true" : null',
    '[attr.tabindex]': 'isAnchor && inactive() ? "-1" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Azione di scrittura: rispetta `UI_DISABLED_SCOPE`. */
  readonly write = input(false, { transform: booleanAttribute });

  private readonly el = inject<ElementRef<HTMLButtonElement | HTMLAnchorElement>>(ElementRef);
  protected readonly isAnchor = this.el.nativeElement.tagName === 'A';
  private readonly scope = inject(UI_DISABLED_SCOPE, { optional: true });
  protected readonly inactive = computed(() => this.disabled() || this.loading() || (this.write() && !!this.scope?.()));

  constructor() {
    // In capture: blocca il click prima dei listener (click) del consumer.
    const block = (event: Event) => {
      if (this.inactive()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const host = this.el.nativeElement;
    host.addEventListener('click', block, { capture: true });
    inject(DestroyRef).onDestroy(() => host.removeEventListener('click', block, { capture: true }));

    if (isDevMode()) {
      afterNextRender(() => {
        const host = this.el.nativeElement;
        if (this.iconOnly() && !host.getAttribute('aria-label') && !host.getAttribute('aria-labelledby')) {
          console.warn('[uiButton] I bottoni iconOnly richiedono aria-label o aria-labelledby.', host);
        }
      });
    }
  }
}
