import { ImageResizeError, resizeImage, type ImageDeps, type ResizeOptions } from './resize-image';

describe('resizeImage', () => {
  const file = (type = 'image/png') => new File([new Uint8Array(100)], 'a.png', { type });

  /** `encode(type, quality)` returns the data URL produced by the mocked canvas. */
  function deps(width: number, height: number, encode: (type: string, q?: number) => string) {
    const ctx = { fillStyle: '', imageSmoothingQuality: '', fillRect: vi.fn(), drawImage: vi.fn() };
    const canvas = { width: 0, height: 0, getContext: vi.fn(() => ctx), toDataURL: vi.fn(encode) };
    const source = {} as CanvasImageSource;
    const close = vi.fn();
    const loadImage = vi.fn(async (_f: Blob) => ({ source, width, height, close }));
    const d: ImageDeps = { loadImage, createCanvas: vi.fn(() => canvas as unknown as HTMLCanvasElement) };
    return { d, loadImage, ctx, canvas, source, close };
  }
  const url = (type: string, chars: number) => `data:${type};base64,` + 'A'.repeat(chars);
  const jpeg: ResizeOptions = { size: 160, mime: 'image/jpeg', maxChars: 14_000, fit: 'cover' };
  const logo: ResizeOptions = { size: 256, mime: 'image/png', maxChars: 200_000, targetChars: 82_000, fit: 'contain' };

  it('cover: center-crops to a square on a white background (JPEG)', async () => {
    const { d, ctx, canvas, source, close } = deps(400, 200, (t) => url(t, 100));
    const out = await resizeImage(file(), jpeg, d);
    expect(out).toMatch(/^data:image\/jpeg;base64,/);
    expect([canvas.width, canvas.height]).toEqual([160, 160]);
    expect(ctx.fillStyle).toBe('white');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 160, 160);
    expect(ctx.drawImage).toHaveBeenCalledWith(source, 100, 0, 200, 200, 0, 0, 160, 160);
    expect(close).toHaveBeenCalled();
  });

  it('contain: fits the whole image, centred, on a transparent background unless one is given', async () => {
    const r = deps(512, 256, (t) => url(t, 100));
    await resizeImage(file(), logo, r.d);
    expect(r.ctx.drawImage).toHaveBeenCalledWith(r.source, 0, 64, 256, 128);
    expect(r.ctx.fillRect).not.toHaveBeenCalled();
    const s = deps(100, 400, (t) => url(t, 100));
    await resizeImage(file(), { ...logo, background: '#000000' }, s.d);
    expect(s.ctx.fillRect).toHaveBeenCalledWith(0, 0, 256, 256);
    expect(s.ctx.drawImage).toHaveBeenCalledWith(s.source, 96, 0, 64, 256);
  });

  it('scale: keeps the proportions, shrinking only images larger than size (#82)', async () => {
    const big = deps(3200, 1800, (t) => url(t, 100));
    await resizeImage(file(), { ...jpeg, size: 1600, fit: 'scale' }, big.d);
    expect([big.canvas.width, big.canvas.height]).toEqual([1600, 900]);
    expect(big.ctx.fillRect).toHaveBeenCalledWith(0, 0, 1600, 900);
    expect(big.ctx.drawImage).toHaveBeenCalledWith(big.source, 0, 0, 1600, 900);
    const small = deps(300, 500, (t) => url(t, 100));
    await resizeImage(file(), { ...jpeg, size: 1600, fit: 'scale' }, small.d);
    expect([small.canvas.width, small.canvas.height]).toEqual([300, 500]);
  });

  it('JPEG: lowers the quality until the result fits', async () => {
    const lengths = [20_000, 15_000, 13_000];
    let call = 0;
    const { d, canvas } = deps(200, 200, (t) => url(t, lengths[Math.min(call++, lengths.length - 1)]));
    const out = await resizeImage(file(), jpeg, d);
    expect(canvas.toDataURL).toHaveBeenCalledTimes(3);
    const qualities = canvas.toDataURL.mock.calls.map((c) => c[1]!);
    expect(qualities[0]).toBeGreaterThan(qualities[1]);
    expect(qualities[1]).toBeGreaterThan(qualities[2]);
    expect(out.length).toBeLessThanOrEqual(14_000);
  });

  it('PNG: keeps the lossless PNG when within the target', async () => {
    const { d, canvas } = deps(64, 64, (t) => url(t, 1000));
    expect(await resizeImage(file(), logo, d)).toMatch(/^data:image\/png/);
    expect(canvas.toDataURL).toHaveBeenCalledTimes(1);
  });

  it('PNG: falls back to WebP at decreasing quality to reach the target', async () => {
    const { d } = deps(64, 64, (t, q) => (t === 'image/png' ? url(t, 300_000) : url(t, Math.round((q ?? 1) * 120_000))));
    const out = await resizeImage(file(), logo, d);
    expect(out.startsWith('data:image/webp')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(82_000);
  });

  it('PNG: without a WebP encoder keeps the PNG when under maxChars', async () => {
    const { d } = deps(64, 64, () => url('image/png', 150_000));
    expect(await resizeImage(file(), logo, d)).toMatch(/^data:image\/png/);
  });

  it('throws an Italian ImageResizeError when nothing fits maxChars', async () => {
    const { d } = deps(64, 64, (t) => url(t, 300_000));
    await expect(resizeImage(file(), logo, d)).rejects.toThrow(ImageResizeError);
    await expect(resizeImage(file(), logo, d)).rejects.toThrow(/troppo pesante/);
  });

  it('rejects non-image files without decoding them', async () => {
    const { d, loadImage } = deps(10, 10, (t) => url(t, 1));
    await expect(resizeImage(file('application/pdf'), jpeg, d)).rejects.toThrow('Il file scelto non è un\'immagine.');
    expect(loadImage).not.toHaveBeenCalled();
  });

  it('rejects undecodable or empty images, freeing them', async () => {
    const a = deps(10, 10, (t) => url(t, 1));
    a.loadImage.mockRejectedValue(new Error('decode'));
    await expect(resizeImage(file(), jpeg, a.d)).rejects.toThrow(/leggere/);
    const b = deps(0, 0, (t) => url(t, 1));
    await expect(resizeImage(file(), jpeg, b.d)).rejects.toThrow(ImageResizeError);
    expect(b.close).toHaveBeenCalled();
  });
});
