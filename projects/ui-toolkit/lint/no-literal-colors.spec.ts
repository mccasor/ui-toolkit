import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Criterio di accettazione: "Nessun colore letterale nei componenti".
 * Scansiona il codice dei componenti (src/lib, esclusi spec e stories) e fallisce se trova
 * hex, funzioni colore o colori con nome nelle proprietà CSS. Ammessi: var(--…), transparent, currentColor, inherit.
 */
const LIB = resolve(import.meta.dirname, '../src/lib');

const HEX = /(?<![\w&/-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;
const NAMED =
  /\b(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|fill|stroke|box-shadow|text-decoration-color|caret-color|accent-color)\s*:\s*[^;`'"]*\b(?:white|black|red|green|blue|orange|yellow|gray|grey|silver|purple|pink)\b/gi;

export function findLiteralColors(source: string): string[] {
  // i commenti possono citare valori del documento
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  return [...(code.match(HEX) ?? []), ...(code.match(FN) ?? []), ...(code.match(NAMED) ?? [])];
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|css|html)$/.test(f) && !/\.(spec|stories)\.ts$/.test(f) ? [p] : [];
  });
}

describe('Nessun colore letterale nei componenti', () => {
  it('il lint riconosce i casi vietati', () => {
    expect(findLiteralColors('a { color: #fff; }')).toHaveLength(1);
    expect(findLiteralColors('a { background: rgb(0 0 0 / .5); }')).toHaveLength(1);
    expect(findLiteralColors('a { border-color: white; }')).toHaveLength(1);
    expect(findLiteralColors('a { color: var(--ui-text); background: transparent; }')).toEqual([]);
    expect(findLiteralColors('<input #trigger>')).toEqual([]);
  });

  const files = walk(LIB);
  it('ci sono file da verificare', () => expect(files.length).toBeGreaterThan(0));
  it.each(files.map((f) => [relative(LIB, f), f]))('%s', (_rel, file) => {
    expect(findLiteralColors(readFileSync(file, 'utf8'))).toEqual([]);
  });
});
