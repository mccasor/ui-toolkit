/**
 * ui-toolkit — fonte unica dei design token (C85 glass).
 *
 * Tutti i valori sono presi alla lettera da "Linee guida libreria componenti C85".
 * Dove il documento non fissa un valore e serve comunque un token, il valore è
 * marcato con `@derived` e la regola usata è indicata nel commento.
 *
 * Da questo file `scripts/build-tokens.ts` genera `styles/tokens.css` e
 * `styles/tailwind-preset.css`; il test `tokens-sync.spec.ts` fallisce se divergono.
 */

/* ------------------------------------------------------------------ Brand */

export const BRAND = {
  orange: { hex: '#FFB936', oklch: [0.83, 0.158, 78], use: 'primary, attivo, selezione, focus in dark' },
  red: { hex: '#CE2828', oklch: [0.55, 0.201, 27], use: 'danger, errori, cartellini' },
  green: { hex: '#2E8B57', oklch: [0.57, 0.119, 155], use: 'success, solo nel mesh e nei soft' },
  ink: { hex: '#1E1E1E', oklch: [0.24, 0, null], use: 'testo, testo su primary, nav attiva in light' },
} as const;

export const WHITE = '#FFFFFF';

/* ------------------------------------------------------- Token semantici */

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceStrong: string;
  surfaceSolid: string;
  surfaceSunken: string;
  text: string;
  textMuted: string;
  accentText: string;
  primary: string;
  primaryHover: string;
  primaryBorder: string;
  onPrimary: string;
  danger: string;
  dangerHover: string;
  onDanger: string;
  dangerText: string;
  success: string;
  onSuccess: string;
  successText: string;
  warning: string;
  onWarning: string;
  warningText: string;
  brandSoft: string;
  dangerSoft: string;
  successSoft: string;
  warningSoft: string;
  border: string;
  borderStrong: string;
  glassEdge: string;
  focus: string;
  navActiveBg: string;
  navActiveFg: string;
  skeleton: string;
  skeletonShine: string;
  backdrop: string;
  shadowGlass: string;
  shadowFloat: string;
  /** ombra header "0 8px 24px -18px": il documento non dà il colore → @derived ink (light) / nero (dark) come le altre ombre */
  shadowHeader: string;
  meshAlpha: string;
}

export const THEMES: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    bg: '#FFF6E8',
    surface: 'rgb(255 255 255 / 0.72)',
    surfaceStrong: 'rgb(255 255 255 / 0.86)',
    surfaceSolid: '#FFFCF7',
    surfaceSunken: 'rgb(30 30 30 / 0.05)',
    text: '#1E1E1E',
    textMuted: '#4F4A44',
    accentText: '#8A4B00',
    primary: '#FFB936',
    primaryHover: '#FFAA0D',
    primaryBorder: '#E09A14',
    onPrimary: '#1E1E1E',
    danger: '#CE2828',
    dangerHover: '#B32020',
    onDanger: '#FFFFFF',
    dangerText: '#A31C1C',
    success: '#23704A',
    onSuccess: '#FFFFFF',
    successText: '#1D6341',
    warning: '#F5A524',
    onWarning: '#1E1E1E',
    warningText: '#7A4A00',
    // *-soft = fill con alpha 28 / 12 / 14 / 18 %
    brandSoft: 'rgb(255 185 54 / 0.28)',
    dangerSoft: 'rgb(206 40 40 / 0.12)',
    successSoft: 'rgb(35 112 74 / 0.14)',
    warningSoft: 'rgb(245 165 36 / 0.18)',
    border: 'rgb(30 30 30 / 0.10)',
    borderStrong: '#7A726A',
    glassEdge: 'rgb(255 255 255 / 0.75)',
    focus: '#1E1E1E',
    navActiveBg: '#1E1E1E',
    navActiveFg: '#FFB936',
    skeleton: 'rgb(30 30 30 / 0.08)',
    skeletonShine: 'rgb(255 255 255 / 0.6)',
    backdrop: 'rgb(15 15 16 / 0.45)',
    shadowGlass:
      '0 1px 0 0 rgb(255 255 255 / .6) inset, 0 10px 30px -12px rgb(90 50 0 / .25), 0 2px 6px -2px rgb(30 30 30 / .08)',
    shadowFloat: '0 18px 40px -16px rgb(30 30 30 / .4), 0 4px 12px -4px rgb(30 30 30 / .15)',
    shadowHeader: '0 8px 24px -18px rgb(30 30 30 / .4)',
    meshAlpha: '0.45',
  },
  dark: {
    bg: '#0F0F10',
    surface: 'rgb(30 30 30 / 0.70)',
    surfaceStrong: 'rgb(30 30 30 / 0.86)',
    surfaceSolid: '#1E1E1E',
    surfaceSunken: 'rgb(255 255 255 / 0.06)',
    text: '#F7F5F2',
    textMuted: '#C4BDB4',
    accentText: '#FFB936',
    primary: '#FFB936',
    primaryHover: '#FFAA0D',
    primaryBorder: '#E09A14',
    onPrimary: '#1E1E1E',
    danger: '#CE2828',
    dangerHover: '#B32020',
    onDanger: '#FFFFFF',
    dangerText: '#FF8A80',
    success: '#23704A',
    onSuccess: '#FFFFFF',
    successText: '#6EDC9E',
    warning: '#F5A524',
    onWarning: '#1E1E1E',
    warningText: '#FFC857',
    // *-soft dark = 18 / 22 / 24 / 20 %
    brandSoft: 'rgb(255 185 54 / 0.18)',
    dangerSoft: 'rgb(206 40 40 / 0.22)',
    successSoft: 'rgb(35 112 74 / 0.24)',
    warningSoft: 'rgb(245 165 36 / 0.20)',
    border: 'rgb(255 255 255 / 0.10)',
    borderStrong: '#8C857D',
    glassEdge: 'rgb(255 255 255 / 0.12)',
    focus: '#FFB936',
    navActiveBg: '#FFB936',
    navActiveFg: '#1E1E1E',
    skeleton: 'rgb(255 255 255 / 0.08)',
    skeletonShine: 'rgb(255 255 255 / 0.12)',
    backdrop: 'rgb(15 15 16 / 0.45)',
    shadowGlass: '0 1px 0 0 rgb(255 255 255 / .06) inset, 0 12px 32px -12px rgb(0 0 0 / .6)',
    shadowFloat: '0 18px 40px -12px rgb(0 0 0 / .7)',
    shadowHeader: '0 8px 24px -18px rgb(0 0 0 / .7)',
    meshAlpha: '0.30',
  },
};

