import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { Avatar, TeamLogo, type AvatarSize } from '../avatar/avatar';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { Segmented, type SegmentedOption } from '../segmented/segmented';
import { uniqueId } from '../util/id';
import { injectUiLabels, type UiLabels } from '../util/labels';
import { ImageResizeError, isDataImageUrl, isHttpUrl, resizeImage, type ImageMime, type ResizeOptions } from './resize-image';

export * from './resize-image';

/** Trasforma il file scelto nel data URL salvato; sostituibile nei test (jsdom non ha canvas). */
export type ImageResizer = (file: Blob, options: ResizeOptions) => Promise<string>;

export const IMAGE_RESIZER = new InjectionToken<ImageResizer>('IMAGE_RESIZER', {
  providedIn: 'root',
  factory: () => (file: Blob, options: ResizeOptions) => resizeImage(file, options),
});

type Mode = 'file' | 'url';
type ErrorKey = keyof UiLabels & `imageError${string}`;
const CODE_KEYS: Record<string, ErrorKey> = {
  notImage: 'imageErrorNotImage',
  unreadable: 'imageErrorUnreadable',
  noCanvas: 'imageErrorNoCanvas',
  tooLarge: 'imageErrorTooLarge',
};

/**
 * Immagine da file (ridimensionata nel browser in un data URL: `size`, `mime`, `fit`, `maxChars`/`targetChars`) o da
 * URL http(s) (anche un data URL incollato), con anteprima `square` (TeamLogo) o `circle` (Avatar), trascinamento del
 * file e «Rimuovi». Valore: '' (nessuna), URL, data URL, oppure un valore dell'app riconosciuto da `keepValue`
 * (es. il riferimento di un'immagine già salvata: mostrato, valido e lasciato com'è).
 */
