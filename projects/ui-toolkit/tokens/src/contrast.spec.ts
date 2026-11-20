import { describe, expect, it } from 'vitest';
import { blend, contrastRatio, type Mode } from './color';
import { AVATAR_FALLBACK, SWATCHES } from './palettes';
import { BACKOFFICE, BRAND, THEMES, WHITE } from './tokens';

const AA = 4.5;
const NON_TEXT = 3;
const modes: Mode[] = ['light', 'dark'];

/** Superfici di riferimento di un tema: bg, surface-solid e vetro composto sopra bg. */
function surfaces(mode: Mode) {
  const t = THEMES[mode];
  return {
    bg: t.bg,
    'surface-solid': t.surfaceSolid,
    'glass (surface su bg)': blend(t.surface, t.bg),
    'glass-strong (surface-strong su bg)': blend(t.surfaceStrong, t.bg),
  };
}

describe.each(modes)('Contrasti tema %s', (mode) => {
  const t = THEMES[mode];
  const s = surfaces(mode);

  describe.each(['text', 'textMuted'] as const)('%s ≥ 4.5:1', (token) => {
    it.each(Object.entries(s))('su %s', (_n, bg) => {
      expect(contrastRatio(t[token], bg)).toBeGreaterThanOrEqual(AA);
    });
  });

  const stateText = [
    ['accentText', 'brandSoft'],
    ['dangerText', 'dangerSoft'],
    ['successText', 'successSoft'],
    ['warningText', 'warningSoft'],
  ] as const;

  describe.each(stateText)('%s ≥ 4.5:1', (text, soft) => {
    it('su surface-solid', () => expect(contrastRatio(t[text], t.surfaceSolid)).toBeGreaterThanOrEqual(AA));
    it(`su ${soft} composto su surface-solid`, () =>
      expect(contrastRatio(t[text], blend(t[soft], t.surfaceSolid))).toBeGreaterThanOrEqual(AA));
    it(`su ${soft} composto su bg`, () => expect(contrastRatio(t[text], blend(t[soft], t.bg))).toBeGreaterThanOrEqual(AA));
    it(`su ${soft} composto sul vetro`, () =>
      expect(contrastRatio(t[text], blend(t[soft], s['glass (surface su bg)']))).toBeGreaterThanOrEqual(AA));
  });

  const onFill = [
    ['onPrimary', 'primary'],
    ['onPrimary', 'primaryHover'],
    ['onDanger', 'danger'],
    ['onDanger', 'dangerHover'],
    ['onSuccess', 'success'],
    ['onWarning', 'warning'],
    ['navActiveFg', 'navActiveBg'],
  ] as const;
  it.each(onFill)('%s ≥ 4.5:1 su %s', (on, fill) => {
    expect(contrastRatio(t[on], t[fill])).toBeGreaterThanOrEqual(AA);
  });

  describe.each(['borderStrong', 'focus'] as const)('%s ≥ 3:1 (WCAG 1.4.11)', (token) => {
    it.each(Object.entries(s))('su %s', (_n, bg) => {
      expect(contrastRatio(t[token], bg)).toBeGreaterThanOrEqual(NON_TEXT);
    });
  });

  it('testo neutral badge (text su surface-sunken composto)', () => {
    expect(contrastRatio(t.text, blend(t.surfaceSunken, t.surfaceSolid))).toBeGreaterThanOrEqual(AA);
  });
});

describe('Regola: arancio mai come testo su chiaro', () => {
  it('orange su bg light < 3:1 (≈1.6:1) → serve accent-text', () => {
    const r = contrastRatio(BRAND.orange.hex, THEMES.light.bg);
    expect(r).toBeLessThan(NON_TEXT);
    expect(r).toBeCloseTo(1.6, 0);
  });
  it('text-muted light su bg ≈ 8.2:1 come dichiarato', () => {
    expect(contrastRatio(THEMES.light.textMuted, THEMES.light.bg)).toBeCloseTo(8.2, 0);
  });
});

describe.each(modes)('Contrasti backoffice %s', (mode) => {
  const bo = BACKOFFICE[mode];
  const t = THEMES[mode];
  const surf = { bg: bo.bg, surface: bo.surface, 'surface-alt': bo.surfaceAlt, 'row-hover': bo.rowHover };

  it.each(Object.entries(surf))('text e text-muted ≥ 4.5:1 su %s', (_n, bg) => {
    expect(contrastRatio(t.text, bg)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(bo.textMuted, bg)).toBeGreaterThanOrEqual(AA);
  });
  it.each(Object.entries(surf))('border e focus ≥ 3:1 su %s', (_n, bg) => {
    expect(contrastRatio(bo.border, bg)).toBeGreaterThanOrEqual(NON_TEXT);
    expect(contrastRatio(t.focus, bg)).toBeGreaterThanOrEqual(NON_TEXT);
  });
  it.each(Object.entries(surf))('*-text di stato ≥ 4.5:1 su %s', (_n, bg) => {
    for (const k of ['accentText', 'dangerText', 'successText', 'warningText'] as const)
      expect(contrastRatio(t[k], bg), k).toBeGreaterThanOrEqual(AA);
  });
  it('sidebar: testo, muted e voce attiva', () => {
    expect(contrastRatio(bo.sidebarText, bo.sidebar)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(bo.sidebarMuted, bo.sidebar)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(bo.sidebarActiveFg, bo.sidebarActiveBg)).toBeGreaterThanOrEqual(AA);
  });
  it('focus dark (orange) e light (ink) visibili sulla sidebar scura', () => {
    // la sidebar è sempre scura: il focus al suo interno usa l'arancio
    expect(contrastRatio(BRAND.orange.hex, bo.sidebar)).toBeGreaterThanOrEqual(NON_TEXT);
  });
});

describe('Palette utente e fallback', () => {
  it.each(SWATCHES.map((s) => [s.label, s]))('swatch %s: on ≥ 4.5:1', (_l, s) => {
    expect(contrastRatio(s.on, s.fill)).toBeGreaterThanOrEqual(AA);
  });
  it.each(AVATAR_FALLBACK.map((f) => [f.fill, f.on]))('fallback avatar %s / %s ≥ 4.5:1', (fill, on) => {
    expect(contrastRatio(on, fill)).toBeGreaterThanOrEqual(AA);
  });
  it('bianco su danger (badge live)', () => {
    expect(contrastRatio(WHITE, THEMES.light.danger)).toBeGreaterThanOrEqual(AA);
  });
});
