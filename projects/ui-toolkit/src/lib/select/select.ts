import {
  createBlockScrollStrategy,
  createFlexibleConnectedPositionStrategy,
  createGlobalPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { injectUiLabels } from '../util/labels';
import { Avatar, TeamLogo } from '../avatar/avatar';
import { Icon } from '../icon/icon';
import { UI_FIELD } from '../field/field';
import { uniqueId } from '../util/id';
import { mediaQuery } from '../util/media';
import { applyThemeContext } from '../util/theme-context';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  /** riga secondaria */
  description?: string;
  /** intestazione di gruppo */
  group?: string;
  disabled?: boolean;
  /** avatar/logo a sinistra: immagine o iniziali con colore (on calcolato) */
  avatar?: { name?: string; src?: string | null; color?: string | null; shape?: 'circle' | 'square' };
  /** icona di `<ui-icon>` a sinistra (se non c'è l'avatar) */
  icon?: string;
}

interface Group<T> {
  name: string | null;
  id: string;
  options: { option: SelectOption<T>; index: number }[];
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/**
 * Select: trigger `role="combobox"` con l'aspetto di Input; pannello overlay della stessa larghezza
 * (si ribalta sopra se manca spazio), bottom sheet sotto 640px. Ricerca interna accent-insensitive
 * oltre `searchThreshold` opzioni. Opzioni con riga secondaria, avatar/logo con colore, gruppi con intestazione.
 *
 * Tastiera: ↓/↑/Alt+↓/Invio/Spazio aprono; ↑/↓, Home/End, PagSu/PagGiù muovono; type-ahead;
 * Invio/Spazio scelgono; Esc chiude; Tab sceglie l'opzione attiva e chiude.
 */
@Component({
  selector: 'ui-select',
  imports: [NgTemplateOutlet, Avatar, TeamLogo, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      #trigger
      type="button"
      class="ui-input trigger"
      role="combobox"
      aria-haspopup="listbox"
      [id]="triggerId()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? listboxId : null"
      [attr.aria-activedescendant]="open() && !searchOn() && activeIndex() >= 0 ? optionId(activeIndex()) : null"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-label]="field ? null : ariaLabel() ?? null"
      [attr.aria-describedby]="field?.describedBy() ?? null"
      [attr.aria-invalid]="invalid() || field?.invalid() ? 'true' : null"
      [attr.aria-required]="isRequired() ? 'true' : null"
      [disabled]="disabled()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
      (blur)="!open() && touch.emit()"
    >
      <span class="value" [id]="valueId">
        @if (selected(); as s) {
          @if (s.avatar) {
            <ng-container *ngTemplateOutlet="avatarTpl; context: { $implicit: s }" />
          } @else if (s.icon) {
            <ui-icon [name]="s.icon" [size]="18" />
          }
          <span class="label">{{ s.label }}</span>
        } @else {
          <span class="placeholder">{{ placeholder() ?? uiLabels().selectPlaceholder }}</span>
        }
      </span>
      <ui-icon class="chevron" name="chevron-down" />
    </button>
    @if (clearable() && selected() && !disabled()) {
      <button type="button" class="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm clear" [attr.aria-label]="uiLabels().clear" (click)="clear()">
        <ui-icon name="close" [size]="16" />
      </button>
    }

    <ng-template #panelTpl>
      <div class="panel" [class.sheet]="sheet()" (keydown)="onPanelKeydown($event)">
        @if (sheet()) {
          <div class="sheet-head">
            <span class="sheet-title" aria-hidden="true">{{ title() }}</span>
            <button type="button" class="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm" [attr.aria-label]="uiLabels().close" (click)="close(true)">
              <ui-icon name="close" />
            </button>
          </div>
        }
        @if (searchOn()) {
          <input
            #search
            class="ui-input search"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            autocomplete="off"
            [attr.aria-controls]="listboxId"
            [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
            [attr.aria-label]="searchLabelText()"
            [placeholder]="searchPlaceholder() ?? searchLabelText()"
            [value]="query()"
            (input)="onQuery($any($event.target).value)"
          />
        }
        @if (filtered().length === 0) {
          <p class="empty" role="status">{{ emptyTextText() }}</p>
        }
        <div class="list" role="listbox" [id]="listboxId" [attr.aria-labelledby]="labelledBy()" [attr.aria-label]="field ? null : ariaLabel() ?? null">
          @for (g of groups(); track g.id) {
            @if (g.name) {
              <div role="group" [attr.aria-labelledby]="g.id">
                <div class="group-h" [id]="g.id" role="presentation">{{ g.name }}</div>
                @for (o of g.options; track o.index) {
                  <ng-container *ngTemplateOutlet="optionTpl; context: { $implicit: o.option, index: o.index }" />
                }
              </div>
            } @else {
              @for (o of g.options; track o.index) {
                <ng-container *ngTemplateOutlet="optionTpl; context: { $implicit: o.option, index: o.index }" />
              }
            }
          }
        </div>
      </div>
    </ng-template>

    <ng-template #optionTpl let-o let-i="index">
      <div
        class="option"
        role="option"
        [id]="optionId(i)"
        [class.active]="i === activeIndex()"
        [attr.aria-selected]="isSelected(o)"
        [attr.aria-disabled]="o.disabled ? 'true' : null"
        (click)="choose(o)"
        (pointermove)="!o.disabled && activeIndex.set(i)"
      >
        @if (o.avatar) {
          <ng-container *ngTemplateOutlet="avatarTpl; context: { $implicit: o }" />
        } @else if (o.icon) {
          <ui-icon [name]="o.icon" [size]="18" />
        }
        <span class="text">
          <span class="label">{{ o.label }}</span>
          @if (o.description) {
            <span class="desc">{{ o.description }}</span>
          }
        </span>
        @if (isSelected(o)) {
          <ui-icon class="check" name="check" />
        }
      </div>
    </ng-template>

    <ng-template #avatarTpl let-o>
      @if (o.avatar.shape === 'square') {
        <ui-team-logo [name]="o.avatar.name ?? o.label" [src]="o.avatar.src" [color]="o.avatar.color" size="xs" decorative />
      } @else {
        <ui-avatar [name]="o.avatar.name ?? o.label" [src]="o.avatar.src" [color]="o.avatar.color" size="xs" decorative />
      }
    </ng-template>
  `,
  host: { class: 'ui-select', '[class.ui-select--clearable]': 'clearable()' },
  styles: `
    :host { display: block; min-width: 0; position: relative; }
    :host(.ui-select--clearable) .trigger { padding-inline-end: 3.75rem; }
    .clear { position: absolute; inset-inline-end: 2.25rem; top: 50%; transform: translateY(-50%); }
    .trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-align: start;
      cursor: pointer;
    }
    .trigger:disabled { cursor: not-allowed; }
    .value { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.5rem; }
    .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .placeholder { color: color-mix(in srgb, var(--ui-text-muted) 85%, transparent); }
    .chevron { flex: none; color: var(--ui-text-muted); transition: transform var(--ui-duration-micro) var(--ui-ease); }
    .trigger[aria-expanded='true'] .chevron { transform: rotate(180deg); }

    .panel {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      max-height: min(20rem, 60dvh);
      padding: 0.25rem;
      background: var(--ui-surface-solid);
      color: var(--ui-text);
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-control);
      box-shadow: var(--ui-shadow-float);
      font-family: var(--ui-font-sans);
      width: 100%;
    }
    .panel.sheet {
      max-height: 90dvh;
      padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom));
      border-radius: var(--ui-radius-card) var(--ui-radius-card) 0 0;
      border-bottom: 0;
      animation: ui-sheet-up var(--ui-duration-sheet) var(--ui-ease) both;
    }
    .sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.25rem 0.25rem 0.5rem 0.75rem; }
    .sheet-title { font-size: var(--ui-type-card-title-size); font-weight: 600; }
    .search { margin: 0.25rem 0.25rem 0.5rem; width: calc(100% - 0.5rem); }
    .list { overflow-y: auto; overscroll-behavior: contain; }
    .group-h {
      padding: 0.5rem 0.75rem 0.25rem;
      font-size: var(--ui-font-size-xs);
      font-weight: 600;
      color: var(--ui-text-muted);
    }
    .option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: var(--ui-touch-target);
      padding: 0.375rem 0.75rem;
      box-sizing: border-box;
      border-radius: calc(var(--ui-radius-control) - 0.25rem);
      cursor: pointer;
      user-select: none;
    }
    .option.active { background: var(--ui-surface-sunken); }
    .option[aria-selected='true'] .label { font-weight: 600; }
    .option[aria-disabled='true'] { opacity: 0.5; cursor: not-allowed; }
    .text { flex: 1; min-width: 0; display: grid; }
    .desc { font-size: var(--ui-font-size-sm); line-height: 1.25rem; color: var(--ui-text-muted); }
    .check { flex: none; color: var(--ui-accent-text); }
    .empty { margin: 0; padding: 0.75rem; font-size: var(--ui-font-size-sm); color: var(--ui-text-muted); }
  `,
})
export class Select<T = string> {
  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly value = model<T | null>(null);
  readonly placeholder = input<string>();
  /** Nome accessibile se non è dentro un `ui-field`. */
  readonly ariaLabel = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Oltre questo numero di opzioni compare la ricerca interna. */
  readonly searchThreshold = input(8, { transform: numberAttribute });
  protected readonly uiLabels = injectUiLabels();
  readonly searchLabel = input<string>();
  protected readonly searchLabelText = computed(() => this.searchLabel() ?? this.uiLabels().search);
  readonly emptyText = input<string>();
  protected readonly emptyTextText = computed(() => this.emptyText() ?? this.uiLabels().noResults);
  readonly compareWith = input<(a: T | null, b: T | null) => boolean>((a, b) => a === b);
  /** forza la ricerca interna (true/false) invece della soglia `searchThreshold` */
  readonly searchable = input<boolean | undefined>(undefined);
  /** segnaposto della ricerca (default: l'etichetta della ricerca) */
  readonly searchPlaceholder = input<string>();
  /** bottone per svuotare la scelta (valore null) */
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** id del trigger fuori da un `ui-field` (es. per una `<label for>` esterna) */
  readonly controlId = input<string>();
  /** emesso quando l'utente lascia il controllo a pannello chiuso (es. per segnare il campo come toccato) */
  readonly touch = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  protected readonly field = inject(UI_FIELD, { optional: true });
  private readonly injector = inject(Injector);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panelTpl');
  private readonly searchRef = viewChild<ElementRef<HTMLInputElement>>('search');

  protected readonly listboxId = uniqueId('ui-select-listbox');
  protected readonly valueId = uniqueId('ui-select-value');
  private readonly ownId = uniqueId('ui-select');
  protected readonly triggerId = computed(() => this.controlId() ?? this.field?.controlId() ?? this.ownId);
  protected readonly isRequired = computed(() => this.required() || !!this.field?.required());
  protected readonly labelledBy = computed(() => (this.field ? this.field.labelId : null));

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  private readonly mobile = mediaQuery('(max-width: 639.98px)');
  protected readonly sheet = signal(false);
  private overlay: OverlayRef | null = null;
  private typeahead = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly searchOn = computed(() => this.searchable() ?? this.options().length > this.searchThreshold());
  protected readonly selected = computed(() => this.options().find((o) => this.compareWith()(o.value, this.value())) ?? null);
  protected title() {
    const id = this.labelledBy();
    return (id && document.getElementById(id)?.textContent?.replace('*', '').trim()) || this.ariaLabel() || '';
  }

  /** opzioni filtrate, con indice stabile = posizione nell'elenco filtrato */
  protected readonly filtered = computed(() => {
    const q = normalize(this.query());
    const all = this.options();
    return q ? all.filter((o) => normalize(`${o.label} ${o.description ?? ''}`).includes(q)) : [...all];
  });

  protected readonly groups = computed<Group<T>[]>(() => {
    const out: Group<T>[] = [];
    this.filtered().forEach((option, index) => {
      const name = option.group ?? null;
      let g = out.find((x) => x.name === name);
      if (!g) out.push((g = { name, id: `${this.listboxId}-g${out.length}`, options: [] }));
      g.options.push({ option, index });
    });
    // l'ordine visivo (raggruppato) deve coincidere con l'ordine degli indici
    let k = 0;
    return out.map((g) => ({ ...g, options: g.options.map((o) => ({ ...o, index: k++ })) }));
  });
  /** opzioni nell'ordine visivo: indice = activeIndex */
  private readonly ordered = computed(() => this.groups().flatMap((g) => g.options.map((o) => o.option)));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlay?.dispose());
  }

  protected optionId(i: number) {
    return `${this.listboxId}-o${i}`;
  }
  protected isSelected(o: SelectOption<T>) {
    return this.compareWith()(o.value, this.value());
  }

  protected toggle() {
    if (this.open()) this.close(false);
    else this.show();
  }

  show() {
    if (this.open() || this.disabled()) return;
    this.query.set('');
    const sel = this.ordered().findIndex((o) => this.isSelected(o));
    this.activeIndex.set(sel >= 0 ? sel : this.ordered().findIndex((o) => !o.disabled));
    this.sheet.set(this.mobile());
    this.open.set(true);
    this.attach();
    this.opened.emit();
  }

  /** Porta il focus sul trigger. */
  focus() {
    this.triggerRef().nativeElement.focus();
  }

  protected clear() {
    this.value.set(null);
    this.focus();
  }

  close(restoreFocus = true) {
    if (!this.open()) return;
    this.open.set(false);
    this.overlay?.detach();
    if (restoreFocus) this.triggerRef().nativeElement.focus();
    this.closed.emit();
  }

  private attach() {
    const trigger = this.triggerRef().nativeElement;
    const sheet = this.sheet();
    const position = sheet
      ? createGlobalPositionStrategy(this.injector).centerHorizontally().bottom('0')
      : createFlexibleConnectedPositionStrategy(this.injector, trigger)
          .withPositions([
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
          ])
          .withFlexibleDimensions(false)
          .withPush(false)
          .withViewportMargin(8);
    this.overlay?.dispose();
    this.overlay = createOverlayRef(this.injector, {
      positionStrategy: position,
      scrollStrategy: sheet ? createBlockScrollStrategy(this.injector) : createRepositionScrollStrategy(this.injector),
      width: sheet ? '100%' : trigger.getBoundingClientRect().width,
      maxWidth: sheet ? '40rem' : undefined,
      hasBackdrop: sheet,
      backdropClass: 'ui-overlay-backdrop',
      panelClass: 'ui-select-pane',
    });
    applyThemeContext(this.host.nativeElement, this.overlay.overlayElement);
    this.overlay.backdropClick().subscribe(() => this.close(true));
    this.overlay.outsidePointerEvents().subscribe((e) => {
      if (!trigger.contains(e.target as Node)) this.close(false);
    });
    this.overlay.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    afterNextRender(
      () => {
        this.searchRef()?.nativeElement.focus();
        this.scrollActiveIntoView();
      },
      { injector: this.injector },
    );
  }

  protected choose(o: SelectOption<T> | undefined) {
    if (!o || o.disabled) return;
    this.value.set(o.value);
    this.close(true);
  }

  protected onQuery(q: string) {
    this.query.set(q);
    this.activeIndex.set(this.ordered().findIndex((o) => !o.disabled));
  }

  private move(to: number | 'first' | 'last', dir: 1 | -1 = 1) {
    const list = this.ordered();
    if (!list.length) return;
    let i = to === 'first' ? 0 : to === 'last' ? list.length - 1 : to;
    i = Math.max(0, Math.min(list.length - 1, i));
    while (list[i]?.disabled && i >= 0 && i < list.length) i += to === 'last' ? -1 : dir;
    if (i >= 0 && i < list.length) {
      this.activeIndex.set(i);
      this.scrollActiveIntoView();
    }
  }

  private scrollActiveIntoView() {
    const i = this.activeIndex();
    if (i < 0) return;
    queueMicrotask(() => document.getElementById(this.optionId(i))?.scrollIntoView?.({ block: "nearest" }));
  }

  private onTypeahead(char: string) {
    clearTimeout(this.typeaheadTimer);
    this.typeahead += normalize(char);
    this.typeaheadTimer = setTimeout(() => (this.typeahead = ''), 500);
    const list = this.ordered();
    const start = this.typeahead.length === 1 ? this.activeIndex() + 1 : this.activeIndex();
    for (let k = 0; k < list.length; k++) {
      const i = (Math.max(0, start) + k) % list.length;
      if (!list[i].disabled && normalize(list[i].label).startsWith(this.typeahead)) {
        this.activeIndex.set(i);
        this.scrollActiveIntoView();
        return;
      }
    }
  }

  protected onTriggerKeydown(e: KeyboardEvent) {
    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        this.show();
        if (e.key === 'ArrowUp' && !this.selected()) this.move('last');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.show();
        if (!this.searchOn()) this.onTypeahead(e.key);
      }
      return;
    }
    this.handleOpenKey(e, false);
  }

  protected onPanelKeydown(e: KeyboardEvent) {
    if (e.target === this.searchRef()?.nativeElement) this.handleOpenKey(e, true);
    else if (e.key === 'Escape') {
      e.preventDefault();
      this.close(true);
    }
  }

  private handleOpenKey(e: KeyboardEvent, inSearch: boolean) {
    const page = 8;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (e.altKey) return;
        this.move(this.activeIndex() + 1, 1);
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) return this.choose(this.ordered()[this.activeIndex()]);
        this.move(this.activeIndex() - 1, -1);
        return;
      case 'PageDown':
        e.preventDefault();
        this.move(this.activeIndex() + page, 1);
        return;
      case 'PageUp':
        e.preventDefault();
        this.move(this.activeIndex() - page, -1);
        return;
      case 'Home':
      case 'End':
        if (inSearch) return; // nel campo di ricerca muovono il cursore
        e.preventDefault();
        this.move(e.key === 'Home' ? 'first' : 'last');
        return;
      case 'Enter':
        e.preventDefault();
        this.choose(this.ordered()[this.activeIndex()]);
        return;
      case ' ':
        if (inSearch) return;
        e.preventDefault();
        this.choose(this.ordered()[this.activeIndex()]);
        return;
      case 'Escape':
        e.preventDefault();
        this.close(true);
        return;
      case 'Tab': {
        const o = this.ordered()[this.activeIndex()];
        if (o && !o.disabled) this.value.set(o.value);
        if (inSearch) {
          e.preventDefault();
          this.close(true);
        } else this.close(false);
        return;
      }
      default:
        if (!inSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this.onTypeahead(e.key);
    }
  }
}