@Component({
  selector: 'ui-image-input',
  imports: [Avatar, TeamLogo, Button, Icon, Segmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset [disabled]="disabled()" class="box">
      <legend class="legend">
        {{ labelText() }}
        @if (required()) {
          <span class="req" aria-hidden="true">*</span>
        }
      </legend>
      <div class="row">
        @if (shape() === 'circle') {
          <ui-avatar [name]="previewAlt()" [src]="previewSrc()" [color]="previewColor()" [size]="previewSize()" (imageError)="onLoadError()" />
        } @else {
          <ui-team-logo [name]="previewAlt()" [src]="previewSrc()" [color]="previewColor()" [size]="previewSize()" (imageError)="onLoadError()" />
        }
        <div class="side">
          <ui-segmented class="modes" [options]="modes()" [value]="mode()" (valueChange)="setMode($event)" [ariaLabel]="fill(uiLabels().imageSource)" />
          <div [id]="panelId" role="tabpanel" class="panel">
            @if (mode() === 'file') {
              <div class="drop" data-dropzone [class.over]="dragOver()" (dragover)="onDragOver($event)" (dragleave)="dragOver.set(false)" (drop)="onDrop($event)">
                <input #picker type="file" [accept]="accept()" class="sr-only" tabindex="-1" aria-hidden="true" (change)="onPick(picker)" />
                <button uiButton variant="secondary" size="sm" [loading]="busy()" [attr.aria-describedby]="describedBy()" (click)="picker.click()">
                  <ui-icon [name]="value() ? 'edit' : 'plus'" [size]="16" />{{ value() ? uiLabels().imageChange : uiLabels().imageChoose }}
                </button>
                <span class="muted">{{ uiLabels().imageDrop }}</span>
              </div>
            } @else {
              <input
                class="ui-input"
                type="url"
                inputmode="url"
                autocomplete="off"
                placeholder="https://…"
                [attr.aria-label]="fill(uiLabels().imageAddress)"
                [value]="urlText()"
                [attr.aria-invalid]="error() ? 'true' : null"
                [attr.aria-describedby]="describedBy()"
                (input)="onUrlInput($any($event.target).value)"
                (blur)="touch.emit()"
              />
            }
          </div>
          @if (value()) {
            <button uiButton variant="ghost" size="sm" class="remove" (click)="remove()">
              <ui-icon name="trash" [size]="16" />{{ removeLabelText() }}
            </button>
          }
        </div>
      </div>
      @if (hint()) {
        <p class="muted" [id]="hintId">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="error" [id]="errorId" role="alert"><ui-icon name="alert" [size]="16" />{{ error() }}</p>
      }
    </fieldset>
  `,
  host: { class: 'ui-image-input' },
  styles: `
    :host { display: block; }
    .box { border: 0; margin: 0; padding: 0; min-width: 0; display: flex; flex-direction: column; gap: 0.375rem; }
    .box:disabled { opacity: 0.6; }
    .legend { padding: 0; margin-bottom: 0.375rem; font-size: var(--ui-font-size-sm); font-weight: 600; color: var(--ui-text); }
    .req { color: var(--ui-danger-text); margin-inline-start: 0.125rem; }
    .row { display: flex; align-items: flex-start; gap: 1rem; }
    .side { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 0; }
    .modes { width: fit-content; max-width: 100%; }
    .panel { display: flex; flex-direction: column; gap: 0.5rem; }
    .drop {
      display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; padding: 0.25rem;
      border: 1.5px dashed transparent; border-radius: var(--ui-radius-control);
      transition: border-color var(--ui-duration-micro) var(--ui-ease), background-color var(--ui-duration-micro) var(--ui-ease);
    }
    .drop.over { border-color: var(--ui-accent-text); background: var(--ui-surface-sunken); }
    .remove { align-self: flex-start; }
    .muted { margin: 0; font-size: var(--ui-font-size-sm); color: var(--ui-text-muted); }
    .error { margin: 0; display: flex; align-items: center; gap: 0.375rem; font-size: var(--ui-font-size-sm); font-weight: 600; color: var(--ui-danger-text); }
  `,
})
export class ImageInput {
  protected readonly uiLabels = injectUiLabels();

  readonly value = model('');
  readonly label = input<string>();
  protected readonly labelText = computed(() => this.label() ?? this.uiLabels().image);
  readonly hint = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  /** Errore esterno (es. validazione del form), mostrato se il campo non ne ha uno suo. */
  readonly externalError = input<string | null | undefined>(undefined, { alias: 'error' });
  /** Lato dell'immagine ridimensionata, in px. */
  readonly size = input(256, { transform: numberAttribute });
  readonly mime = input<ImageMime>('image/png');
  /** Limite massimo del data URL salvato (file ridimensionati e data URL incollati). */
  readonly maxChars = input(200_000, { transform: numberAttribute });
  /** Lunghezza preferita del file ridimensionato (qualità ridotta fino a starci); default `maxChars`. */
  readonly targetChars = input<number | undefined>(undefined);
  readonly fit = input<'cover' | 'contain' | 'scale'>('contain');
  readonly background = input<string | undefined>(undefined);
  readonly accept = input('image/*');
  /** Anteprima: `square` (TeamLogo, stemmi) o `circle` (Avatar, persone). */
  readonly shape = input<'circle' | 'square'>('square');
  readonly previewSize = input<AvatarSize>('xl');
  /** Nome per le iniziali dell'anteprima vuota (default: l'etichetta). */
  readonly previewName = input<string>();
  readonly previewColor = input<string | null | undefined>(undefined);
  /** Valori dell'app da accettare così come sono (es. il riferimento di un'immagine già salvata). */
  readonly keepValue = input<(value: string) => boolean>(() => false);
  /** Sostituisce l'`IMAGE_RESIZER` iniettato (le opzioni sono allora ignorate). */
  readonly resizer = input<((file: Blob) => Promise<string>) | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly removeLabel = input<string>();
  protected readonly removeLabelText = computed(() => this.removeLabel() ?? this.uiLabels().imageRemove);
  /** true mentre un file viene ridimensionato. */
  readonly busyChange = output<boolean>();
  /** L'utente ha lasciato il campo o ha cambiato l'immagine (per segnare il campo come toccato). */
  readonly touch = output<void>();

  private readonly defaultResizer = inject(IMAGE_RESIZER);
  protected readonly panelId = uniqueId('ui-image-panel');
  protected readonly hintId = uniqueId('ui-image-hint');
  protected readonly errorId = uniqueId('ui-image-error');

  protected readonly modes = computed<SegmentedOption[]>(() => [
    { value: 'file', label: this.uiLabels().imageModeFile, controls: this.panelId },
    { value: 'url', label: this.uiLabels().imageModeUrl, controls: this.panelId },
  ]);
  protected readonly previewAlt = computed(() => this.previewName() || this.labelText());

  /** Ultimo valore scritto da questo componente, per distinguerlo da quelli del genitore. */
  private ownValue: string | null = null;
  /** Ultimo testo scritto nel campo URL. */
  private typed: string | null = null;

  /** URL per un valore http(s), altrimenti file; resta com'è mentre si scrive (un URL a metà non cambia modalità). */
  protected readonly mode = linkedSignal<string, Mode>({
    source: this.value,
    computation: (v, prev) => (prev && v === this.ownValue ? prev.value : isHttpUrl(v) ? 'url' : 'file'),
  });
  /** Testo del campo URL: il valore, tranne un data URL da file o un valore dell'app. */
  protected readonly urlText = linkedSignal(() => {
    const v = this.value();
    return v === this.typed || !(isDataImageUrl(v) || this.keepValue()(v)) ? v : '';
  });
  private readonly fileError = signal<ErrorKey | { text: string } | null>(null);
  private readonly loadFailed = linkedSignal({ source: this.value, computation: () => false });
  protected readonly busy = signal(false);
  protected readonly dragOver = signal(false);

  private readonly valueError = computed(() => {
    const v = this.value().trim();
    if (!v || isHttpUrl(v) || this.keepValue()(v)) return null;
    if (!isDataImageUrl(v)) return this.uiLabels().imageErrorInvalidUrl;
    return v.length > this.maxChars() ? this.uiLabels().imageErrorValueTooLarge.replace('{max}', this.maxChars().toLocaleString()) : null;
  });
  /** URL http(s) validi, data URL d'immagine (anche troppo pesanti, con l'errore) e valori dell'app. */
  protected readonly previewSrc = computed(() => {
    const v = this.value().trim();
    return isHttpUrl(v) || isDataImageUrl(v) || this.keepValue()(v) ? v : null;
  });
  protected readonly error = computed(() => {
    const f = this.fileError();
    const fileText = !f ? null : typeof f === 'string' ? this.uiLabels()[f] : f.text;
    return fileText ?? this.valueError() ?? (this.loadFailed() ? this.uiLabels().imageErrorLoadFailed : null) ?? this.externalError() ?? null;
  });
  protected readonly describedBy = computed(() => [this.hint() ? this.hintId : '', this.error() ? this.errorId : ''].filter(Boolean).join(' ') || null);

  protected fill(text: string): string {
    return text.replace('{label}', this.labelText());
  }

  protected setMode(mode: string | null): void {
    if (mode) this.mode.set(mode as Mode);
    this.fileError.set(null);
  }

  private emit(v: string): void {
    this.ownValue = v;
    this.value.set(v);
  }

  protected onUrlInput(text: string): void {
    this.typed = text;
    this.fileError.set(null);
    this.emit(text);
  }

  protected onLoadError(): void {
    if (isHttpUrl(this.value())) this.loadFailed.set(true);
  }

  protected onPick(picker: HTMLInputElement): void {
    const file = picker.files?.[0];
    picker.value = '';
    if (file) void this.useFile(file);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.dragOver.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && !this.disabled()) void this.useFile(file);
  }

  private async useFile(file: File): Promise<void> {
    this.fileError.set(null);
    if (!file.type.startsWith('image/')) {
      this.fileError.set('imageErrorNotImage');
      return;
    }
    this.setBusy(true);
    try {
      const own = this.resizer();
      const url = own
        ? await own(file)
        : await this.defaultResizer(file, {
            size: this.size(),
            mime: this.mime(),
            maxChars: this.maxChars(),
            targetChars: this.targetChars(),
            fit: this.fit(),
            background: this.background(),
          });
      this.emit(url);
    } catch (e) {
      this.fileError.set(e instanceof ImageResizeError ? (e.code ? CODE_KEYS[e.code] : { text: e.message }) : 'imageErrorGeneric');
    } finally {
      this.setBusy(false);
      this.touch.emit();
    }
  }

  private setBusy(busy: boolean): void {
    this.busy.set(busy);
    this.busyChange.emit(busy);
  }

  protected remove(): void {
    this.fileError.set(null);
    this.typed = null;
    this.emit('');
    this.touch.emit();
  }
}
