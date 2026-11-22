# ui-toolkit

Componenti Angular e design token del design system C85. Superfici calde e piene, un solo colore d'azione (arancio) e numeri in condensed. Tre temi: light, dark e backoffice.

- `ui-toolkit`: componenti standalone (signal input/model, OnPush, compatibili zoneless).
- `ui-toolkit/tokens`: token TypeScript e helper colore (contrasto, OKLCH, `deriveTone`, palette dei grafici).
- `ui-toolkit/styles/*`: CSS dei token, base, font self-hosted e preset Tailwind 4.

Documentazione e storie: Storybook del repository ([mccasor/ui-toolkit](https://github.com/mccasor/ui-toolkit)).

## Installazione

Il pacchetto non è su npm: si installa dal tarball allegato alle [GitHub Release](https://github.com/mccasor/ui-toolkit/releases).

```bash
npm i https://github.com/mccasor/ui-toolkit/releases/download/v0.2.0/ui-toolkit-0.2.0.tgz
```

Basta questo comando: `chart.js` è una dipendenza del pacchetto (caricata on demand solo se usi `<ui-chart>`), e `@angular/cdk` è una peer dependency che npm ≥ 7 e pnpm installano in automatico, in un'unica copia condivisa con l'app. Con Yarn aggiungila a mano: `yarn add @angular/cdk@^22.3.0`.

Requisiti: Angular ≥ 22.3.

## Stili

Importa gli stili una volta sola, nel CSS globale dell'app (es. `src/styles.css`):

```css
@import 'ui-toolkit/styles/fonts.css';   /* Manrope + Barlow Condensed, woff2 self-hosted */
@import 'ui-toolkit/styles/tokens.css';  /* custom properties --ui-*, --bo-*, --brand-* */
@import 'ui-toolkit/styles/base.css';    /* superfici, tipografia, bottoni, input, preferenze, stampa */
```

Con Tailwind 4 aggiungi il preset dopo `tailwindcss`:

```css
@import 'tailwindcss';
@import 'ui-toolkit/styles/tokens.css';
@import 'ui-toolkit/styles/tailwind-preset.css'; /* bg-surface, text-muted, text-accent, font-display, rounded-card… */
```

In alternativa a `@import`, puoi elencare i file in `angular.json` → `styles`:
`node_modules/ui-toolkit/styles/fonts.css`, `…/tokens.css`, `…/base.css`.

## Uso

```ts
import { Component, inject, signal } from '@angular/core';
import { Button, Field, FieldInput, GlassCard, ToastRegion, ToastService } from 'ui-toolkit';

@Component({
  selector: 'app-root',
  imports: [Button, Field, FieldInput, GlassCard, ToastRegion],
  template: `
    <ui-glass-card>
      <ui-field label="Nome squadra" required>
        <input uiInput [value]="nome()" (input)="nome.set($any($event.target).value)" />
      </ui-field>
      <button uiButton variant="primary" (click)="salva()">Salva</button>
    </ui-glass-card>
    <ui-toast-region />
  `,
})
export class App {
  private readonly toast = inject(ToastService);
  protected readonly nome = signal('');
  protected salva() {
    this.toast.success('Squadra salvata', this.nome());
  }
}
```

Componenti disponibili: Button, Icon, GlassCard, Badge, RoleChip, Spinner, Skeleton, Field/FieldInput, Segmented, Select, Dialog (DialogService: `open`, `confirm`, `choose`, `closeAll`), Toast (ToastService + `<ui-toast-region>`), EmptyState, Stat, Table, Avatar, TeamLogo, Carousel, TabCarousel, Header, TabBar, Chart, ColorSwatches, ImageInput, StickyBar, Footer.

### Integrazione con l'app

Hook opzionali, tutti forniti dall'app nei `providers`:

| Provider | A cosa serve |
|---|---|
| `provideIcons({ nome: ['M…'] })` | Icone di dominio in più (o al posto di) quelle incluse in `<ui-icon>` (Phosphor regular, griglia 256). |
| `provideUiLabels(signal)` | Testi predefiniti dei componenti (Annulla, Chiudi, Cerca, errori immagine…), anche reattivi al cambio lingua; le chiavi mancanti restano in italiano. |
| `{ provide: UI_DISABLED_SCOPE, useValue: Signal<boolean> }` | Disabilita i bottoni con l'attributo `write` (es. dati in sola lettura). |
| `provideUiLinkHandler((href, e) => …)` | Navigazione dei link interni (righe di Table) col router dell'app, senza ricaricare la pagina. |
| `{ provide: UI_IMAGE_RESOLVER, useValue: { handles, peek, resolve } }` | `src` di Avatar / TeamLogo / ImageInput che l'app risolve da sé (es. riferimenti a immagini salvate). |
| `{ provide: IMAGE_RESIZER, … }`, `{ provide: UI_CHART_LOADER, … }` | Sostituti di ridimensionamento immagini e Chart.js nei test. |

### Temi

- **light / dark**: senza attributo segue `prefers-color-scheme`; per forzarlo usa `<html data-theme="light">` o `data-theme="dark"`.
- **backoffice**: aggiungi la classe `bo` al contenitore (piatto, compatto, desktop).
- Preferenze forzabili su `<html>`: `data-motion="reduce"`, `data-transparency="reduce"`, `data-contrast="more"`.

### Token in TypeScript

```ts
import { THEMES, contrastRatio, deriveTone, chartSeries } from 'ui-toolkit/tokens';

deriveTone(255);        // fill / hover / border / text / soft per una nuova tinta
chartSeries('dark');    // rampa delle serie dei grafici
```

## Note

- I componenti usano solo token, nessun colore letterale: per personalizzare ridefinisci le custom properties `--ui-*`.
- `<ui-chart>` carica `chart.js` on demand: se non usi grafici non finisce nel bundle iniziale.
- I font sono distribuiti con le loro licenze OFL in `styles/fonts/`.

## Licenza

MIT (vedi `LICENSE`). I font Manrope e Barlow Condensed restano sotto SIL Open Font License.
