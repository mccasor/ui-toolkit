import { CdkDialogContainer, Dialog as CdkDialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy, type ComponentType } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injectable,
  Injector,
  TemplateRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  output,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Riesportati per i componenti aperti con DialogService. */
export { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { injectUiLabels } from '../util/labels';
import { uniqueId } from '../util/id';
import { applyThemeContext } from '../util/theme-context';

export interface UiDialogConfig<D = unknown> {
  data?: D;
  /** bottom sheet ancorato in basso; 'auto' = sheet sotto 640px */
  sheet?: boolean | 'auto';
  /** nome accessibile se il contenuto non usa `ui-dialog` con titolo */
  ariaLabel?: string;
  /** impedisce la chiusura con Esc / click sul backdrop */
  disableClose?: boolean;
  /** elemento da cui ereditare il tema (.bo / data-theme); default: elemento attivo */
  origin?: Element | null;
  /** dialog centrato largo min(64rem, 100vw − 2rem), per foto e video (ignorato nello sheet) */
  wide?: boolean;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  sheet?: boolean | 'auto';
}

export interface ChoiceOption<T> {
  value: T;
  label: string;
  description?: string;
  /** variante del bottone nel layout `buttons` (default secondary) */
  tone?: 'primary' | 'secondary' | 'danger';
}

export interface ChooseOptions<T> {
  title: string;
  message?: string;
  options: readonly ChoiceOption<T>[];
  cancelLabel?: string;
  sheet?: boolean | 'auto';
  /** `list` (default): opzioni come righe; `buttons`: bottoni nelle azioni dopo «Annulla» (es. Salva / Scarta) */
  layout?: 'list' | 'buttons';
}

/**
 * Servizio dialog: pannello glass su backdrop rgb(15 15 16 / .45) + blur 4px.
 * Dialog centrato min(32rem, 100vw − 2rem) con pop-in 220ms; sheet in basso (max 40rem, 90dvh,
 * angoli inferiori a 0, safe-area) con slide-up 260ms. Focus trap, Esc, ripristino del focus, aria-modal (CDK).
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly cdk = inject(CdkDialog);
  private readonly injector = inject(Injector);

  open<R = unknown, D = unknown, C = unknown>(content: ComponentType<C> | TemplateRef<C>, config: UiDialogConfig<D> = {}): DialogRef<R, C> {
    const origin = config.origin ?? (typeof document !== 'undefined' ? document.activeElement : null);
    const sheet = config.sheet === 'auto' ? typeof matchMedia === 'function' && matchMedia('(max-width: 639.98px)').matches : !!config.sheet;
    const position = sheet
      ? createGlobalPositionStrategy(this.injector).centerHorizontally().bottom('0')
      : createGlobalPositionStrategy(this.injector).centerHorizontally().centerVertically();
    const ref = this.cdk.open<R, D, C>(content, {
      data: config.data,
      hasBackdrop: true,
      backdropClass: 'ui-overlay-backdrop',
      panelClass: ['ui-dialog-pane', sheet ? 'ui-dialog-pane--sheet' : 'ui-dialog-pane--center'],
      positionStrategy: position,
      width: sheet ? '100%' : config.wide ? 'min(64rem, calc(100vw - 2rem))' : 'min(32rem, calc(100vw - 2rem))',
      maxWidth: sheet ? '40rem' : 'calc(100vw - 2rem)',
      maxHeight: sheet ? '90dvh' : 'calc(100dvh - 2rem)',
      ariaModal: true,
      ariaLabel: config.ariaLabel ?? null,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      disableClose: config.disableClose ?? false,
    });
    const pane = ref.overlayRef.overlayElement;
    if (origin) applyThemeContext(origin, pane);
    pane.querySelector('.cdk-dialog-container')?.classList.add('glass-strong', 'ui-dialog-surface');
    return ref;
  }

  /** Conferma → Promise<boolean> (Esc, backdrop e annulla = false). */
  async confirm(options: ConfirmOptions): Promise<boolean> {
    const ref = this.open<boolean, ConfirmOptions>(ConfirmDialog, { data: options, sheet: options.sheet });
    return (await firstValueFrom(ref.closed)) === true;
  }

  /** Scelta tra opzioni → valore scelto o null. */
  async choose<T>(options: ChooseOptions<T>): Promise<T | null> {
    const ref = this.open<{ value: T }, ChooseOptions<T>>(ChoiceDialog, { data: options as ChooseOptions<unknown> as ChooseOptions<T>, sheet: options.sheet ?? 'auto' });
    const r = await firstValueFrom(ref.closed);
    return r ? r.value : null;
  }

  /** Chiude tutti i dialog aperti (es. al cambio pagina). */
  closeAll(): void {
    this.cdk.closeAll();
  }
}

/** Azioni del dialog (allineate a destra, colonna su mobile). */
@Directive({ selector: '[uiDialogActions]', host: { class: 'ui-dialog-actions' } })
export class DialogActions {}

/**
 * Impaginazione standard del contenuto di un dialog: titolo (collegato come aria-labelledby),
 * descrizione opzionale, corpo e `[uiDialogActions]`.
 */