/* ------------------------------------------------------------ Backoffice */

export interface BackofficeTokens {
  bg: string;
  surface: string;
  surfaceAlt: string;
  rowHover: string;
  divider: string;
  border: string;
  textMuted: string;
  sidebar: string;
  /** @derived testo sidebar = text del tema dark (sidebar sempre scura) */
  sidebarText: string;
  /** @derived testo secondario sidebar = text-muted del tema dark */
  sidebarMuted: string;
  /** voce attiva: orange su ink */
  sidebarActiveBg: string;
  sidebarActiveFg: string;
  /** "float leggero": @derived metà profondità di shadow-float */
  shadowFloat: string;
}

export const BACKOFFICE: { light: BackofficeTokens; dark: BackofficeTokens } = {
  light: {
    bg: '#F3F2F0',
    surface: '#FFFFFF',
    surfaceAlt: '#F8F7F5',
    rowHover: '#FFF3DC',
    divider: '#E2DFDA',
    border: '#837C74',
    textMuted: '#57524C',
    sidebar: '#1E1E1E',
    sidebarText: '#F7F5F2',
    sidebarMuted: '#C4BDB4',
    sidebarActiveBg: '#FFB936',
    sidebarActiveFg: '#1E1E1E',
    shadowFloat: '0 8px 20px -12px rgb(30 30 30 / .3), 0 2px 6px -2px rgb(30 30 30 / .1)',
  },
  dark: {
    bg: '#111112',
    surface: '#1B1B1D',
    surfaceAlt: '#232326',
    rowHover: '#2E2A22',
    divider: '#313135',
    border: '#837C74',
    textMuted: '#B3ACA3',
    sidebar: '#0A0A0B',
    sidebarText: '#F7F5F2',
    sidebarMuted: '#C4BDB4',
    sidebarActiveBg: '#FFB936',
    sidebarActiveFg: '#1E1E1E',
    shadowFloat: '0 8px 20px -10px rgb(0 0 0 / .6)',
  },
};

/**
 * Come `.bo` rimappa i token --ui-* sui --bo-*. Chiave = token --ui-*, valore = espressione CSS.
 * I componenti leggono solo --ui-*: non sanno in che tema sono.
 */
