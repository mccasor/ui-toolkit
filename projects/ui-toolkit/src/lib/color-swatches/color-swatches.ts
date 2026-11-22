import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, computed } from '@angular/core';
import { injectUiLabels } from '../util/labels';
import { SWATCHES, type Swatch } from 'ui-toolkit/tokens';
import { uniqueId } from '../util/id';

/**
 * Scelta colore: radio group nativo con "Nessuno" (tratteggio diagonale) + gli swatch.
 * Selezionato con doppio anello (surface 2px + text 4px). Il valore è il colore (hex) o null.
 * Tastiera nativa dei radio: frecce per muoversi, Spazio per scegliere.
 */
@Component({
  selector: 'ui-color-swatches',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset>
      <legend class="legend">{{ labelText() }}</legend>
      <div class="grid">
        @if (allowNone()) {
          <label class="item">
            <input type="radio" class="sr-only" [name]="name()" [checked]="value() === null" (change)="value.set(null)" />
            <span class="dot none" aria-hidden="true"></span>
            <span class="sr-only">{{ noneLabelText() }}</span>
          </label>
        }
        @for (s of swatches(); track s.id) {
          <label class="item" [title]="s.label">
            <input type="radio" class="sr-only" [name]="name()" [value]="s.fill" [checked]="value() === s.fill" (change)="value.set(s.fill)" />
            <span class="dot" aria-hidden="true" [style.background]="s.fill"></span>
            <span class="sr-only">{{ s.label }}</span>
          </label>
        }
      </div>
    </fieldset>
  `,
  host: { class: 'ui-color-swatches' },
  styles: `
    :host { display: block; }
    fieldset { margin: 0; padding: 0; border: 0; min-width: 0; }
    .legend { padding: 0; margin-bottom: 0.5rem; font-size: var(--ui-type-label-size); font-weight: 700; color: var(--ui-text); }
    .grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .item { position: relative; display: grid; place-items: center; width: var(--ui-touch-target); height: var(--ui-touch-target); cursor: pointer; }
    .dot {
      width: 2rem;
      height: 2rem;
      border-radius: var(--ui-radius-pill);
      box-shadow: inset 0 0 0 1px var(--ui-border);
      transition: box-shadow var(--ui-duration-micro) var(--ui-ease), transform var(--ui-duration-micro) var(--ui-ease);
    }
    .none {
      background: repeating-linear-gradient(135deg, var(--ui-surface-solid) 0 5px, var(--ui-border-strong) 5px 6px);
      box-shadow: inset 0 0 0 1px var(--ui-border-strong);
    }
    .item:active .dot { transform: scale(var(--ui-press-scale)); }
    input:checked + .dot { box-shadow: 0 0 0 2px var(--ui-surface-solid), 0 0 0 4px var(--ui-text); }
    input:focus-visible + .dot { outline: 3px solid var(--ui-focus); outline-offset: 5px; }
  `,
})
export class ColorSwatches {
  protected readonly uiLabels = injectUiLabels();
  readonly label = input<string>();
  protected readonly labelText = computed(() => this.label() ?? this.uiLabels().color);
  readonly swatches = input<readonly Swatch[]>(SWATCHES);
  readonly value = model<string | null>(null);
  readonly allowNone = input(true, { transform: booleanAttribute });
  readonly noneLabel = input<string>();
  protected readonly noneLabelText = computed(() => this.noneLabel() ?? this.uiLabels().colorNone);
  /** nome del gruppo di radio (default generato) */
  readonly name = input(uniqueId('ui-swatches'));
}
