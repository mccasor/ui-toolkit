/** Stili comuni alle pagine Foundations (solo token). */
export const FOUNDATION_STYLES = `
:host { display: block; color: var(--ui-text); font-family: var(--ui-font-sans); }
.fd-page { max-width: 72rem; margin-inline: auto; display: grid; gap: 1.5rem; }
.fd-card { border-radius: var(--ui-radius-card); padding: var(--ui-card-padding-md); }
.fd-scroll { overflow-x: auto; }
.fd-intro { margin: 0; color: var(--ui-text-muted); font-size: var(--ui-font-size-sm); max-width: 48rem; }
.fd-h2 { margin: 0 0 0.75rem; }
.fd-table { width: 100%; border-collapse: collapse; font-size: var(--ui-font-size-sm); }
.fd-table caption { text-align: left; }
.fd-table th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--ui-border); white-space: nowrap; }
.fd-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--ui-border); vertical-align: middle; }
.fd-table tr:last-child td { border-bottom: 0; }
.fd-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.8125rem; }
.fd-pass { color: var(--ui-success-text); font-weight: 600; }
.fd-fail { color: var(--ui-danger-text); font-weight: 600; }
.fd-muted { color: var(--ui-text-muted); }
.fd-grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); }
`;

export const fmt = (n: number) => `${n.toFixed(2)}:1`;