export const BACKOFFICE_REMAP: Record<string, string> = {
  bg: 'var(--bo-bg)',
  surface: 'var(--bo-surface)',
  'surface-strong': 'var(--bo-surface)',
  'surface-solid': 'var(--bo-surface)',
  'surface-alt': 'var(--bo-surface-alt)',
  'row-hover': 'var(--bo-row-hover)',
  'row-zebra': 'var(--bo-surface-alt)',
  'table-header-bg': 'var(--bo-surface-alt)',
  'table-header-position': 'sticky',
  border: 'var(--bo-divider)',
  'border-strong': 'var(--bo-border)',
  'glass-edge': 'var(--bo-divider)',
  'text-muted': 'var(--bo-text-muted)',
  'shadow-glass': 'none',
  'shadow-float': 'var(--bo-shadow-float)',
  'glass-blur': 'none',
  'radius-card': '0.5rem',
  'radius-control': '0.375rem',
  /** @derived sm/lg: un gradino sotto/sopra il compatto 2.25rem del documento */
  'control-height-sm': '2rem',
  'control-height-md': '2.25rem',
  'control-height-lg': '2.75rem',
  'touch-target': '2.25rem',
  /** @derived tabelle dense e input compatti coerenti con controlli da 2.25rem */
  'table-cell-padding': '0.5rem 0.75rem',
  'input-padding': '0.375rem 0.75rem',
  'mesh-display': 'none',
};

/**
 * Token strutturali con valore di default nel tema pubblico (non sono colori nuovi:
 * alias di token esistenti). Il backoffice li rimappa sopra.
 */
export const STRUCTURAL_DEFAULTS: Record<string, string> = {
  'surface-alt': 'var(--ui-surface-sunken)',
  'row-hover': 'var(--ui-surface-sunken)',
  'row-zebra': 'transparent',
  'table-header-bg': 'transparent',
  'table-header-position': 'static',
  'glass-blur': 'blur(18px) saturate(170%)',
  'table-cell-padding': '0.75rem',
  'input-padding': '0.625rem 0.875rem',
  'mesh-display': 'block',
};

/* ------------------------------------------------------- Tipografia */

export const FONT = {
  sans: '"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  display: '"Barlow Condensed", "Manrope", ui-sans-serif, system-ui, sans-serif',
  /** I soli pesi ammessi: niente 300 o 900. */
  weights: [400, 600, 700, 800],
  body: { size: '16px', lineHeight: '1.5' },
} as const;

export interface TypeStyle {
  family: 'sans' | 'display';
  size?: string;
  /** size da 640px in su (solo i display salgono di un gradino) */
  sizeSm?: string;
  lineHeight?: string;
  weight: number | string;
  transform?: 'uppercase';
  tracking?: string;
  numeric?: boolean;
  color?: 'muted';
  use: string;
}

export const TYPE: Record<string, TypeStyle> = {
  displayHero: { family: 'display', size: '3rem', sizeSm: '3.75rem', lineHeight: '0.95', weight: 700, transform: 'uppercase', use: 'titolo pagina/torneo, landing' },
  h1: { family: 'display', size: '2.25rem', sizeSm: '3rem', lineHeight: '1', weight: 700, transform: 'uppercase', tracking: '0.025em', use: 'titoli di pagina interni' },
  h2Display: { family: 'display', size: '1.875rem', weight: 700, transform: 'uppercase', use: 'blocchi principali' },
  cardTitle: { family: 'sans', size: '1.125rem', weight: 800, use: 'titolo dentro card' },
  eyebrow: { family: 'sans', size: '0.75rem', weight: 800, transform: 'uppercase', tracking: '0.14em', color: 'muted', use: 'etichetta sopra le sezioni' },
  body: { family: 'sans', size: '1rem', lineHeight: '1.5', weight: '400–500', use: 'testo corrente' },
  bodySm: { family: 'sans', size: '0.875rem', lineHeight: '1.25rem', weight: '400–600', use: 'metadati, liste, hint' },
  label: { family: 'sans', size: '0.875rem', weight: 700, use: 'label di form' },
  caption: { family: 'sans', size: '0.75rem', lineHeight: '1rem', weight: '600–700', use: 'badge, note' },
  micro: { family: 'sans', size: '0.6875rem', weight: 700, use: 'chip iniziali, header tabella backoffice' },
  tableHeader: { family: 'sans', size: '0.75rem', weight: 700, transform: 'uppercase', tracking: '0.06em', color: 'muted', use: 'header tabella' },
  button: { family: 'sans', size: '0.9375rem', lineHeight: '1', weight: 700, use: 'bottone (sm 0.875rem, lg 1rem)' },
  numberLg: { family: 'display', size: '3rem', weight: 800, numeric: true, use: 'punteggi live, KPI' },
  numeric: { family: 'display', weight: 700, numeric: true, tracking: '0.01em', use: 'classifiche, minuti' },
  boH1: { family: 'sans', size: '1.375rem', lineHeight: '1.2', weight: 800, use: 'titoli pagina gestionale' },
};

