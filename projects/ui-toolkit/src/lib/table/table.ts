import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
} from '@angular/core';
import { injectUiLabels } from '../util/labels';
import { uniqueId } from '../util/id';
import { injectLinkClick } from '../util/link';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- righe di qualsiasi forma
export interface TableColumn<T = any> {
  key: string;
  label: string;
  /** cella primaria: intestazione di riga, a tutta larghezza in stack, troncata in compatto, porta il link di riga */
  primary?: boolean;
  /** numeri: font-numeric, allineati a destra */
  numeric?: boolean;
  align?: 'start' | 'center' | 'end';
  width?: string;
  /** in stack si affianca alla cella primaria, senza etichetta (es. posizione in classifica) */
  leading?: boolean;
  /** valore della cella (default: row[key]) */
  value?: (row: T) => unknown;
  /** nascosta sotto 640px */
  hideOnMobile?: boolean;
  /** resta visibile a sinistra nello scroll orizzontale (es. il nome nelle tabelle larghe) */
  sticky?: boolean;
  /** classi aggiunte all'intestazione e alle celle della colonna */
  class?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableCellContext<T = any> {
  $implicit: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- valore della cella, di qualsiasi tipo
  value: any;
  column: TableColumn<T>;
  /** posizione della riga (-1 nella riga di totale) */
  index: number;
  /** true nella riga di totale (`footer`) */
  footer: boolean;
}

/** Contesto di `uiHeader`: la colonna. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableHeaderContext<T = any> {
  $implicit: TableColumn<T>;
}

/** Contesto di `uiRowDetail`: la riga espansa. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableRowDetailContext<T = any> {
  $implicit: T;
  index: number;
}

/** Template di cella custom: `<ng-template uiCell="squadra" let-row let-value="value">…</ng-template>` */
@Directive({ selector: 'ng-template[uiCell]' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TableCell<T = any> {
  readonly key = input.required<string>({ alias: 'uiCell' });
  readonly template = inject<TemplateRef<TableCellContext<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: TableCell<T>, ctx: unknown): ctx is TableCellContext<T> {
    return true;
  }
}

/** Intestazione custom di una colonna: `<ng-template uiHeader="squadra" let-column>…</ng-template>` */
@Directive({ selector: 'ng-template[uiHeader]' })
export class TableHeader {
  readonly key = input.required<string>({ alias: 'uiHeader' });
  readonly template = inject<TemplateRef<TableHeaderContext>>(TemplateRef);
  static ngTemplateContextGuard(_d: TableHeader, ctx: unknown): ctx is TableHeaderContext {
    return true;
  }
}

/**
 * Riga di dettaglio sotto una riga, a tutta larghezza, quando `rowExpanded(row)` è vero:
 * `<ng-template uiRowDetail let-row>…</ng-template>`
 */
@Directive({ selector: 'ng-template[uiRowDetail]' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TableRowDetail<T = any> {
  readonly template = inject<TemplateRef<TableRowDetailContext<T>>>(TemplateRef);
  static ngTemplateContextGuard<T>(_d: TableRowDetail<T>, ctx: unknown): ctx is TableRowDetailContext<T> {
    return true;
  }
}

/**
 * Tabella responsive.
 * - Da 640px: tabella vera (header 0.75rem/700 muted in frase, celle 0.75rem, divisori border, hover surface-sunken).
 * - Sotto 640px con `stack`: ogni riga è una card a griglia 2 colonne con label da data-label, cella primaria a tutta larghezza.
 * - Sotto 640px senza `stack`: righe compatte su una linea con la cella primaria troncata.
 * - Sotto 640px con `scrollable`: resta una tabella, con scroll orizzontale (tabelle dense; colonne `sticky` fisse).
 * - `rowLink`: un solo link esteso su tutta la riga (sulla cella primaria).
 * - `footer`: riga di totale in `<tfoot>`, con gli stessi template di cella (`footer: true` nel contesto).
 * - `uiHeader`: intestazioni custom; `uiRowDetail` + `rowExpanded`: riga di dettaglio espandibile.
 * - Backoffice: header sticky su surface-alt, zebra, hover row-hover, celle dense.
 */
@Component({
  selector: 'ui-table',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll" role="region" tabindex="0" [attr.aria-labelledby]="captionId">
      <table role="table" [class.stack]="stack() && !scrollable()" [class.compact]="!stack() && !scrollable()" [class.scrollable]="scrollable()" [class.linked]="!!rowLink()">
        <caption [id]="captionId" [class.sr-only]="!captionVisible()">{{ caption() }}</caption>
        <thead role="rowgroup">
          <tr role="row">
            @for (c of columns(); track c.key) {
              <th role="columnheader" scope="col" [class]="c.class ?? ''" [attr.data-align]="alignOf(c)" [style.width]="c.width ?? null" [class.hide-mobile]="c.hideOnMobile" [class.sticky]="c.sticky">
                @if (headers().get(c.key); as tpl) {
                  <ng-container *ngTemplateOutlet="tpl; context: { $implicit: c }" />
                } @else {
                  {{ c.label }}
                }
              </th>
            }
          </tr>
        </thead>
        <tbody role="rowgroup">
          @for (r of rows(); track keyOf(r, $index); let i = $index) {
            <tr role="row">
              @for (c of columns(); track c.key) {
                @if (c.primary) {
                  <th role="rowheader" scope="row" [class]="'primary ' + (c.class ?? '')" [attr.data-label]="c.label" [attr.data-align]="alignOf(c)" [class.num]="c.numeric" [class.hide-mobile]="c.hideOnMobile" [class.sticky]="c.sticky">
                    @if (linkOf(r); as href) {
                      <a class="row-link" [href]="href" (click)="linkClick(href, $event)"><ng-container *ngTemplateOutlet="cell; context: { r, c, i, f: false }" /></a>
                    } @else {
                      <ng-container *ngTemplateOutlet="cell; context: { r, c, i, f: false }" />
                    }
                  </th>
                } @else {
                  <td role="cell" [class]="c.class ?? ''" [attr.data-label]="c.label" [attr.data-align]="alignOf(c)" [class.num]="c.numeric" [class.leading]="c.leading" [class.hide-mobile]="c.hideOnMobile" [class.sticky]="c.sticky">
                    <ng-container *ngTemplateOutlet="cell; context: { r, c, i, f: false }" />
                  </td>
                }
              }
            </tr>
            @if (detail() && rowExpanded()?.(r)) {
              <tr role="row" class="detail">
                <td role="cell" [attr.colspan]="columns().length">
                  <ng-container *ngTemplateOutlet="detail()!.template; context: { $implicit: r, index: i }" />
                </td>
              </tr>
            }
          } @empty {
            <tr role="row" class="empty">
              <td role="cell" [attr.colspan]="columns().length">{{ emptyTextText() }}</td>
            </tr>
          }
        </tbody>
        @if (footer(); as f) {
          <tfoot role="rowgroup">
            <tr role="row" class="footer">
              @for (c of columns(); track c.key) {
                @if (c.primary) {
                  <th role="rowheader" scope="row" [class]="'primary ' + (c.class ?? '')" [attr.data-align]="alignOf(c)" [class.num]="c.numeric" [class.hide-mobile]="c.hideOnMobile" [class.sticky]="c.sticky">
                    <ng-container *ngTemplateOutlet="cell; context: { r: f, c, i: -1, f: true }" />
                  </th>
                } @else {
                  <td role="cell" [class]="c.class ?? ''" [attr.data-label]="c.label" [attr.data-align]="alignOf(c)" [class.num]="c.numeric" [class.hide-mobile]="c.hideOnMobile" [class.sticky]="c.sticky">
                    <ng-container *ngTemplateOutlet="cell; context: { r: f, c, i: -1, f: true }" />
                  </td>
                }
              }
            </tr>
          </tfoot>
        }
      </table>
    </div>

    <ng-template #cell let-r="r" let-c="c" let-i="i" let-f="f">
      @if (templates().get(c.key); as tpl) {
        <ng-container *ngTemplateOutlet="tpl; context: { $implicit: r, value: valueOf(r, c), column: c, index: i, footer: f }" />
      } @else {
        {{ valueOf(r, c) }}
      }
    </ng-template>
  `,
  host: { class: 'ui-table' },
  styles: `
    :host { display: block; min-width: 0; color: var(--ui-text); }
    @media (max-width: 639.98px) { .hide-mobile { display: none !important; } }
    .scroll { overflow-x: auto; border-radius: inherit; }
    .scroll:focus-visible { outline-offset: -3px; }
    table { width: 100%; border-collapse: collapse; font-size: var(--ui-font-size-sm); line-height: 1.25rem; }
    caption { text-align: start; padding: 0 0 0.75rem; font-size: var(--ui-type-card-title-size); font-weight: 800; }
    th, td { padding: var(--ui-table-cell-padding); text-align: start; vertical-align: middle; }
    th[data-align='end'], td[data-align='end'] { text-align: end; }
    th[data-align='center'], td[data-align='center'] { text-align: center; }
    thead th {
      position: var(--ui-table-header-position);
      top: 0;
      z-index: 1;
      background: var(--ui-table-header-bg);
      font-size: var(--ui-type-table-header-size);
      font-weight: var(--ui-type-table-header-weight);
      color: var(--ui-text-muted);
      border-bottom: 1px solid var(--ui-border);
      white-space: nowrap;
    }
    tbody tr { position: relative; transition: background-color var(--ui-duration-micro) var(--ui-ease); }
    tbody tr:nth-child(even) { background: var(--ui-row-zebra); }
    tbody td, tbody th { border-bottom: 1px solid var(--ui-border); }
    tbody tr:last-child > * { border-bottom: 0; }
    @media (hover: hover) { tbody tr:not(.empty):hover { background: var(--ui-row-hover); } }
    .primary { font-weight: 700; }
    .num { font-family: var(--ui-font-display); font-variant-numeric: tabular-nums; letter-spacing: var(--ui-tracking-numeric); font-weight: 700; font-size: var(--ui-font-size-base); }
    .row-link { color: inherit; text-decoration: none; }
    .row-link::after { content: ''; position: absolute; inset: 0; }
    .row-link:focus-visible { outline: none; }
    .row-link:focus-visible::after { outline: 3px solid var(--ui-focus); outline-offset: -3px; border-radius: inherit; }
    .empty td { text-align: center; color: var(--ui-text-muted); padding: 1.5rem 0.75rem; }
    tfoot th, tfoot td { border-top: 1px solid var(--ui-border-strong); font-weight: 800; }
    .detail td { background: var(--ui-surface-sunken); }
    .sticky { position: sticky; inset-inline-start: 0; z-index: 1; background: var(--ui-surface-solid); }
    thead th.sticky { z-index: 2; }

    @media (max-width: 639.98px) {
      table:not(.scrollable) thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
      table:not(.scrollable), table:not(.scrollable) tbody { display: block; }
      table:not(.scrollable) caption { display: block; }
      /* scrollable: resta una tabella, scorre in orizzontale */
      .scrollable { width: max-content; min-width: 100%; }
      .scrollable th, .scrollable td { white-space: nowrap; }
      /* stack: ogni riga una card a griglia 2 colonne */
      .stack tbody { display: grid; gap: 0.75rem; }
      .stack tbody tr {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem 0.75rem;
        padding: 0.75rem;
        border: 1px solid var(--ui-border);
        border-radius: var(--ui-radius-tile);
        background: var(--ui-surface-sunken);
      }
      .stack tbody tr > * { display: block; padding: 0; border: 0; text-align: start; }
      .stack tbody tr { position: relative; }
      .stack tbody .primary { grid-column: 1 / -1; font-size: var(--ui-font-size-base); }
      .stack tbody tr:has(.leading) .primary { padding-inline-start: 2rem; }
      .stack tbody td.leading { position: absolute; top: 0.75rem; inset-inline-start: 0.75rem; line-height: 1.5rem; }
      .stack tbody td.leading::before { content: none; }
      .stack tbody td::before {
        content: attr(data-label);
        display: block;
        font-family: var(--ui-font-sans);
        font-size: var(--ui-font-size-xs);
        font-weight: 700;
        color: var(--ui-text-muted);
      }
      /* compatto: una riga per linea, primaria troncata */
      .compact tbody tr { display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--ui-border); }
      .compact tbody tr:last-child { border-bottom: 0; }
      .compact tbody tr > * { display: block; border: 0; padding: 0.625rem 0; white-space: nowrap; }
      .compact tbody tr > *:first-child { padding-inline-start: 0.25rem; }
      .compact tbody tr > *:last-child { padding-inline-end: 0.25rem; }
      .compact tbody .primary { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      table:not(.scrollable) .empty { display: block !important; }
      table:not(.scrollable) .empty td { display: block; }
    }
  `,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Table<T = any> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  /** didascalia (obbligatoria per l'accessibilità), sr-only di default */
  readonly caption = input.required<string>();
  readonly captionVisible = input(false, { transform: booleanAttribute });
  readonly stack = input(false, { transform: booleanAttribute });
  /** sotto 640px resta una tabella con scroll orizzontale (tabelle dense), invece di card o righe compatte */
  readonly scrollable = input(false, { transform: booleanAttribute });
  /** riga di totale in `<tfoot>` (stesse colonne e template) */
  readonly footer = input<T | null>(null);
  /** righe con la riga di dettaglio `uiRowDetail` aperta */
  readonly rowExpanded = input<(row: T) => boolean>();
  /** chiave di riga: nome di proprietà o funzione (default: indice) */
  readonly rowKey = input<keyof T | ((row: T) => unknown)>();
  /** URL della riga (o i suoi segmenti, uniti con `/`): rende la riga navigabile con un solo link esteso */
  readonly rowLink = input<(row: T) => string | readonly (string | number)[] | null | undefined>();
  protected readonly uiLabels = injectUiLabels();
  readonly emptyText = input<string>();
  protected readonly emptyTextText = computed(() => this.emptyText() ?? this.uiLabels().tableEmpty);

  protected readonly captionId = uniqueId('ui-table-caption');
  protected readonly linkClick = injectLinkClick();
  private readonly cells = contentChildren(TableCell);
  private readonly headerTpls = contentChildren(TableHeader);
  protected readonly headers = computed(() => new Map(this.headerTpls().map((h) => [h.key(), h.template])));
  protected readonly detail = contentChild(TableRowDetail);
  protected readonly templates = computed(() => new Map(this.cells().map((c) => [c.key(), c.template as TemplateRef<TableCellContext<unknown>>])));

  protected keyOf(row: T, i: number): unknown {
    const k = this.rowKey();
    if (!k) return i;
    return typeof k === 'function' ? k(row) : row[k];
  }
  protected valueOf(row: T, c: TableColumn<T>): unknown {
    return c.value ? c.value(row) : (row as Record<string, unknown>)[c.key];
  }
  protected linkOf(row: T): string | null {
    const link = this.rowLink()?.(row);
    if (link == null) return null;
    return typeof link === 'string' ? link : link.map(String).join('/').replace(/\/{2,}/g, '/');
  }
  protected alignOf(c: TableColumn<T>) {
    return c.align ?? (c.numeric ? 'end' : 'start');
  }
}
