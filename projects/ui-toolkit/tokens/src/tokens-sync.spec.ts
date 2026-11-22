import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTailwindPreset, buildTokensCss } from './generate';
import { BACKOFFICE, FONT, LAYOUT, MOTION, RADIUS, SPACE, THEMES } from './tokens';

const styles = resolve(import.meta.dirname, '../../styles');
const read = (f: string) => readFileSync(resolve(styles, f), 'utf8');

describe('CSS ≡ TS', () => {
  it('tokens.css è aggiornato (esegui `npm run tokens`)', () => {
    expect(read('tokens.css')).toBe(buildTokensCss());
  });
  it('tailwind-preset.css è aggiornato (esegui `npm run tokens`)', () => {
    expect(read('tailwind-preset.css')).toBe(buildTailwindPreset());
  });
});

describe('Valori vincolanti del documento presenti identici', () => {
  const css = read('tokens.css');
  const must = [
    // colore
    ...Object.values(THEMES.light),
    ...Object.values(THEMES.dark),
    ...['#F3F2F0', '#111112', '#FFFFFF', '#1B1B1D', '#F8F7F5', '#232326', '#FFF3DC', '#2E2A22', '#E2DFDA', '#313135', '#837C74', '#57524C', '#B3ACA3', '#0A0A0B'],
    ...Object.values(BACKOFFICE.light),
    // tipografia
    FONT.sans,
    FONT.display,
    // spaziatura / raggi / layout
    '0.75rem', '1rem', '1.5rem', '64rem', '1.25rem', '0.875rem', '9999px', '0.375rem', '2.75rem', '3.75rem', '4rem', '2.25rem', '3.25rem',
    // motion
    'cubic-bezier(0.22, 1, 0.36, 1)', '160ms', '200ms', '220ms', '260ms', '240ms', '180ms', '700ms', '1.4s',
  ];
  it.each(must)('%s', (v) => expect(css).toContain(String(v)));

  it('scale dichiarate', () => {
    expect(SPACE.cardPadding).toEqual({ sm: '0.75rem', md: '1rem', lg: '1.5rem' });
    expect(RADIUS.card).toBe('1.25rem');
    expect(RADIUS.control).toBe('0.875rem');
    expect(RADIUS.backoffice).toEqual({ card: '0.5rem', control: '0.375rem' });
    expect(LAYOUT.controlHeight).toEqual({ sm: '2.25rem', md: '2.75rem', lg: '3.25rem' });
    expect(MOTION.ease).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
    expect(FONT.weights).toEqual([400, 500, 600, 700]);
  });
});

describe('Font self-hosted', () => {
  const fonts = readdirSync(resolve(styles, 'fonts')).filter((f) => f.endsWith('.woff2'));
  it('Manrope variabile e Barlow Condensed 500/600/700, latin + latin-ext', () => {
    expect(fonts).toEqual(
      expect.arrayContaining([
        'manrope-latin-wght-normal.woff2',
        'manrope-latin-ext-wght-normal.woff2',
        ...[500, 600, 700].flatMap((w) => [`barlow-condensed-latin-${w}-normal.woff2`, `barlow-condensed-latin-ext-${w}-normal.woff2`]),
      ]),
    );
  });
  it('nessuna richiesta a CDN di font negli stili', () => {
    for (const f of readdirSync(styles).filter((x) => x.endsWith('.css')))
      expect(read(f), f).not.toMatch(/fonts\.(googleapis|gstatic)|https?:\/\//);
  });
  it('font-display: swap ovunque', () => {
    const faces = read('fonts.css').match(/@font-face\s*\{[^}]*\}/g) ?? [];
    expect(faces.length).toBe(8);
    for (const f of faces) expect(f).toContain('font-display: swap');
  });
});
