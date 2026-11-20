/**
 * Generatori: tokens.ts → tokens.css (custom properties) e tailwind-preset.css (@theme inline).
 * Usati da scripts/build-tokens.ts e dal test di sincronizzazione.
 */
import {
  BACKOFFICE,
  BACKOFFICE_REMAP,
  BRAND,
  FONT,
  FONT_SIZE,
  LAYOUT,
  MOTION,
  RADIUS,
  SPACE,
  STRUCTURAL_DEFAULTS,
  THEMES,
  TRACKING,
  TYPE,
  Z,
  type BackofficeTokens,
  type ThemeTokens,
} from './tokens';

export const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/\./g, '_').toLowerCase();

const HEADER = '/* GENERATO da projects/ui-toolkit/tokens/src/tokens.ts con `npm run tokens` — non modificare a mano. */';

type Decl = [name: string, value: string | number];

const block = (selector: string, decls: Decl[], indent = '') =>
  `${indent}${selector} {\n${decls.map(([n, v]) => `${indent}  ${n}: ${v};`).join('\n')}\n${indent}}`;

const themeDecls = (t: ThemeTokens): Decl[] => Object.entries(t).map(([k, v]) => [`--ui-${kebab(k)}`, v]);
const boDecls = (t: BackofficeTokens): Decl[] => Object.entries(t).map(([k, v]) => [`--bo-${kebab(k)}`, v]);

/** Token indipendenti dal tema (scale, font, motion, layout, z-index). */
export function staticDecls(): Decl[] {
  const d: Decl[] = [];
  for (const [k, v] of Object.entries(BRAND)) d.push([`--brand-${k}`, v.hex]);
  d.push(['--ui-font-sans', FONT.sans], ['--ui-font-display', FONT.display]);
  for (const [k, v] of Object.entries(FONT_SIZE)) d.push([`--ui-font-size-${k}`, v]);
  for (const [k, v] of Object.entries(TRACKING)) d.push([`--ui-tracking-${kebab(k)}`, v]);
  for (const [name, s] of Object.entries(TYPE)) {
    const p = `--ui-type-${kebab(name)}`;
    d.push([`${p}-family`, `var(--ui-font-${s.family})`]);
    if (s.size) d.push([`${p}-size`, s.size]);
    if (s.sizeSm) d.push([`${p}-size-sm`, s.sizeSm]);
    if (s.lineHeight) d.push([`${p}-line-height`, s.lineHeight]);
    d.push([`${p}-weight`, typeof s.weight === 'number' ? s.weight : parseInt(s.weight, 10)]);
    if (s.tracking) d.push([`${p}-tracking`, s.tracking]);
  }
  for (const [k, v] of Object.entries(SPACE.scale)) d.push([`--ui-space-${kebab(k)}`, v]);
  for (const [k, v] of Object.entries(SPACE.cardPadding)) d.push([`--ui-card-padding-${k}`, v]);
  d.push(
    ['--ui-gap-inline', SPACE.gapInline],
    ['--ui-gap-list', SPACE.gapList],
    ['--ui-gap-section', SPACE.gapSection],
    ['--ui-gap-section-lg', SPACE.gapSectionLg],
  );
  for (const [k, v] of Object.entries(RADIUS)) if (typeof v === 'string') d.push([`--ui-radius-${kebab(k)}`, v]);
  d.push(
    ['--ui-container-max', LAYOUT.containerMax],
    ['--ui-page-padding-x', LAYOUT.pagePaddingX],
    ['--ui-page-padding-top', LAYOUT.pagePaddingTop],
    ['--ui-header-height', LAYOUT.headerHeight],
    ['--ui-tabbar-height', LAYOUT.tabbarHeight],
    ['--ui-bo-topbar-height', LAYOUT.boTopbarHeight],
    ['--ui-sticky-top', LAYOUT.stickyTop],
    ['--ui-tabbar-reserve', LAYOUT.tabbarReserve],
    ['--ui-touch-target', LAYOUT.touchTarget],
  );
  for (const [k, v] of Object.entries(LAYOUT.controlHeight)) d.push([`--ui-control-height-${k}`, v]);
  for (const [k, v] of Object.entries(LAYOUT.buttonPaddingX)) d.push([`--ui-button-padding-x-${k}`, v]);
  for (const [k, v] of Object.entries(Z)) d.push([`--ui-z-${kebab(k)}`, v]);
  d.push(['--ui-ease', MOTION.ease]);
  for (const [k, v] of Object.entries(MOTION.duration)) d.push([`--ui-duration-${kebab(k)}`, v]);
  d.push(
    ['--ui-press-scale', MOTION.pressScale],
    ['--ui-card-active-scale', MOTION.cardActiveScale],
    ['--ui-tab-press-scale', MOTION.tabPressScale],
    ['--ui-card-lift', MOTION.cardLift],
  );
  return d;
}

