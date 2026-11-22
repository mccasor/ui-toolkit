import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Stato vuoto: colonna centrata (padding 2.5rem 1.5rem), icona 32px accent-text senza tile,
 * titolo 1.125rem/800, descrizione muted max 24rem, slot azioni.
 *
 * Icona: `icon` (nome di `<ui-icon>`) o lo slot `[uiEmptyIcon]` (decorativa, aria-hidden); contenuto con attributo
 * `uiEmptyActions` per le azioni.
 */
@Component({
  selector: 'ui-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="icon" aria-hidden="true">
      @if (icon(); as name) {
        <ui-icon [name]="name" [size]="32" />
      }
      <ng-content select="[uiEmptyIcon]" />
    </div>
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
      display: inline-flex;
      color: var(--ui-accent-text);
      margin-bottom: 0.75rem;
    }
    .icon:not(:has(*)) { display: none; }
    .icon ::ng-deep svg { width: 32px; height: 32px; }
    .title { margin: 0; font-size: var(--ui-type-card-title-size); font-weight: 800; line-height: 1.4; text-wrap: balance; }
    .desc { margin: 0.375rem 0 0; max-width: 24rem; font-size: var(--ui-font-size-sm); line-height: 1.25rem; color: var(--ui-text-muted); }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 1.25rem; }
    .actions:not(:has(*)) { display: none; }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** Nome di `<ui-icon>` (in alternativa allo slot `[uiEmptyIcon]`). */
  readonly icon = input<string>();
  /** livello di heading del titolo (es. 2, 3); null = paragrafo */
  readonly headingLevel = input<number | null>(null);
}
