/**
 * Helper colore (framework-agnostici). Implementano le regole di
 * "Regole di sfumatura", "Vincoli di contrasto" e "Palette categoriche".
 */
import { BRAND, THEMES, WHITE } from './tokens';

export interface Rgba {
  /** 0–1, sRGB gamma */
  r: number;
  g: number;
  b: number;
  /** 0–1 */
  a: number;
}

export type Oklch = [l: number, c: number, h: number];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* ------------------------------------------------------------ Parsing */

/** Accetta #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() con sintassi moderna o a virgole, oklch(). */
export function parseColor(input: string): Rgba {
  const s = input.trim().toLowerCase();
  if (s.startsWith('#')) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(h)) throw new Error(`Colore non valido: ${input}`);
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  const fn = /^(rgba?|oklch)\((.*)\)$/.exec(s);
  if (!fn) throw new Error(`Colore non valido: ${input}`);
  const parts = fn[2].replace(/,/g, ' ').replace('/', ' / ').split(/\s+/).filter(Boolean);
  const slash = parts.indexOf('/');
  const chans = slash >= 0 ? parts.slice(0, slash) : parts.slice(0, 3);
  const alphaRaw = slash >= 0 ? parts[slash + 1] : parts[3];
  const num = (v: string, scale: number) => (v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v) / scale);
  const a = alphaRaw === undefined ? 1 : num(alphaRaw, 1);
  if (fn[1] === 'oklch') {
    const [l, c, h] = chans;
    const rgb = oklchToRgb([l.endsWith('%') ? parseFloat(l) / 100 : parseFloat(l), parseFloat(c), parseFloat(h)]);
    return { ...rgb, a };
  }
  const [r, g, b] = chans.map((v) => num(v, 255));
  return { r, g, b, a };
}

