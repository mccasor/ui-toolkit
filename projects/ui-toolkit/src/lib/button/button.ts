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
  isDevMode,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Bottone: attributo su `<button>` e `<a>` con la stessa resa.
 *
 * - `type` di default `button` (mai submit per errore).
 * - `loading`: spinner 1em a sinistra, `aria-busy`, disabilitato.
 * - Su `<a>` lo stato disabled diventa `aria-disabled="true"` e il click viene bloccato.
 * - `iconOnly` richiede `aria-label` (avviso in dev mode).
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

  private readonly el = inject<ElementRef<HTMLButtonElement | HTMLAnchorElement>>(ElementRef);
  protected readonly isAnchor = this.el.nativeElement.tagName === 'A';
  protected readonly inactive = computed(() => this.disabled() || this.loading());

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