export function buildTokensCss(): string {
  const structural: Decl[] = Object.entries(STRUCTURAL_DEFAULTS).map(([k, v]) => [`--ui-${k}`, v]);
  const light: Decl[] = [...themeDecls(THEMES.light), ...boDecls(BACKOFFICE.light), ['color-scheme', 'light']];
  const dark: Decl[] = [...themeDecls(THEMES.dark), ...boDecls(BACKOFFICE.dark), ['color-scheme', 'dark']];
  const remap: Decl[] = Object.entries(BACKOFFICE_REMAP).map(([k, v]) => [`--ui-${k}`, v]);

  return [
    HEADER,
    '',
    '/* Scale, font, motion, layout, z-index + alias strutturali */',
    block(':root', [...staticDecls(), ...structural]),
    '',
    '/* Tema light (default) */',
    block(":root,\n[data-theme='light']", light),
    '',
    '/* Tema dark di sistema (senza override esplicito) */',
    '@media (prefers-color-scheme: dark) {',
    block(":root:not([data-theme='light'])", dark, '  '),
    '}',
    '',
    '/* Tema dark forzato */',
    block("[data-theme='dark']", dark),
    '',
    '/* Backoffice: rimappa --ui-* su --bo-* (piatto, compatto, desktop) */',
    block('.bo', remap),
    '',
  ].join('\n');
}

export function buildTailwindPreset(): string {
  const colors = [...Object.keys(THEMES.light).filter((k) => !/^(shadow|mesh|backdrop)/.test(k)).map(kebab), ...Object.keys(STRUCTURAL_DEFAULTS).filter((k) => /surface|row|table-header/.test(k))];
  const d: Decl[] = [];
  for (const c of colors) d.push([`--color-${c}`, `var(--ui-${c})`]);
  // alias richiesti: text-muted, text-accent, text-fg
  d.push(['--color-muted', 'var(--ui-text-muted)'], ['--color-accent', 'var(--ui-accent-text)'], ['--color-fg', 'var(--ui-text)']);
  for (const k of Object.keys(BRAND)) d.push([`--color-brand-${k}`, `var(--brand-${k})`]);
  d.push(['--font-sans', 'var(--ui-font-sans)'], ['--font-display', 'var(--ui-font-display)']);
  for (const k of Object.keys(FONT_SIZE)) if (!['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'].includes(k)) d.push([`--text-${k}`, `var(--ui-font-size-${k})`]);
  for (const k of Object.keys(TRACKING)) d.push([`--tracking-${kebab(k)}`, `var(--ui-tracking-${kebab(k)})`]);
  for (const [k, v] of Object.entries(RADIUS)) if (typeof v === 'string') d.push([`--radius-${kebab(k)}`, `var(--ui-radius-${kebab(k)})`]);
  d.push(['--shadow-glass', 'var(--ui-shadow-glass)'], ['--shadow-float', 'var(--ui-shadow-float)']);
  d.push(['--ease-ui', 'var(--ui-ease)']);
  d.push(
    ['--spacing-header', 'var(--ui-header-height)'],
    ['--spacing-tabbar', 'var(--ui-tabbar-height)'],
    ['--spacing-touch', 'var(--ui-touch-target)'],
    ['--container-page', 'var(--ui-container-max)'],
    ['--breakpoint-sm', '40rem'],
    ['--breakpoint-lg', '64rem'],
  );
  return [
    HEADER,
    '/* Uso: @import "tailwindcss"; @import "ui-toolkit/styles/tokens.css"; @import "ui-toolkit/styles/tailwind-preset.css"; */',
    '',
    block('@theme inline', d),
    '',
    '@utility font-numeric {',
    '  font-family: var(--ui-font-display);',
    '  font-variant-numeric: tabular-nums;',
    '  letter-spacing: var(--ui-tracking-numeric);',
    '}',
    '',
  ].join('\n');
}