export const TRACKING = {
  numeric: '0.01em',
  badge: '0.02em',
  h1: '0.025em',
  tableHeader: '0.06em',
  live: '0.08em',
  eyebrow: '0.14em',
  tagline: '0.18em',
} as const;

export const FONT_SIZE = {
  micro: '0.6875rem',
  xs: '0.75rem',
  sm: '0.875rem',
  button: '0.9375rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.375rem',
  '2xl': '1.875rem',
  '3xl': '2.25rem',
  '4xl': '3rem',
  '5xl': '3.75rem',
} as const;

/* ------------------------------------------- Spaziatura, raggi, layout */

/** Griglia 4px, scala Tailwind (1 = 0.25rem). */
export const SPACE = {
  unit: '0.25rem',
  /** gradini più usati, in ordine d'uso: 2, 3, 4, 1, 1.5, 6 */
  scale: { '1': '0.25rem', '1.5': '0.375rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem', '6': '1.5rem' },
  cardPadding: { sm: '0.75rem', md: '1rem', lg: '1.5rem' },
  gapInline: '0.5rem',
  gapList: '0.75rem',
  gapSection: '1.5rem',
  gapSectionLg: '2rem',
} as const;

export const RADIUS = {
  card: '1.25rem',
  control: '0.875rem',
  pill: '9999px',
  toast: '1rem',
  tile: '0.75rem',
  emptyIcon: '1rem',
  skeletonText: '0.375rem',
  tabBar: '1.5rem',
  logo: '28%',
  backoffice: { card: '0.5rem', control: '0.375rem' },
} as const;

export const LAYOUT = {
  containerMax: '64rem',
  pagePaddingX: 'max(1rem, env(safe-area-inset-left), env(safe-area-inset-right))',
  pagePaddingTop: '1.25rem',
  headerHeight: '3.75rem',
  tabbarHeight: '4rem',
  boTopbarHeight: '3.5rem',
  stickyTop: 'calc(env(safe-area-inset-top) + var(--ui-header-height))',
  tabbarReserve: 'calc(var(--ui-tabbar-height) + 2.5rem + env(safe-area-inset-bottom))',
  touchTarget: '2.75rem',
  controlHeight: { sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
  buttonPaddingX: { sm: '0.875rem', md: '1.125rem', lg: '1.5rem' },
  breakpoints: { sm: '640px', lg: '1024px' },
} as const;

export const Z = {
  stickyBar: 900,
  header: 1000,
  tabBar: 1000,
  toast: 1100,
  skipLink: 1200,
} as const;

/* ------------------------------------------------------------- Ombre */

/** Tile del logo nell'header: gradiente scuro #2c2c30 → #0f0f10 (uguale nei temi). */
export const LOGO_TILE = { from: '#2C2C30', to: '#0F0F10' } as const;

export const SHADOW = {
  light: { glass: THEMES.light.shadowGlass, float: THEMES.light.shadowFloat },
  dark: { glass: THEMES.dark.shadowGlass, float: THEMES.dark.shadowFloat },
  header: '0 8px 24px -18px',
} as const;

/* ------------------------------------------------------------- Motion */

export const MOTION = {
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  duration: {
    micro: '160ms',
    card: '200ms',
    dialog: '220ms',
    sheet: '260ms',
    toast: '260ms',
    page: '240ms',
    pageFade: '180ms',
    carouselHeight: '200ms',
    spinner: '700ms',
    live: '1.4s',
    skeleton: '1.4s',
  },
  pressScale: '0.97',
  cardActiveScale: '0.99',
  tabPressScale: '0.92',
  cardLift: '-2px',
} as const;

/* -------------------------------------------------------------- Mesh */

export const MESH = {
  inset: '-20vmax',
  saturate: '115%',
  fadeStop: '70%',
  blobs: [
    { color: 'orange', at: '12% 8%', radius: '40vmax' },
    { color: 'red', at: '92% 22%', radius: '34vmax' },
    { color: 'green', at: '70% 96%', radius: '36vmax' },
    { color: 'orange', at: '8% 88%', radius: '30vmax' },
  ],
} as const;
