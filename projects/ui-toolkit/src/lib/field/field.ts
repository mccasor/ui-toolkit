import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  InjectionToken,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from '../util/id';

/** Contratto che un controllo (Input, Select, …) legge dal Field che lo contiene. */
export interface FieldContext {
  readonly controlId: () => string;
  readonly labelId: string;
  readonly describedBy: () => string | null;
  readonly invalid: () => boolean;
  readonly required: () => boolean;
  /** il controllo registra il proprio id (se ne ha già uno) */
  registerControlId(id: string): void;
}

export const UI_FIELD = new InjectionToken<FieldContext>('UI_FIELD');

/**
 * Wrapper di campo: label (0.875rem/700, asterisco danger-text se required), slot controllo,
 * hint text-sm muted, errore text-sm 600 danger-text con icona alert e `role="alert"`.
 * Collega `id`, `aria-describedby`, `aria-invalid`, `required` al controllo (direttiva `uiInput` o `ui-select`).
 */
@Component({
  selector: 'ui-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: UI_FIELD, useExisting: Field }],
  template: `
    <label class="label" [id]="labelId" [attr.for]="controlId()">
      {{ label() }}
      @if (required()) {
        <span class="req" aria-hidden="true">*</span>
      }
    </label>
    <ng-content />
    @if (hint()) {
      <p class="hint" [id]="hintId">{{ hint() }}</p>
    }
    @if (error()) {
      <p class="error" [id]="errorId" role="alert">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16.5v.01" />
        </svg>
        <span>{{ error() }}</span>
      </p>
    }
  `,
  host: { class: 'ui-field' },
  styles: `
    :host { display: grid; gap: 0.375rem; min-width: 0; }
    .label { font-size: var(--ui-type-label-size); font-weight: var(--ui-type-label-weight); color: var(--ui-text); }
    .req { color: var(--ui-danger-text); }
    .hint { margin: 0; font-size: var(--ui-font-size-sm); line-height: 1.25rem; color: var(--ui-text-muted); }
    .error { margin: 0; display: flex; gap: 0.375rem; align-items: flex-start; font-size: var(--ui-font-size-sm); line-height: 1.25rem; font-weight: 600; color: var(--ui-danger-text); }
    .error svg { flex: none; margin-top: 0.125rem; }
  `,
})
export class Field implements FieldContext {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  /** Messaggio di errore: se presente il campo è invalido. */
  readonly error = input<string | null>();
  readonly required = input(false, { transform: booleanAttribute });

  readonly labelId = uniqueId('ui-field-label');
  protected readonly hintId = uniqueId('ui-field-hint');
  protected readonly errorId = uniqueId('ui-field-error');
  private readonly ownId = signal(uniqueId('ui-field-control'));

  readonly controlId = this.ownId.asReadonly();
  readonly invalid = computed(() => !!this.error());
  readonly describedBy = computed(() => [this.hint() ? this.hintId : null, this.error() ? this.errorId : null].filter(Boolean).join(' ') || null);

  registerControlId(id: string) {
    this.ownId.set(id);
  }
}

/**
 * Direttiva su `<input>`, `<select>`, `<textarea>`: aspetto `.ui-input` (min-height 2.75rem, padding 0.625rem 0.875rem,
 * radius control, bordo border-strong, fondo surface-strong; focus bordo focus + anello brand-soft; invalid bordo danger).
 * Dentro un `ui-field` riceve id, aria-describedby, aria-invalid e required.
 */
@Directive({
  selector: 'input[uiInput], select[uiInput], textarea[uiInput]',
  host: {
    class: 'ui-input',
    '[id]': 'id()',
    '[attr.aria-describedby]': 'field?.describedBy() ?? null',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.required]': 'isRequired() ? "" : null',
  },
})
export class FieldInput {
  protected readonly field = inject(UI_FIELD, { optional: true });
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  /** Forza lo stato invalido (anche fuori da un Field). */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  private readonly ownId = this.el.nativeElement.id;
  protected readonly id = computed(() => this.ownId || this.field?.controlId() || null);
  protected readonly isInvalid = computed(() => this.invalid() || !!this.field?.invalid());
  protected readonly isRequired = computed(() => this.required() || !!this.field?.required());

  constructor() {
    if (this.ownId) this.field?.registerControlId(this.ownId);
  }
}
