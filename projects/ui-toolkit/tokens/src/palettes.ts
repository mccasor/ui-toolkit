import { fromOklch, onColor, type Mode } from './color';
import { BRAND, THEMES, WHITE } from './tokens';

export interface Swatch {
  id: string;
  label: string;
  fill: string;
  on: string;
}

const swatch = (id: string, label: string, fill: string): Swatch => ({ id, label, fill, on: onColor(fill) });

/** Gli 11 swatch selezionabili dall'utente, ciascuno con il suo `on` calcolato. */
export const SWATCHES: readonly Swatch[] = [
  swatch('arancio', 'Arancio', '#FFB936'),
  swatch('rosso', 'Rosso', '#C62828'),
  swatch('bordeaux', 'Bordeaux', '#8E2448'),
  swatch('fucsia', 'Fucsia', '#AD1457'),
  swatch('viola', 'Viola', '#6A1B9A'),
  swatch('blu', 'Blu', '#1565C0'),
  swatch('azzurro', 'Azzurro', '#4FC3F7'),
  swatch('verde-acqua', 'Verde acqua', '#00796B'),
  swatch('verde', 'Verde', '#2E7D32'),
  swatch('giallo', 'Giallo', '#FDD835'),
  swatch('ardesia', 'Grigio ardesia', '#455A64'),
];

/** Fallback avatar scelti da hash del nome: orange/ink, ink/orange, #23704A/bianco, #CE2828/bianco. */
export const AVATAR_FALLBACK: readonly { fill: string; on: string }[] = [
  { fill: BRAND.orange.hex, on: BRAND.ink.hex },
  { fill: BRAND.ink.hex, on: BRAND.orange.hex },
  { fill: THEMES.light.success, on: WHITE },
  { fill: BRAND.red.hex, on: WHITE },
];

/** Hash stabile (FNV-1a 32 bit) di una stringa. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Colori del fallback a iniziali: colore scelto con on calcolato, altrimenti palette fallback via hash del nome. */
export function avatarColors(name: string, color?: string | null): { fill: string; on: string } {
  if (color) return { fill: color, on: onColor(color) };
  return AVATAR_FALLBACK[hashString(name.trim().toLowerCase()) % AVATAR_FALLBACK.length];
}

/** Iniziali (max 2) da un nome. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Serie dei grafici: una rampa di luminosità sulla tinta accento, non una palette categorica.
 * Serie 1 = la più contrastata (l'accento), poi a passi di L 0.12 verso la superficie, in ordine fisso, mai ciclato.
 * Light: tinta 62 (l'arancio ruotato verso il rosso come accent-text). Dark: si parte dall'arancio brand.
 * Oltre {@link CHART_MAX_SERIES} serie non si aggiungono colori: le altre sono contesto (text-muted),
 * oppure si passa a piccoli multipli o a una tabella.
 */
export const CHART_RAMP: Record<Mode, { h: number; c: number; l: readonly number[] }> = {
  light: { h: 62, c: 0.14, l: [0.42, 0.54, 0.66] },
  dark: { h: 78, c: 0.158, l: [0.83, 0.7, 0.57] },
};
export const CHART_MAX_SERIES = 3;

export function chartSeries(mode: Mode): string[] {
  const r = CHART_RAMP[mode];
  return r.l.map((l, i) => (mode === 'dark' && i === 0 ? BRAND.orange.hex : fromOklch(l, r.c, r.h)));
}
