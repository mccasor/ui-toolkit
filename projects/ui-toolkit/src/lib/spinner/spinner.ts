import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Spinner 1em, bordo 2px currentColor con lato destro trasparente, 700ms lineare.
 * Con `label` è annunciato come `role="status"`; senza è decorativo.
 */
@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ui-spinner" aria-hidden="true"></span>
    @if (label()) {
      <span class="sr-only">{{ label() }}</span>
    }`,
  host: {
    '[attr.role]': 'label() ? "status" : null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  styles: `:host { display: inline-flex; vertical-align: middle; }`,
})
export class Spinner {
  readonly label = input<string>();
}
