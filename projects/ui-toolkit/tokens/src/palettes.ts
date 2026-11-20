import { onColor, snapToMode, type Mode } from './color';
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
 * Sorgente delle serie dei grafici: tinte del sistema, agganciate alla banda di ciascun modo con `snapToMode`.
 * L'ordine è stato scelto per rispettare ΔE ≥ 15 e ≥ 8 in protanopia/deuteranopia tra serie adiacenti (verificato da test).
 */
export const CHART_SOURCE: readonly string[] = [
  BRAND.orange.hex,
  '#1565C0', // blu
  BRAND.red.hex,
  '#6A1B9A', // viola
  BRAND.green.hex,
  '#4FC3F7', // azzurro
  '#AD1457', // fucsia
];

export function chartSeries(mode: Mode): string[] {
  return CHART_SOURCE.map((c) => snapToMode(c, mode));
}
