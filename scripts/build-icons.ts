/**
 * Phosphor Icons (https://phosphoricons.com, MIT), peso regular → projects/ui-toolkit/src/lib/icon/icons.generated.ts
 * Il set incluso in `<ui-icon>`: solo le icone elencate qui, sotto nomi semantici. Le icone di dominio delle app si
 * registrano con `provideIcons()`. Per aggiungere un'icona: aggiungerla a ICONS e lanciare `npm run icons`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** nome semantico → nome Phosphor */
const ICONS: Record<string, string> = {
  home: 'house', trophy: 'trophy', standings: 'chart-bar', calendar: 'calendar', user: 'user', users: 'users',
  shield: 'shield-check', ball: 'soccer-ball', cards: 'cards', whistle: 'flag', clock: 'clock', pin: 'map-pin',
  share: 'share-network', 'chevron-left': 'caret-left', 'chevron-right': 'caret-right', 'chevron-down': 'caret-down',
  'chevron-up': 'caret-up', sun: 'sun', moon: 'moon', close: 'x', check: 'check', alert: 'warning-circle', info: 'info',
  plus: 'plus', search: 'magnifying-glass', login: 'sign-in', logout: 'sign-out', download: 'download-simple',
  star: 'star', penalty: 'target', edit: 'pencil-simple', trash: 'trash', grip: 'dots-six-vertical',
  rules: 'file-text', euro: 'currency-eur', gavel: 'gavel', news: 'newspaper', list: 'list',
  'list-ordered': 'list-numbers', quote: 'quotes', link: 'link', image: 'image', file: 'file', play: 'play', eye: 'eye',
  mail: 'envelope', settings: 'gear-six', grid: 'squares-four', inbox: 'tray',
};

const root = resolve(import.meta.dirname, '../node_modules/@phosphor-icons/core');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;

const out: Record<string, string[]> = {};
for (const [name, ph] of Object.entries(ICONS)) {
  const svg = readFileSync(resolve(root, 'assets/regular', `${ph}.svg`), 'utf8');
  if (!svg.includes('viewBox="0 0 256 256"')) throw new Error(`${ph}: viewBox inatteso`);
  out[name] = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  if (!out[name].length) throw new Error(`${ph}: nessun path`);
}

const target = resolve(import.meta.dirname, '../projects/ui-toolkit/src/lib/icon/icons.generated.ts');
writeFileSync(
  target,
  `/* GENERATO da scripts/build-icons.ts (@phosphor-icons/core ${version}, regular, MIT — https://phosphoricons.com) — non modificare a mano. */
/** Path su viewBox 256×256, fill currentColor. */
export const BUILTIN_ICONS = ${JSON.stringify(out, null, 1)} as const satisfies Record<string, readonly string[]>;
`,
);
console.log(`${Object.keys(ICONS).length} icone Phosphor ${version} scritte in`, target);
