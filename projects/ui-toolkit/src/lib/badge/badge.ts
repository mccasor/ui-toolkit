import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'live';

/**
 * Badge a pill: padding 0.25rem 0.625rem, 0.75rem/700, in frase e senza tracking.
 * L'informazione è sempre nel testo (mai solo nel colore). `live` ha pallino pulsante (statico con reduced motion).
 * Icona opzionale da fuori (16px, currentColor).
 */
@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tone() === 'live') {
      <span class="ui-live-dot" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  host: { class: 'ui-badge', '[attr.data-tone]': 'tone()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      box-sizing: border-box;
      padding: 0.25rem 0.625rem;
      border: 1px solid transparent;
      border-radius: var(--ui-radius-pill);
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-xs);
      font-weight: 700;
      line-height: 1rem;
      white-space: nowrap;
      vertical-align: middle;
    }
    :host ::ng-deep svg { width: 1rem; height: 1rem; flex: none; }
    :host([data-tone='neutral']) { background: var(--ui-surface-sunken); border-color: var(--ui-border); color: var(--ui-text); }
    :host([data-tone='brand']) { background: var(--ui-primary); color: var(--ui-on-primary); }
    :host([data-tone='success']) { background: var(--ui-success-soft); color: var(--ui-success-text); }
    :host([data-tone='warning']) { background: var(--ui-warning-soft); color: var(--ui-warning-text); }
    :host([data-tone='danger']) { background: var(--ui-danger-soft); color: var(--ui-danger-text); }
    :host([data-tone='live']) {
      background: var(--ui-danger);
      color: var(--ui-on-danger);
    }
  `,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
}

export type RoleChipTone = 'primary' | 'warning' | 'danger' | 'success';

/**
 * Role chip (micro badge): cerchio 1.25rem, 0.6875rem/700, una lettera visibile,
 * nome completo `sr-only` + tooltip `title`.
 */
@Component({
  selector: 'ui-role-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span aria-hidden="true">{{ letter() }}</span><span class="sr-only">{{ label() }}</span>`,
  host: { class: 'ui-role-chip', '[attr.data-tone]': 'tone()', '[attr.title]': 'label()' },
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex: none;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: var(--ui-radius-pill);
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-micro);
      font-weight: 700;
      line-height: 1;
      cursor: default;
      vertical-align: middle;
    }
    :host([data-tone='primary']) { background: var(--ui-primary); color: var(--ui-on-primary); }
    :host([data-tone='warning']) { background: var(--ui-warning-soft); color: var(--ui-warning-text); }
    :host([data-tone='danger']) { background: var(--ui-danger-soft); color: var(--ui-danger-text); }
    :host([data-tone='success']) { background: var(--ui-success-soft); color: var(--ui-success-text); }
  `,
})
export class RoleChip {
  /** Nome completo del ruolo (sr-only + tooltip). */
  readonly label = input.required<string>();
  /** Lettera visibile; default: iniziale del label. */
  readonly initial = input<string>();
  readonly tone = input<RoleChipTone>('primary');
  protected readonly letter = computed(() => (this.initial() ?? this.label().charAt(0)).toUpperCase());
}
