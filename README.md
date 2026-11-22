# ui-toolkit

Libreria di componenti Angular del design system **C85**, documentata in Storybook. Specifica: [`linee-guida.md`](linee-guida.md).

| Pacchetto | Contenuto |
| --- | --- |
| `ui-toolkit` | componenti Angular standalone (signals, OnPush, zoneless) |
| `ui-toolkit/tokens` | `tokens.ts` (fonte unica), helper colore (`contrastRatio`, `blend`, `oklch`, `fromOklch`, `onColor`, `deriveTone`, `snapToMode`), palette |
| `ui-toolkit/styles/*` | `tokens.css`, `tailwind-preset.css` (generati), `base.css`, `fonts.css` + woff2 self-hosted |

## Comandi

```bash
npm run tokens           # tokens.ts → styles/tokens.css + styles/tailwind-preset.css
npm run build            # tokens + build libreria (APF, @angular/build:library) → dist/ui-toolkit
npm run storybook        # Storybook su :6006
npm run test:tokens      # contrasti WCAG, CSS ≡ TS, deriveTone, font, lint colori
npm run test:storybook   # ogni storia in Chromium headless con axe (a11y: error) + play
npm test                 # tutto
npm run icons            # rigenera le icone Phosphor usate dalle storie
npm run pack             # build + tarball installabile in release/ui-toolkit-<versione>.tgz
```

## Installare in un altro progetto

Il pacchetto non è su npm: ogni versione è un tarball allegato a una [GitHub Release](https://github.com/mccasor/ui-toolkit/releases).

```bash
npm i https://github.com/mccasor/ui-toolkit/releases/download/v0.4.0/ui-toolkit-0.4.0.tgz
```

Un solo comando: `chart.js` è una dipendenza del pacchetto e `@angular/cdk` (peer dependency) viene installata in automatico da npm ≥ 7 e pnpm. Con Yarn aggiungila a mano (`yarn add @angular/cdk@^22.3.0`).

Poi, nel CSS globale dell'app:

```css
@import 'ui-toolkit/styles/fonts.css';
@import 'ui-toolkit/styles/tokens.css';
@import 'ui-toolkit/styles/base.css';
```

Uso dei componenti, temi e Tailwind: vedi il [README del pacchetto](projects/ui-toolkit/README.md).

### Nuova versione

1. aggiorna `version` in `projects/ui-toolkit/package.json`;
2. `npm test && npm run pack`;
3. `git tag vX.Y.Z && git push --tags`;
4. `gh release create vX.Y.Z release/ui-toolkit-X.Y.Z.tgz --title "vX.Y.Z" --notes "…"`.

## Licenza

[MIT](LICENSE). I font in `projects/ui-toolkit/styles/fonts/` sono sotto SIL Open Font License.
