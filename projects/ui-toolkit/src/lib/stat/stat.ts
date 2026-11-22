import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatTone = 'neutral' | 'brand' | 'success' | 'danger';

/**
 * Statistica: superficie, padding 1rem, `<dl>`. Label 0.875rem/600 muted in frase (niente maiuscole spaziate),
 * icona opzionale 1rem in linea, senza tile; valore font-numeric 2.25rem/700 + hint text-sm muted. `tone` colora solo il valore.
 * Icona da fuori con `[uiStatIcon]` (decorativa).
 */
@Component({
  selector: 'ui-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl>
      <dt class="label">
        <span class="icon" aria-hidden="true"><ng-content select="[uiStatIcon]" /></span>
        <span>{{ label() }}</span>
      </dt>
      <dd class="value font-numeric">{{ value() }}</dd>
      @if (hint()) {
        <dd class="hint">{{ hint() }}</dd>
      }
    </dl>
  `,
  host: { class: 'ui-stat glass', '[attr.data-tone]': 'tone()' },
  styles: `
    :host { display: block; padding: var(--ui-card-padding-md); border-radius: var(--ui-radius-card); color: var(--ui-text); }
    :host([data-tone='neutral']) { --value: var(--ui-text); }
    :host([data-tone='brand']) { --value: var(--ui-accent-text); }
    :host([data-tone='success']) { --value: var(--ui-success-text); }
    :host([data-tone='danger']) { --value: var(--ui-danger-text); }
    dl, dd { margin: 0; }
    .label {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: var(--ui-type-body-sm-size);
      line-height: var(--ui-type-body-sm-line-height);
      font-weight: 600;
      color: var(--ui-text-muted);
    }
    .icon { display: inline-flex; flex: none; }
    .icon:not(:has(*)) { display: none; }
    .icon ::ng-deep svg { width: 1rem; height: 1rem; }
    .value { margin-top: 0.5rem; font-size: var(--ui-font-size-3xl); font-weight: 700; line-height: 1; color: var(--value); }
    .hint { margin-top: 0.25rem; font-size: var(--ui-font-size-sm); line-height: 1.25rem; color: var(--ui-text-muted); }
  `,
})
export class Stat {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>();
  readonly tone = input<StatTone>('neutral');
}
