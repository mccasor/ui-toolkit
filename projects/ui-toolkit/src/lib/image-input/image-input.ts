import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, input, model, numberAttribute, signal, viewChild } from '@angular/core';
import { Avatar, TeamLogo } from '../avatar/avatar';
import { Button } from '../button/button';
import { Field, FieldInput } from '../field/field';
import { uniqueId } from '../util/id';

/**
 * Immagine da file (ridimensionata nel browser) o da URL, con anteprima `circle` (Avatar) o `square` (TeamLogo),
 * azione "Rimuovi" ed errori mostrati nel Field. Il valore è un data URL (file) o l'URL incollato.
 */
@Component({
  selector: 'ui-image-input',
  imports: [Field, FieldInput, Avatar, TeamLogo, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-field [label]="label()" [hint]="hint()" [error]="error()" [required]="required()">
      <div class="row">
        @if (shape() === 'circle') {
          <ui-avatar [name]="previewName()" [src]="value()" size="xl" decorative />
        } @else {
          <ui-team-logo [name]="previewName()" [src]="value()" size="xl" decorative />
        }
        <div class="actions">
          <label class="ui-btn ui-btn--secondary ui-btn--sm file">
            <input #file type="file" class="sr-only" [accept]="accept()" [attr.aria-describedby]="statusId" (change)="onFile($event)" />
            {{ busy() ? 'Elaborazione…' : uploadLabel() }}
          </label>
          <button uiButton variant="ghost" size="sm" [disabled]="!value()" (click)="remove()">{{ removeLabel() }}</button>
          <span class="sr-only" [id]="statusId" aria-live="polite">{{ value() ? previewText() : '' }}</span>
        </div>
      </div>
      <input uiInput type="url" inputmode="url" class="url" [placeholder]="urlPlaceholder()" [value]="urlDraft()" (change)="onUrl($any($event.target).value)" />
    </ui-field>
  `,
  host: { class: 'ui-image-input' },
  styles: `
    :host { display: block; }
    .row { display: flex; align-items: center; gap: 1rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .file:focus-within { outline: 3px solid var(--ui-focus); outline-offset: 2px; }
    .url { margin-top: 0.25rem; }
  `,
})
export class ImageInput {
  readonly label = input('Immagine');
  readonly hint = input<string>('JPG, PNG o WebP, oppure incolla un URL');
  readonly required = input(false, { transform: booleanAttribute });
  readonly shape = input<'circle' | 'square'>('circle');
  /** nome per le iniziali dell'anteprima vuota */
  readonly name = input<string>('');
  readonly value = model<string | null>(null);
  /** lato massimo in px dopo il ridimensionamento */
  readonly maxSize = input(512, { transform: numberAttribute });
  /** dimensione massima del file originale (byte) */
  readonly maxBytes = input(10 * 1024 * 1024, { transform: numberAttribute });
  readonly accept = input('image/png,image/jpeg,image/webp,image/gif');
  readonly uploadLabel = input('Carica immagine');
  readonly removeLabel = input('Rimuovi');
  readonly urlPlaceholder = input('https://…');

  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly urlDraft = signal('');
  protected readonly statusId = uniqueId('ui-image-status');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('file');

  protected previewName() {
    return this.name() || this.label();
  }
  protected previewText() {
    return `Immagine impostata per ${this.previewName()}`;
  }

  protected async onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.error.set(null);
    if (!file.type.startsWith('image/')) return this.fail('Il file scelto non è un’immagine.');
    if (file.size > this.maxBytes()) return this.fail(`Immagine troppo grande (max ${Math.round(this.maxBytes() / 1048576)} MB).`);
    this.busy.set(true);
    try {
      this.value.set(await resizeImage(file, this.maxSize()));
      this.urlDraft.set('');
    } catch {
      this.fail('Impossibile leggere l’immagine.');
    } finally {
      this.busy.set(false);
      this.fileInput().nativeElement.value = '';
    }
  }

  protected async onUrl(raw: string) {
    const url = raw.trim();
    this.urlDraft.set(url);
    this.error.set(null);
    if (!url) return;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return this.fail('Inserisci un URL valido (https://…).');
    }
    if (!/^https?:$/.test(parsed.protocol)) return this.fail('Sono ammessi solo URL http o https.');
    this.busy.set(true);
    const ok = await canLoad(url);
    this.busy.set(false);
    if (!ok) return this.fail('Impossibile caricare l’immagine da questo URL.');
    this.value.set(url);
  }

  remove() {
    this.value.set(null);
    this.urlDraft.set('');
    this.error.set(null);
  }

  private fail(msg: string) {
    this.error.set(msg);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canLoad(url: string): Promise<boolean> {
  return loadImage(url).then(
    () => true,
    () => false,
  );
}

/** Ridimensiona nel browser (lato massimo `max`) e ricodifica in WebP (fallback JPEG/PNG). */
export async function resizeImage(file: Blob, max: number): Promise<string> {
  const src = URL.createObjectURL(file);
  try {
    const img = await loadImage(src);
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    const webp = canvas.toDataURL('image/webp', 0.85);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(src);
  }
}
