import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Stato vuoto: colonna centrata (padding 2.5rem 1.5rem), tile icona 4rem radius 1rem su brand-soft con icona 32px accent-text,
 * titolo 1.125rem/800, descrizione muted max 24rem, slot azioni.
 *
 * Slot: `[uiEmptyIcon]` per l'icona (decorativa, aria-hidden), contenuto con attributo `uiEmptyActions` per le azioni.
 */
@Component({
  selector: 'ui-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon" aria-hidden="true"><ng-content select="[uiEmptyIcon]" /></div>
    <p class="title" [attr.role]="headingLevel() ? 'heading' : null" [attr.aria-level]="headingLevel()">{{ title() }}</p>
    @if (description()) {
      <p class="desc">{{ description() }}</p>
    }
    <div class="actions"><ng-content select="[uiEmptyActions]" /></div>
    <ng-content />
  `,
  host: { class: 'ui-empty-state' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2.5rem 1.5rem;
      color: var(--ui-text);
    }
    .icon {
      display: grid;
      place-items: center;
      width: 4rem;
      height: 4rem;
      border-radius: var(--ui-radius-empty-icon);
      background: var(--ui-brand-soft);
      color: var(--ui-accent-text);
      margin-bottom: 1rem;
    }
    .icon:not(:has(*)) { display: none; }
    .icon ::ng-deep svg { width: 32px; height: 32px; stroke-width: 1.75; }
    .title { margin: 0; font-size: var(--ui-type-card-title-size); font-weight: 800; line-height: 1.4; text-wrap: balance; }
    .desc { margin: 0.375rem 0 0; max-width: 24rem; font-size: var(--ui-font-size-sm); line-height: 1.25rem; color: var(--ui-text-muted); }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 1.25rem; }
    .actions:not(:has(*)) { display: none; }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** livello di heading del titolo (es. 2, 3); null = paragrafo */
  readonly headingLevel = input<number | null>(null);
}