@Component({
  selector: 'ui-dialog',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head">
      <h2 class="title" [id]="titleId">{{ title() }}</h2>
      @if (closable()) {
        <button type="button" class="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm close" [attr.aria-label]="uiLabels().close" (click)="close()">
          <ui-icon name="close" />
        </button>
      }
    </header>
    @if (description()) {
      <p class="desc" [id]="descId">{{ description() }}</p>
    }
    <div class="body"><ng-content /></div>
    <ng-content select="[uiDialogActions]" />
  `,
  host: { class: 'ui-dialog' },
  styles: `
    :host { display: block; padding: var(--ui-card-padding-lg); color: var(--ui-text); }
    .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
    .title { margin: 0; font-size: var(--ui-type-card-title-size); font-weight: 800; line-height: 1.3; text-wrap: balance; }
    .close { margin: -0.375rem -0.5rem 0 0; }
    .desc { margin: 0.5rem 0 0; color: var(--ui-text-muted); font-size: var(--ui-font-size-sm); line-height: 1.25rem; }
    .body:not(:empty) { margin-top: 1rem; }
    :host ::ng-deep .ui-dialog-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
    @media (max-width: 639.98px) {
      :host ::ng-deep .ui-dialog-actions { flex-direction: column-reverse; }
      :host ::ng-deep .ui-dialog-actions > * { width: 100%; }
    }
  `,
})
export class DialogShell {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly closable = input(true, { transform: booleanAttribute });
  /** Emesso quando si preme il bottone di chiusura (il dialog CDK, se c'è, viene chiuso comunque). */
  readonly closed = output<void>();
  protected readonly uiLabels = injectUiLabels();
  protected readonly ref = inject(DialogRef, { optional: true });

  protected close(): void {
    this.closed.emit();
    this.ref?.close();
  }
  protected readonly titleId = uniqueId('ui-dialog-title');
  protected readonly descId = uniqueId('ui-dialog-desc');

  constructor() {
    const container = inject(CdkDialogContainer, { optional: true });
    container?._addAriaLabelledBy(this.titleId);
    // In zoneless il binding host del container CDK può non essere rivalutato: allinea l'attributo.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      const dialog = host.closest('[role="dialog"]');
      if (dialog && !dialog.getAttribute('aria-label')) dialog.setAttribute('aria-labelledby', this.titleId);
    });
  }
}

@Component({
  selector: 'ui-confirm-dialog',
  imports: [DialogShell, DialogActions, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-dialog [title]="data.title" [description]="data.message" [closable]="false">
      <div uiDialogActions>
        <button uiButton variant="secondary" (click)="ref.close(false)">{{ data.cancelLabel ?? uiLabels().cancel }}</button>
        <button uiButton [variant]="data.tone === 'danger' ? 'danger' : 'primary'" (click)="ref.close(true)">{{ data.confirmLabel ?? uiLabels().confirm }}</button>
      </div>
    </ui-dialog>
  `,
})
export class ConfirmDialog {
  protected readonly uiLabels = injectUiLabels();
  protected readonly data = inject<ConfirmOptions>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}

@Component({
  selector: 'ui-choice-dialog',
  imports: [DialogShell, DialogActions, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-dialog [title]="data.title" [description]="data.message">
      @if (data.layout !== 'buttons') {
      <ul class="choices">
        @for (o of data.options; track $index) {
          <li>
            <button type="button" class="choice" (click)="ref.close({ value: o.value })">
              <span class="label">{{ o.label }}</span>
              @if (o.description) {
                <span class="desc">{{ o.description }}</span>
              }
            </button>
          </li>
        }
      </ul>
      }
      <div uiDialogActions>
        <button uiButton variant="ghost" (click)="ref.close()">{{ data.cancelLabel ?? uiLabels().cancel }}</button>
        @if (data.layout === 'buttons') {
          @for (o of data.options; track $index) {
            <button uiButton [variant]="o.tone ?? 'secondary'" (click)="ref.close({ value: o.value })">{{ o.label }}</button>
          }
        }
      </div>
    </ui-dialog>
  `,
  styles: `
    .choices { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
    .choice {
      display: grid;
      width: 100%;
      min-height: var(--ui-touch-target);
      padding: 0.625rem 0.875rem;
      box-sizing: border-box;
      text-align: start;
      border: 1px solid var(--ui-border-strong);
      border-radius: var(--ui-radius-control);
      background: var(--ui-surface-strong);
      color: var(--ui-text);
      font: inherit;
      cursor: pointer;
      transition: background-color var(--ui-duration-micro) var(--ui-ease);
    }
    @media (hover: hover) { .choice:hover { background: var(--ui-surface-solid); } }
    .choice:active { transform: scale(var(--ui-press-scale)); }
    .label { font-weight: 700; }
    .desc { font-size: var(--ui-font-size-sm); line-height: 1.25rem; color: var(--ui-text-muted); }
  `,
})
export class ChoiceDialog<T> {
  protected readonly uiLabels = injectUiLabels();
  protected readonly data = inject<ChooseOptions<T>>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<{ value: T }>>(DialogRef);
}
