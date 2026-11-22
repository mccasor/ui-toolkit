/**
 * Ridimensionamento nel browser: un file immagine diventa un data URL base64 di dimensione, formato e peso scelti
 * (es. per salvarlo in un documento quando non c'è uno storage di file). Usato da `ui-image-input`.
 */

export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ResizeOptions {
  /** Side of the square output, in px (`scale`: the longest side, never enlarged). */
  size: number;
  /**
   * Output format. `image/jpeg` lowers the quality until `targetChars`; `image/png` keeps the lossless PNG when
   * within `targetChars`, else tries WebP; `image/webp` tries WebP at decreasing quality.
   */
  mime: ImageMime;
  /** Hard limit of the data URL length (security rules): larger results throw an `ImageResizeError`. */
  maxChars: number;
  /** Preferred data URL length; defaults to `maxChars`. */
  targetChars?: number;
  /**
   * `cover` center-crops to the square; `contain` fits the whole image inside it; `scale` keeps the proportions
   * (no square): the longest side becomes `size` when larger (news images, #82).
   */
  fit: 'cover' | 'contain' | 'scale';
  /** Fill behind the image; JPEG (no alpha) defaults to white, PNG/WebP stay transparent. */
  background?: string;
}

/** Kind of an image error: its translation is `ui.imageInput.errors.<code>` (#86). */
export type ImageErrorCode = 'notImage' | 'unreadable' | 'noCanvas' | 'tooLarge';

/** A user-facing image error: Italian `message` (kept for existing callers) and the `code` to translate it. */
export class ImageResizeError extends Error {
  constructor(message: string, readonly code?: ImageErrorCode) {
    super(message);
  }
}

export interface LoadedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Frees the decoded image (ImageBitmap). */
  close?: () => void;
}

/** Browser seams of `resizeImage`, replaced by mocks in unit tests (jsdom has no canvas). */
export interface ImageDeps {
  loadImage(file: Blob): Promise<LoadedImage>;
  createCanvas(): HTMLCanvasElement;
}

async function loadImage(file: Blob): Promise<LoadedImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const browserImageDeps: ImageDeps = {
  loadImage,
  createCanvas: () => document.createElement('canvas'),
};

export const NOT_AN_IMAGE = 'Il file scelto non è un\'immagine.';
const UNREADABLE = 'Impossibile leggere l\'immagine. Prova con un altro file.';
const TOO_LARGE = 'Immagine troppo pesante anche dopo il ridimensionamento: prova con un\'immagine più semplice.';

const JPEG_QUALITIES = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];
const WEBP_QUALITIES = [0.92, 0.85, 0.75, 0.6, 0.45];

/** Box drawing a `w` × `h` image inside a `size` square, centred and with its proportions. */
function containBox(w: number, h: number, size: number): { x: number; y: number; w: number; h: number } {
  const scale = size / Math.max(w, h, 1);
  const dw = Math.round(w * scale);
  const dh = Math.round(h * scale);
  return { x: Math.round((size - dw) / 2), y: Math.round((size - dh) / 2), w: dw, h: dh };
}

type Encoder = (type: string, quality?: number) => string;

/** First encoding within `target`, else the smallest one tried. */
function encode(enc: Encoder, mime: ImageMime, target: number): string {
  let best = '';
  const keep = (url: string) => {
    if (!best || url.length < best.length) best = url;
    return url.length <= target;
  };
  if (mime === 'image/jpeg') {
    for (const q of JPEG_QUALITIES) if (keep(enc('image/jpeg', q))) return best;
    return best;
  }
  if (mime === 'image/png' && keep(enc('image/png'))) return best;
  for (const q of WEBP_QUALITIES) {
    const webp = enc('image/webp', q);
    if (!webp.startsWith('data:image/webp')) {
      keep(webp); // no WebP encoder: the browser fell back to PNG
      break;
    }
    if (keep(webp)) return best;
  }
  return best;
}

/** `file` → data URL of `size` px (square, except `scale`), as described by `options`. Throws `ImageResizeError` (Italian). */
export async function resizeImage(file: Blob, options: ResizeOptions, deps: ImageDeps = browserImageDeps): Promise<string> {
  if (!file.type.startsWith('image/')) throw new ImageResizeError(NOT_AN_IMAGE, 'notImage');
  let image: LoadedImage;
  try {
    image = await deps.loadImage(file);
  } catch {
    throw new ImageResizeError(UNREADABLE, 'unreadable');
  }
  try {
    const { width, height } = image;
    if (!width || !height) throw new ImageResizeError(UNREADABLE, 'unreadable');
    const { size, fit, mime } = options;
    const k = fit === 'scale' ? Math.min(1, size / Math.max(width, height)) : 1;
    const cw = fit === 'scale' ? Math.max(1, Math.round(width * k)) : size;
    const ch = fit === 'scale' ? Math.max(1, Math.round(height * k)) : size;
    const canvas = deps.createCanvas();
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new ImageResizeError('Il browser non riesce a elaborare l\'immagine.', 'noCanvas');
    const background = options.background ?? (mime === 'image/jpeg' ? 'white' : undefined);
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, cw, ch);
    }
    ctx.imageSmoothingQuality = 'high';
    if (fit === 'scale') {
      ctx.drawImage(image.source, 0, 0, cw, ch);
    } else if (fit === 'cover') {
      const side = Math.min(width, height);
      ctx.drawImage(image.source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size);
    } else {
      const box = containBox(width, height, size);
      ctx.drawImage(image.source, box.x, box.y, box.w, box.h);
    }
    const url = encode((type, q) => canvas.toDataURL(type, q), mime, options.targetChars ?? options.maxChars);
    if (url.length > options.maxChars) throw new ImageResizeError(TOO_LARGE, 'tooLarge');
    return url;
  } finally {
    image.close?.();
  }
}

const DATA_IMAGE = /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]*$/i;

export const isDataImageUrl = (value: string): boolean => DATA_IMAGE.test(value.trim());

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value.trim());
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}