export function toHex({ r, g, b, a }: Rgba): string {
  const h = (n: number) =>
    Math.round(clamp01(n) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a) : ''}`;
}

/* ------------------------------------------------- Composizione e WCAG */

/** Compone `fg` (anche traslucido) sopra `bg` (opaco o composto a sua volta su bianco). Ritorna hex opaco. */
export function blend(fg: string, bg: string): string {
  const f = parseColor(fg);
  let b = parseColor(bg);
  if (b.a < 1) b = parseColor(blend(bg, WHITE));
  const mix = (x: number, y: number) => x * f.a + y * (1 - f.a);
  return toHex({ r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b), a: 1 });
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function relativeLuminance(color: string): number {
  const { r, g, b } = parseColor(color);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Rapporto di contrasto WCAG 2.x. Se `fg` è traslucido viene composto su `bg`;
 * se `bg` è traslucido viene composto su bianco (passa sempre un bg già composto quando conta).
 */
export function contrastRatio(fg: string, bg: string): number {
  const back = parseColor(bg).a < 1 ? blend(bg, WHITE) : bg;
  const front = parseColor(fg).a < 1 ? blend(fg, back) : fg;
  const l1 = relativeLuminance(front);
  const l2 = relativeLuminance(back);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/* -------------------------------------------------------------- OKLCH */

function rgbToOklab({ r, g, b }: Pick<Rgba, 'r' | 'g' | 'b'>): [number, number, number] {
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinear([L, A, B]: [number, number, number]): [number, number, number] {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function oklchToRgb([l, c, h]: Oklch): Pick<Rgba, 'r' | 'g' | 'b'> {
  const rad = ((h || 0) * Math.PI) / 180;
  const [r, g, b] = oklabToLinear([l, c * Math.cos(rad), c * Math.sin(rad)]).map((v) => toGamma(v));
  return { r, g, b };
}

/** hex → [L 0–1, C, h°] */
export function oklch(color: string): Oklch {
  const [L, A, B] = rgbToOklab(parseColor(color));
  const c = Math.hypot(A, B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [L, c, c < 1e-4 ? 0 : h];
}

const inGamut = (l: number, c: number, h: number) => {
  const lin = oklabToLinear([l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)]);
  return lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
};

/** [L, C, h] → hex. Fuori gamut sRGB riduce la chroma (tiene L e h), come da regola "muovi L e C, h fisso". */
export function fromOklch(l: number, c: number, h: number): string {
  let cc = c;
  while (cc > 0 && !inGamut(l, cc, h)) cc -= 0.002;
  return toHex({ ...oklchToRgb([l, Math.max(0, cc), h]), a: 1 });
}

/** CSS `oklch()` leggibile (per documentazione / Storybook). */
export function formatOklch(color: string): string {
  const [l, c, h] = oklch(color);
  return `oklch(${l.toFixed(2)} ${c.toFixed(3)} ${c < 1e-4 ? '–' : Math.round(h)})`;
}

/** `rgb(r g b / a)` dello stesso colore con alpha: "trasparenze, non nuovi colori". */
export function withAlpha(color: string, alpha: number): string {
  const { r, g, b } = parseColor(color);
  const n = (v: number) => Math.round(v * 255);
  return `rgb(${n(r)} ${n(g)} ${n(b)} / ${alpha})`;
}

/* ---------------------------------------------------------- on-color */

/** ink #1E1E1E se il contrasto con ink ≥ quello con bianco, altrimenti #FFFFFF. */
export function onColor(fill: string): string {
  return contrastRatio(BRAND.ink.hex, fill) >= contrastRatio(WHITE, fill) ? BRAND.ink.hex : WHITE;
}

/* --------------------------------------------------------- deriveTone */

export interface ToneRoles {
  fill: string;
  fillHover: string;
  /** solo per fill chiari (L > 0.7); per i fill scuri coincide con fillHover */
  fillBorder: string;
  on: string;
  text: string;
  soft: string;
  /** alpha usata per soft */
  softAlpha: number;
}

export interface Tone {
  hue: number;
  light: ToneRoles;
  dark: ToneRoles;
}

export interface DeriveToneOptions {
  /** L del fill, 0.55–0.83 (default 0.55) */
  l?: number;
  /** C del fill, 0.12–0.20 (default 0.17) */
  c?: number;
  /** superfici su cui verificare il text (default token del tema) */
  lightSurface?: string;
  darkSurface?: string;
}

/**
 * Genera i 5 ruoli (fill, hover, border, text, soft) per una tinta con la "firma" di Torneo.
 * Griglia OKLCH (h fisso, si muovono L e C):
 *  - fill L 0.55–0.83, C 0.12–0.20
 *  - hover = fill − 0.03 (fill chiari) / − 0.05 (fill scuri), mai più chiaro
 *  - border = fill − 0.09 (solo fill chiari L > 0.7)
 *  - text su chiaro L 0.44–0.48, C 0.09–0.17, h ruota verso il rosso per gialli/arancio (78 → 60)
 *  - text su scuro L 0.76–0.86, C 0.12–0.15
 *  - soft = fill con alpha 0.12–0.28 light (più alta per tinte chiare), 0.18–0.24 dark
 * Il text viene poi abbassato/alzato di L finché non passa 4.5:1 su superficie e soft composto.
 */
export function deriveTone(hue: number, opts: DeriveToneOptions = {}): Tone {
  const h = ((hue % 360) + 360) % 360;
  const l = clampRange(opts.l ?? 0.55, 0.55, 0.83);
  const c = clampRange(opts.c ?? 0.17, 0.12, 0.2);
  const lightFill = l > 0.7;
  const lightSurface = opts.lightSurface ?? THEMES.light.surfaceSolid;
  const darkSurface = opts.darkSurface ?? THEMES.dark.surfaceSolid;

  const fill = fromOklch(l, c, h);
  const fillHover = lightFill ? fromOklch(l - 0.03, c + 0.01, h) : fromOklch(l - 0.05, c - 0.01, h);
  const fillBorder = lightFill ? fromOklch(l - 0.09, c, h) : fillHover;
  const on = onColor(fill);

  // soft: alpha interpolata sulla luminosità del fill
  const t = (l - 0.55) / (0.83 - 0.55);
  const softLight = round2(0.14 + t * (0.28 - 0.14));
  const softDark = round2(0.22 - t * (0.22 - 0.18));

  // text light: gialli/arancio (h 60–110) ruotano verso il rosso
  const textHue = h >= 60 && h <= 110 ? h - 18 : h;
  const textC = clampRange(c * 0.82, 0.09, 0.17);
  const softOnLight = blend(withAlpha(fill, softLight), lightSurface);
  let tl = 0.48;
  let textLight = fromOklch(tl, textC, textHue);
  while (tl > 0.2 && Math.min(contrastRatio(textLight, lightSurface), contrastRatio(textLight, softOnLight)) < 4.5) {
    tl -= 0.01;
    textLight = fromOklch(tl, textC, textHue);
  }

  const textDarkC = clampRange(c * 0.75, 0.12, 0.15);
  const softOnDark = blend(withAlpha(fill, softDark), darkSurface);
  let td = 0.8;
  let textDark = fromOklch(td, textDarkC, h);
  while (td < 0.97 && Math.min(contrastRatio(textDark, darkSurface), contrastRatio(textDark, softOnDark)) < 4.5) {
    td += 0.01;
    textDark = fromOklch(td, textDarkC, h);
  }

  return {
    hue: h,
    light: { fill, fillHover, fillBorder, on, text: textLight, soft: withAlpha(fill, softLight), softAlpha: softLight },
    dark: { fill, fillHover, fillBorder, on, text: textDark, soft: withAlpha(fill, softDark), softAlpha: softDark },
  };
}

const clampRange = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------ Grafici (snap) */

export type Mode = 'light' | 'dark';

export const CHART_BAND: Record<Mode, { lMin: number; lMax: number; cMin: number }> = {
  light: { lMin: 0.43, lMax: 0.77, cMin: 0.1 },
  dark: { lMin: 0.48, lMax: 0.67, cMin: 0.1 },
};

/**
 * Aggancia un colore alla banda OKLCH dei grafici muovendo solo L
 * e, se serve, continua a muovere L finché il contrasto con la superficie è ≥ 3:1.
 */
export function snapToMode(color: string, mode: Mode, surface = mode === 'light' ? THEMES.light.surfaceSolid : THEMES.dark.surfaceSolid): string {
  const band = CHART_BAND[mode];
  const [l0, c, h] = oklch(color);
  let l = clampRange(l0, band.lMin, band.lMax);
  let out = fromOklch(l, c, h);
  const step = mode === 'light' ? -0.01 : 0.01;
  while (contrastRatio(out, surface) < 3 && l > band.lMin - 1e-9 && l < band.lMax + 1e-9) {
    l += step;
    out = fromOklch(l, c, h);
  }
  return out;
}

/** ΔE in OKLab, scala ×100 (come nelle linee guida: ≥ 15 tra serie adiacenti). */
export function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = rgbToOklab(parseColor(a));
  const [l2, a2, b2] = rgbToOklab(parseColor(b));
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100;
}

/** Simulazione daltonismo Machado, Oliveira & Fernandes 2009, severità 1.0 (spazio RGB lineare). */
const MACHADO = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
} as const;

export function simulateCvd(color: string, type: keyof typeof MACHADO): string {
  const { r, g, b } = parseColor(color);
  const lin = [toLinear(r), toLinear(g), toLinear(b)];
  const [R, G, B] = MACHADO[type].map((row) => clamp01(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]));
  return toHex({ r: toGamma(R), g: toGamma(G), b: toGamma(B), a: 1 });
}

export interface SeriesIssue {
  index: number;
  rule: 'band' | 'chroma' | 'contrast' | 'deltaE' | 'protan' | 'deutan';
  value: number;
}

/** Verifica una palette di serie secondo le regole "Grafici". Array vuoto = valida. */
export function validateSeries(colors: readonly string[], mode: Mode, surface?: string): SeriesIssue[] {
  const band = CHART_BAND[mode];
  const surf = surface ?? (mode === 'light' ? THEMES.light.surfaceSolid : THEMES.dark.surfaceSolid);
  const issues: SeriesIssue[] = [];
  colors.forEach((col, i) => {
    const [l, c] = oklch(col);
    if (l < band.lMin - 0.005 || l > band.lMax + 0.005) issues.push({ index: i, rule: 'band', value: l });
    if (c < band.cMin) issues.push({ index: i, rule: 'chroma', value: c });
    const cr = contrastRatio(col, surf);
    if (cr < 3) issues.push({ index: i, rule: 'contrast', value: cr });
    if (i > 0) {
      const prev = colors[i - 1];
      const d = deltaE(prev, col);
      if (d < 15) issues.push({ index: i, rule: 'deltaE', value: d });
      for (const t of ['protan', 'deutan'] as const) {
        const dc = deltaE(simulateCvd(prev, t), simulateCvd(col, t));
        if (dc < 8) issues.push({ index: i, rule: t, value: dc });
      }
    }
  });
  return issues;
}

/* ---------------------------------------------------------- Neutri */

/** Gradino neutro caldo intermedio: interpola L in OKLCH con h ≈ 72, C ≈ 0.015. */
export function warmNeutral(l: number): string {
  return fromOklch(l, 0.015, 72);
}
