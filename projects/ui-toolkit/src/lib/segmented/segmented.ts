import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '../util/id';

export interface SegmentedOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** id del tabpanel controllato (aria-controls) */
  controls?: string;
}

/** Template opzionale per l'icona (18px) di ogni opzione: `<ng-template uiSegmentedIcon let-option>…</ng-template>` */
@Directive({ selector: 'ng-template[uiSegmentedIcon]' })
export class SegmentedIcon {
  readonly template = inject<TemplateRef<{ $implicit: SegmentedOption<unknown> }>>(TemplateRef);
}

/**
 * Segmented control = tablist WAI-ARIA in un binario glass a pill.
 * Tastiera: ←/→ con wrap, Home/End; roving tabindex; la selezione segue il focus.
 */
@Component({
  selector: 'ui-segmented',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (o of options(); track o.value; let i = $index) {
      <button
        type="button"
        role="tab"
        [id]="tabId(i)"
        [attr.aria-selected]="o.value === value()"
        [attr.aria-controls]="o.controls ?? null"
        [tabIndex]="i === focusIndex() ? 0 : -1"
        [disabled]="o.disabled ?? false"
        (click)="select(i)"
      >
        @if (icon(); as tpl) {
          <span class="icon" aria-hidden="true"><ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: o }" /></span>
        }
        <span>{{ o.label }}</span>
      </button>
    }
  `,
  host: {
    role: 'tablist',
    class: 'ui-segmented glass',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
    '[class.ui-segmented--block]': 'block()',
    '(keydown)': 'onKeydown($event)',
  },
  styles: `
    :host {
      display: inline-flex;
      gap: 0.25rem;
      padding: 0.25rem;
      max-width: 100%;
      box-sizing: border-box;
      border-radius: var(--ui-radius-pill);
      overflow-x: auto;
      scrollbar-width: none;
    }
    :host(.ui-segmented--block) { display: flex; }
    :host(.ui-segmented--block) button { flex: 1 1 0; }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: var(--ui-touch-target);
      padding: 0 1rem;
      border: 0;
      border-radius: var(--ui-radius-pill);
      background: transparent;
      color: var(--ui-text-muted);
      font-family: var(--ui-font-sans);
      font-size: var(--ui-font-size-sm);
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition:
        background-color var(--ui-duration-card) var(--ui-ease),
        color var(--ui-duration-card) var(--ui-ease),
        box-shadow var(--ui-duration-card) var(--ui-ease);
    }
    @media (hover: hover) {
      button:hover:not([aria-selected='true'], :disabled) { color: var(--ui-text); }
    }
    button[aria-selected='true'] {
      background: var(--ui-nav-active-bg);
      color: var(--ui-nav-active-fg);
      box-shadow: var(--ui-shadow-float);
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .icon { display: inline-flex; }
    .icon ::ng-deep svg { width: 18px; height: 18px; }
  `,
})
export class Segmented<T = string> {
  readonly options = input.required<readonly SegmentedOption<T>[]>();
  readonly value = model<T | null>(null);
  readonly ariaLabel = input<string>();
  readonly ariaLabelledby = input<string>();
  /** occupa tutta la larghezza, tab di pari larghezza */
  readonly block = input(false, { transform: booleanAttribute });

  protected readonly icon = contentChild(SegmentedIcon);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly base = uniqueId('ui-seg');

  private readonly selectedIndex = computed(() => this.options().findIndex((o) => o.value === this.value()));
  protected readonly focusIndex = computed(() => {
    const i = this.selectedIndex();
    return i >= 0 ? i : this.options().findIndex((o) => !o.disabled);
  });

  /** id del tab i-esimo (per aria-labelledby dei tabpanel). */
  tabId(i: number) {
    return `${this.base}-tab-${i}`;
  }

  protected select(i: number) {
    const o = this.options()[i];
    if (o && !o.disabled) this.value.set(o.value);
  }

  protected onKeydown(e: KeyboardEvent) {
    const opts = this.options();
    const n = opts.length;
    if (!n) return;
    const enabled = (i: number) => !opts[i].disabled;
    const from = this.focusIndex();
    let next = -1;
    const step = (dir: 1 | -1) => {
      for (let k = 1; k <= n; k++) {
        const i = (from + dir * k + n) % n;
        if (enabled(i)) return i;
      }
      return -1;
    };
    switch (e.key) {
      case 'ArrowRight':
        next = step(1);
        break;
      case 'ArrowLeft':
        next = step(-1);
        break;
      case 'Home':
        next = opts.findIndex((_, i) => enabled(i));
        break;
      case 'End':
        next = n - 1 - [...opts].reverse().findIndex((o) => !o.disabled);
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next < 0) return;
    this.select(next);
    this.el.nativeElement.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
  }
}
