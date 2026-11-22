import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UI_IMAGE_RESOLVER } from '../util/image-resolver';
import { provideUiLabels } from '../util/labels';
import { IMAGE_RESIZER, ImageInput as ImageInputComponent } from './image-input';
import { ImageResizeError, type ResizeOptions } from './resize-image';

@Component({
  imports: [ImageInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-image-input label="Logo" hint="PNG o JPG" previewName="Leoni" [keepValue]="isRef" [shape]="shape()" [size]="256" mime="image/png"
                    [maxChars]="maxChars()" fit="contain" [resizer]="resizer()" [(value)]="value" (busyChange)="busy.set($event)" />
  `,
})
class ModelHost {
  readonly value = signal('');
  readonly shape = signal<'square' | 'circle'>('square');
  readonly maxChars = signal(1000);
  readonly resizer = signal<((file: Blob) => Promise<string>) | undefined>(undefined);
  readonly busy = signal(false);
  readonly isRef = (v: string) => v.startsWith('asset:');
}

describe('ImageInputComponent', () => {
  let resizer: ReturnType<typeof vi.fn>;
  const flush = () => new Promise((r) => setTimeout(r));

  async function render<T>(host: new () => T, setup?: (h: T) => void) {
    resizer = vi.fn().mockResolvedValue('data:image/png;base64,RESIZED');
    TestBed.configureTestingModule({ providers: [{ provide: IMAGE_RESIZER, useValue: resizer }] });
    const fixture = TestBed.createComponent(host);
    setup?.(fixture.componentInstance);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const stable = async () => { await flush(); await fixture.whenStable(); };
    const tab = (label: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((t) => t.textContent?.trim() === label)!;
    const button = (label: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim() === label);
    const urlInput = () => el.querySelector<HTMLInputElement>('input[type="url"]');
    const fileInput = () => el.querySelector<HTMLInputElement>('input[type="file"]');
    const alerts = () => [...el.querySelectorAll('[role="alert"]')].map((a) => a.textContent!.trim());
    const previewImg = () => el.querySelector<HTMLImageElement>('ui-team-logo img, ui-avatar img');
    const typeUrl = async (value: string) => {
      const input = urlInput()!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await stable();
    };
    const pick = async (file: File) => {
      const input = fileInput()!;
      Object.defineProperty(input, 'files', { value: [file], configurable: true });
      input.dispatchEvent(new Event('change'));
      await stable();
    };
    return { fixture, host: fixture.componentInstance, el, stable, tab, button, urlInput, fileInput, alerts, previewImg, typeUrl, pick };
  }

  const png = () => new File(['x'], 'logo.png', { type: 'image/png' });

  it('renders a labelled group with a "Carica file" / "URL" switch, starting on file mode when empty', async () => {
    const { el, tab, fileInput, urlInput } = await render(ModelHost);
    expect(el.querySelector('legend')?.textContent).toContain('Logo');
    expect(el.textContent).toContain('PNG o JPG');
    expect(tab('Carica file').getAttribute('aria-selected')).toBe('true');
    expect(tab('URL').getAttribute('aria-selected')).toBe('false');
    expect(fileInput()?.accept).toBe('image/*');
    expect(urlInput()).toBeNull();
  });

  it('starts on URL mode when the value is an http(s) URL, on file mode for a data URL', async () => {
    let r = await render(ModelHost, (h) => h.value.set('https://x.it/a.png'));
    expect(r.tab('URL').getAttribute('aria-selected')).toBe('true');
    expect(r.urlInput()?.value).toBe('https://x.it/a.png');
    TestBed.resetTestingModule();
    r = await render(ModelHost, (h) => h.value.set('data:image/png;base64,AAA'));
    expect(r.tab('Carica file').getAttribute('aria-selected')).toBe('true');
  });

  it('keeps an app value accepted by keepValue: previewed from its asset, valid, not shown as URL text', async () => {
    const cache = new Map<string, string>();
    const resolve = vi.fn(async (src: string) => (cache.set(src, 'data:image/png;base64,STORED'), cache.get(src)));
    TestBed.configureTestingModule({ providers: [{ provide: UI_IMAGE_RESOLVER, useValue: { handles: (src: string) => src.startsWith('asset:'), peek: (src: string) => cache.get(src), resolve } }] });
    const { host, tab, stable, urlInput, alerts, previewImg } = await render(ModelHost, (h) => h.value.set('asset:team/t1#5'));
    await stable();
    expect(tab('Carica file').getAttribute('aria-selected')).toBe('true');
    expect(previewImg()?.getAttribute('src')).toBe('data:image/png;base64,STORED');
    expect(resolve).toHaveBeenCalledWith('asset:team/t1#5');
    expect(alerts()).toEqual([]);
    tab('URL').click();
    await stable();
    expect(urlInput()!.value).toBe('');
    expect(host.value()).toBe('asset:team/t1#5');
  });

  it('switches mode without losing the value', async () => {
    const { host, tab, stable, urlInput, fileInput } = await render(ModelHost, (h) => h.value.set('data:image/png;base64,AAA'));
    tab('URL').click();
    await stable();
    expect(urlInput()).not.toBeNull();
    expect(urlInput()!.value).toBe(''); // a data URL from a file is not shown as text
    expect(fileInput()).toBeNull();
    expect(host.value()).toBe('data:image/png;base64,AAA');
  });

  it('turns a picked file into the resized data URL, with the configured options, and previews it', async () => {
    const { host, pick, previewImg } = await render(ModelHost);
    const file = png();
    await pick(file);
    expect(resizer).toHaveBeenCalledWith(file, expect.objectContaining<Partial<ResizeOptions>>({
      size: 256, mime: 'image/png', maxChars: 1000, fit: 'contain',
    }));
    expect(host.value()).toBe('data:image/png;base64,RESIZED');
    expect(previewImg()?.getAttribute('src')).toBe('data:image/png;base64,RESIZED');
  });

  it('uses the [resizer] input over the injected one and reports the busy state', async () => {
    let resolve!: (v: string) => void;
    const own = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const { host, pick, stable } = await render(ModelHost, (h) => h.resizer.set(own));
    const pending = pick(png());
    await stable();
    expect(host.busy()).toBe(true);
    resolve('data:image/jpeg;base64,OWN');
    await pending;
    await stable();
    expect(own).toHaveBeenCalled();
    expect(resizer).not.toHaveBeenCalled();
    expect(host.value()).toBe('data:image/jpeg;base64,OWN');
    expect(host.busy()).toBe(false);
  });

  it('accepts a dropped image file', async () => {
    const { host, el, stable } = await render(ModelHost);
    const zone = el.querySelector('[data-dropzone]')!;
    const drop = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: unknown };
    drop.dataTransfer = { files: [png()] };
    zone.dispatchEvent(drop);
    await stable();
    expect(host.value()).toBe('data:image/png;base64,RESIZED');
  });

  it('rejects a non-image file in Italian, keeping the previous value', async () => {
    const { host, pick, alerts } = await render(ModelHost, (h) => h.value.set('data:image/png;base64,OLD'));
    await pick(new File(['x'], 'a.pdf', { type: 'application/pdf' }));
    expect(resizer).not.toHaveBeenCalled();
    expect(alerts()).toContain('Il file scelto non è un\'immagine.');
    expect(host.value()).toBe('data:image/png;base64,OLD');
  });

  it("uses the app's labels: modes, actions and errors", async () => {
    TestBed.configureTestingModule({ providers: [provideUiLabels({
      imageModeFile: 'Upload file', imageChoose: 'Choose image', imageErrorValueTooLarge: 'Image too large: {max} characters at most.',
      imageErrorNotImage: "The chosen file isn't an image.", imageErrorTooLarge: 'The image is too large even after resizing: try a simpler image.',
    })] });
    const r = await render(ModelHost);
    expect(r.tab('Upload file')).toBeDefined();
    expect(r.button('Choose image')).toBeDefined();
    r.host.maxChars.set(1500);
    r.host.value.set('data:image/png;base64,' + 'A'.repeat(2000));
    await r.stable();
    expect(r.alerts()).toContain(`Image too large: ${(1500).toLocaleString()} characters at most.`);
    await r.pick(new File(['x'], 'a.pdf', { type: 'application/pdf' }));
    expect(r.alerts()).toContain("The chosen file isn't an image.");
    resizer.mockRejectedValueOnce(new ImageResizeError('Immagine troppo pesante.', 'tooLarge'));
    await r.pick(png());
    expect(r.alerts()).toContain('The image is too large even after resizing: try a simpler image.');

  });

  it('shows the resizer error message, or a generic one', async () => {
    const r = await render(ModelHost);
    resizer.mockRejectedValueOnce(new ImageResizeError('Immagine troppo pesante.'));
    await r.pick(png());
    expect(r.alerts()).toContain('Immagine troppo pesante.');
    resizer.mockRejectedValueOnce(new Error('boom'));
    await r.pick(png());
    expect(r.alerts()).toContain('Impossibile elaborare l\'immagine. Prova con un altro file.');
    expect(r.host.value()).toBe('');
  });

  it('accepts an http(s) URL and previews it', async () => {
    const { host, tab, stable, typeUrl, previewImg, alerts } = await render(ModelHost);
    tab('URL').click();
    await stable();
    await typeUrl('https://x.it/logo.png');
    expect(host.value()).toBe('https://x.it/logo.png');
    expect(previewImg()?.getAttribute('src')).toBe('https://x.it/logo.png');
    expect(alerts()).toEqual([]);
    await typeUrl('http://x.it/logo.png');
    expect(host.value()).toBe('http://x.it/logo.png');
  });

  it('flags an invalid URL accessibly and does not preview it', async () => {
    const { tab, stable, typeUrl, previewImg, alerts, urlInput } = await render(ModelHost);
    tab('URL').click();
    await stable();
    await typeUrl('javascript:alert(1)');
    expect(alerts()).toContain('Inserisci un URL valido (http o https)');
    expect(urlInput()!.getAttribute('aria-invalid')).toBe('true');
    expect(urlInput()!.getAttribute('aria-describedby')).toContain(document.querySelector('[role="alert"]')!.id);
    expect(previewImg()).toBeNull();
  });

  it('shows an error when the URL image fails to load, cleared by a new URL', async () => {
    const { tab, stable, typeUrl, previewImg, alerts } = await render(ModelHost);
    tab('URL').click();
    await stable();
    await typeUrl('https://x.it/missing.png');
    previewImg()!.dispatchEvent(new Event('error'));
    await stable();
    expect(alerts()).toContain('Impossibile caricare l\'immagine da questo indirizzo.');
    await typeUrl('https://x.it/other.png');
    expect(alerts()).toEqual([]);
  });

  it('accepts a pasted data URL as-is when within maxChars, rejects a larger one', async () => {
    const { host, tab, stable, typeUrl, urlInput, alerts } = await render(ModelHost);
    tab('URL').click();
    await stable();
    await typeUrl('data:image/png;base64,QUJD');
    expect(host.value()).toBe('data:image/png;base64,QUJD');
    expect(urlInput()!.value).toBe('data:image/png;base64,QUJD');
    expect(alerts()).toEqual([]);
    await typeUrl('data:image/png;base64,' + 'A'.repeat(2000));
    expect(alerts()).toContain('Immagine troppo pesante: massimo 1000 caratteri.');
  });

  it('removes the image with "Rimuovi"', async () => {
    const { host, button, stable, previewImg } = await render(ModelHost, (h) => h.value.set('data:image/png;base64,OLD'));
    button('Rimuovi')!.click();
    await stable();
    expect(host.value()).toBe('');
    expect(previewImg()).toBeNull();
    expect(button('Rimuovi')).toBeUndefined();
  });

  it('previews as a circle (ui-avatar) or a rounded square (ui-team-logo)', async () => {
    const { el, host, stable } = await render(ModelHost, (h) => h.value.set('data:image/png;base64,A'));
    expect(el.querySelector('ui-team-logo')).not.toBeNull();
    host.shape.set('circle');
    await stable();
    expect(el.querySelector('ui-avatar img')?.getAttribute('src')).toBe('data:image/png;base64,A');
    expect(el.querySelector('ui-team-logo')).toBeNull();
  });

});
