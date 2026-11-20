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
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Button } from '../button/button';
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
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
}

export interface ChoiceOption<T> {
  value: T;
  label: string;
  description?: string;
}

export interface ChooseOptions<T> {
  title: string;
  message?: string;
  options: readonly ChoiceOption<T>[];
  cancelLabel?: string;
  sheet?: boolean | 'auto';
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
      width: sheet ? '100%' : 'min(32rem, calc(100vw - 2rem))',
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
    const ref = this.open<boolean, ConfirmOptions>(ConfirmDialog, { data: options });
    return (await firstValueFrom(ref.closed)) === true;
  }

  /** Scelta tra opzioni → valore scelto o null. */
  async choose<T>(options: ChooseOptions<T>): Promise<T | null> {
    const ref = this.open<{ value: T }, ChooseOptions<T>>(ChoiceDialog, { data: options as ChooseOptions<unknown> as ChooseOptions<T>, sheet: options.sheet ?? 'auto' });
    const r = await firstValueFrom(ref.closed);
    return r ? r.value : null;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head">
      <h2 class="title" [id]="titleId">{{ title() }}</h2>
      @if (closable()) {
        <button type="button" class="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm close" aria-label="Chiudi" (click)="ref?.close()">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
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
  protected readonly ref = inject(DialogRef, { optional: true });
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
        <button uiButton variant="secondary" (click)="ref.close(false)">{{ data.cancelLabel ?? 'Annulla' }}</button>
        <button uiButton [variant]="data.tone === 'danger' ? 'danger' : 'primary'" (click)="ref.close(true)">{{ data.confirmLabel ?? 'Conferma' }}</button>
      </div>
    </ui-dialog>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmOptions>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}

@Component({
  selector: 'ui-choice-dialog',
  imports: [DialogShell, DialogActions, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-dialog [title]="data.title" [description]="data.message">
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
      <div uiDialogActions>
        <button uiButton variant="ghost" (click)="ref.close()">{{ data.cancelLabel ?? 'Annulla' }}</button>
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
  protected readonly data = inject<ChooseOptions<T>>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<{ value: T }>>(DialogRef);
}
