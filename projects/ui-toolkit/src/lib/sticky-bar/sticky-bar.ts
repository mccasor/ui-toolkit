import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * Barra di pagina che si ferma sotto l'header (top: sticky-top + 0.5rem), z-index sticky bar (900).
 * Tipicamente contiene un Segmented o filtri. `surface` aggiunge un fondo glass a pill.
 */
@Component({
  selector: 'ui-sticky-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'ui-sticky-bar', '[class.glass-strong]': 'surface()', '[class.ui-sticky-bar--surface]': 'surface()' },
  styles: `
    :host {
      position: sticky;
      top: calc(var(--ui-sticky-top) + 0.5rem);
      z-index: var(--ui-z-sticky-bar);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }
    :host(.ui-sticky-bar--surface) { padding: 0.25rem; border-radius: var(--ui-radius-pill); box-shadow: var(--ui-shadow-glass); }
  `,
})
export class StickyBar {
  readonly surface = input(false, { transform: booleanAttribute });
}
