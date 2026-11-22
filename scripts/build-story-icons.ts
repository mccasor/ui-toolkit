/**
 * Phosphor Icons (https://phosphoricons.com, MIT) → projects/ui-toolkit/stories/support/phosphor.ts
 * Estrae solo i path delle icone usate dalle storie, nei pesi regular / bold / fill.
 * Per aggiungere un'icona: aggiungerla a ICONS e lanciare `npm run icons`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** nome usato nelle storie → nome Phosphor */
const ICONS: Record<string, string> = {
  plus: 'plus',
  check: 'check',
  x: 'x',
  trash: 'trash',
  alert: 'warning-circle',
  info: 'info',
  search: 'magnifying-glass',
  chevronDown: 'caret-down',
  chevronLeft: 'caret-left',
  chevronRight: 'caret-right',
  home: 'house',
  trophy: 'trophy',
  calendar: 'calendar-blank',
  users: 'users',
  settings: 'gear-six',
  chart: 'chart-bar',
  goal: 'soccer-ball',
  list: 'list-bullets',
  grid: 'squares-four',
  inbox: 'tray',
  card: 'cards',
};
const WEIGHTS = ['regular', 'bold', 'fill'] as const;

const root = resolve(import.meta.dirname, '../node_modules/@phosphor-icons/core');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const file = (w: string, n: string) => resolve(root, 'assets', w, w === 'regular' ? `${n}.svg` : `${n}-${w}.svg`);

const out: Record<string, Record<string, string[]>> = {};
for (const [name, ph] of Object.entries(ICONS)) {
  out[name] = {};
  for (const w of WEIGHTS) {
    const svg = readFileSync(file(w, ph), 'utf8');
    if (!svg.includes('viewBox="0 0 256 256"')) throw new Error(`${ph} (${w}): viewBox inatteso`);
    out[name][w] = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
    if (!out[name][w].length) throw new Error(`${ph} (${w}): nessun path`);
  }
}

const target = resolve(import.meta.dirname, '../projects/ui-toolkit/stories/support/phosphor.ts');
writeFileSync(
  target,
  `/* GENERATO da scripts/build-story-icons.ts (@phosphor-icons/core ${version}, MIT — https://phosphoricons.com) — non modificare a mano. */
export type IconWeight = ${WEIGHTS.map((w) => `'${w}'`).join(' | ')};
export const PHOSPHOR_NAMES = ${JSON.stringify(ICONS, null, 2)} as const;
export type IconName = keyof typeof PHOSPHOR_NAMES;
/** path su viewBox 256×256, fill currentColor */
export const PHOSPHOR: Record<IconName, Record<IconWeight, string[]>> = ${JSON.stringify(out)};
`,
);
console.log(`${Object.keys(ICONS).length} icone Phosphor ${version} scritte in`, target);
