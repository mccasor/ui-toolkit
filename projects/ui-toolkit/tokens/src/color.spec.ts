import { describe, expect, it } from 'vitest';
import {
  blend,
  contrastRatio,
  deriveTone,
  fromOklch,
  oklch,
  onColor,
  parseColor,
  simulateCvd,
  snapToMode,
  validateSeries,
  CHART_BAND,
} from './color';
import { chartSeries, initials, avatarColors, AVATAR_FALLBACK } from './palettes';
import { BRAND, THEMES } from './tokens';

describe('parse / blend / contrastRatio', () => {
  it('parse hex e rgb moderno', () => {
    expect(parseColor('#FFB936')).toMatchObject({ a: 1 });
    expect(parseColor('rgb(30 30 30 / .05)').a).toBeCloseTo(0.05);
    expect(parseColor('rgb(255, 255, 255, 0.5)').a).toBeCloseTo(0.5);
  });
  it('contrasto nero/bianco = 21', () => expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5));
  it('blend alpha 0 e 1', () => {
    expect(blend('rgb(0 0 0 / 0)', '#FFFFFF')).toBe('#FFFFFF');
    expect(blend('rgb(0 0 0 / 1)', '#FFFFFF')).toBe('#000000');
  });
});

describe('OKLCH dei brand = valori del documento', () => {
  it.each(Object.entries(BRAND))('%s', (_k, b) => {
    const [l, c, h] = oklch(b.hex);
    expect(l).toBeCloseTo(b.oklch[0], 2);
    expect(c).toBeCloseTo(b.oklch[1], 2);
    if (b.oklch[2] !== null) expect(Math.abs(h - b.oklch[2])).toBeLessThan(1.5);
  });
  it('roundtrip fromOklch(oklch(x)) ≈ x', () => {
    for (const hex of ['#FFB936', '#CE2828', '#2E8B57', '#1565C0']) {
      const [l, c, h] = oklch(hex);
      expect(fromOklch(l, c, h)).toBe(hex);
    }
  });
});

describe('Neutri caldi: h 67–81, C 0.005–0.02, L della scala dichiarata', () => {
  const scale: [string, number][] = [
    ['#FFFCF7', 0.99],
    ['#FFF6E8', 0.98],
    ['#C4BDB4', 0.8],
    ['#8C857D', 0.62],
    ['#7A726A', 0.56],
    ['#4F4A44', 0.41],
    ['#1E1E1E', 0.24],
    ['#0F0F10', 0.17],
  ];
  it.each(scale)('%s → L %s', (hex, L) => {
    const [l, c, h] = oklch(hex);
    expect(l).toBeCloseTo(L, 1);
    if (hex !== '#1E1E1E' && hex !== '#0F0F10') {
      expect(c).toBeLessThanOrEqual(0.03);
      expect(h).toBeGreaterThanOrEqual(60);
      expect(h).toBeLessThanOrEqual(90);
    }
  });
});

describe('onColor', () => {
  it('ink su arancio, bianco su rosso', () => {
    expect(onColor(BRAND.orange.hex)).toBe(BRAND.ink.hex);
    expect(onColor(BRAND.red.hex)).toBe('#FFFFFF');
  });
  it('coerente coi token on-*', () => {
    expect(onColor(THEMES.light.primary)).toBe(THEMES.light.onPrimary);
    expect(onColor(THEMES.light.danger)).toBe(THEMES.light.onDanger);
    expect(onColor(THEMES.light.success)).toBe(THEMES.light.onSuccess);
    expect(onColor(THEMES.light.warning)).toBe(THEMES.light.onWarning);
  });
});

describe('deriveTone', () => {
  it('esempio del documento: blu h 255', () => {
    const t = deriveTone(255);
    const [fl, fc, fh] = oklch(t.light.fill);
    expect(fl).toBeCloseTo(0.55, 2);
    expect(fc).toBeCloseTo(0.17, 2);
    expect(Math.abs(fh - 255)).toBeLessThan(1);
    expect(oklch(t.light.fillHover)[0]).toBeCloseTo(0.5, 2);
    expect(oklch(t.light.text)[0]).toBeLessThanOrEqual(0.485);
    expect(oklch(t.dark.text)[0]).toBeGreaterThanOrEqual(0.76);
    expect(t.light.softAlpha).toBeCloseTo(0.14);
    expect(t.dark.softAlpha).toBeCloseTo(0.22);
  });

  it('hover mai più chiaro del fill', () => {
    for (let h = 0; h < 360; h += 15) for (const l of [0.55, 0.7, 0.83]) {
      const t = deriveTone(h, { l });
      expect(oklch(t.light.fillHover)[0]).toBeLessThan(oklch(t.light.fill)[0]);
    }
  });

  it('fill chiaro (L 0.83 h 78) ≈ arancio brand e border più scuro', () => {
    const t = deriveTone(78, { l: 0.83, c: 0.158 });
    expect(contrastRatio(t.light.fill, BRAND.orange.hex)).toBeLessThan(1.05);
    expect(oklch(t.light.fillBorder)[0]).toBeCloseTo(0.74, 2);
    expect(t.light.on).toBe(BRAND.ink.hex);
    expect(t.light.softAlpha).toBeCloseTo(0.28);
    expect(t.dark.softAlpha).toBeCloseTo(0.18);
  });

  const hues = Array.from({ length: 24 }, (_, i) => i * 15);
  it.each(hues)('h %s: tutti i ruoli passano AA', (h) => {
    for (const l of [0.55, 0.83]) {
      const t = deriveTone(h, { l });
      const ls = THEMES.light.surfaceSolid;
      const ds = THEMES.dark.surfaceSolid;
      expect(contrastRatio(t.light.text, ls)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.light.text, blend(t.light.soft, ls))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.dark.text, ds)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.dark.text, blend(t.dark.soft, ds))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.light.on, t.light.fill)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('Grafici', () => {
  it.each(['light', 'dark'] as const)('snapToMode porta in banda (%s) muovendo solo L', (mode) => {
    const snapped = snapToMode(BRAND.orange.hex, mode);
    const [l, , h] = oklch(snapped);
    expect(l).toBeGreaterThanOrEqual(CHART_BAND[mode].lMin - 0.005);
    expect(l).toBeLessThanOrEqual(CHART_BAND[mode].lMax + 0.005);
    expect(Math.abs(h - oklch(BRAND.orange.hex)[2])).toBeLessThan(3);
  });
  it.each(['light', 'dark'] as const)('palette serie predefinita valida (%s)', (mode) => {
    expect(validateSeries(chartSeries(mode), mode)).toEqual([]);
  });
  it('simulazione CVD cambia rosso/verde', () => {
    expect(simulateCvd('#FF0000', 'protan')).not.toBe('#FF0000');
  });
});

describe('Avatar', () => {
  it('iniziali max 2', () => {
    expect(initials('Mario Rossi')).toBe('MR');
    expect(initials('Atalanta Bergamasca Calcio')).toBe('AC');
    expect(initials('Juve')).toBe('JU');
  });
  it('fallback stabile da hash, colore scelto con on calcolato', () => {
    expect(avatarColors('Mario Rossi')).toEqual(avatarColors('mario rossi'));
    expect(AVATAR_FALLBACK).toContainEqual(avatarColors('Qualcuno'));
    expect(avatarColors('x', '#1565C0')).toEqual({ fill: '#1565C0', on: '#FFFFFF' });
  });
});
