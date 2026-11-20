# ui-toolkit

Libreria di componenti Angular del design system **C85 glass**, documentata in Storybook. Specifica: [`linee-guida.md`](linee-guida.md).

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
```

La pubblicazione del pacchetto è gestita dal proprietario del progetto (nessun registry configurato).
