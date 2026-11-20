import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatTone = 'neutral' | 'brand' | 'success' | 'danger';

/**
 * Tile statistica: glass, padding 1rem, `<dl>`. Label 0.75rem/700 UPPERCASE muted con icona in tile 2rem radius 0.75rem;
 * valore font-numeric 2.25rem/700 + hint text-sm muted. `tone` colora tile icona e valore.
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
    :host([data-tone='neutral']) { --tile-bg: var(--ui-surface-sunken); --tile-fg: var(--ui-text); --value: var(--ui-text); }
    :host([data-tone='brand']) { --tile-bg: var(--ui-brand-soft); --tile-fg: var(--ui-accent-text); --value: var(--ui-accent-text); }
    :host([data-tone='success']) { --tile-bg: var(--ui-success-soft); --tile-fg: var(--ui-success-text); --value: var(--ui-success-text); }
    :host([data-tone='danger']) { --tile-bg: var(--ui-danger-soft); --tile-fg: var(--ui-danger-text); --value: var(--ui-danger-text); }
    dl, dd { margin: 0; }
    .label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: var(--ui-font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--ui-tracking-table-header);
      color: var(--ui-text-muted);
    }
    .icon {
      display: grid;
      place-items: center;
      flex: none;
      width: 2rem;
      height: 2rem;
      border-radius: var(--ui-radius-tile);
      background: var(--tile-bg);
      color: var(--tile-fg);
    }
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
