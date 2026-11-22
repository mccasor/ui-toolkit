import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FONT, TRACKING, TYPE } from 'ui-toolkit/tokens';
import { FOUNDATION_STYLES } from './shared';

const CLASS: Record<string, string> = {
  displayHero: 'ui-display-hero',
  h1: 'ui-h1',
  h2Display: 'ui-h2-display',
  cardTitle: 'ui-card-title',
  sectionTitle: 'ui-section-title',
  body: 'ui-body',
  bodySm: 'ui-body-sm',
  label: 'ui-label',
  caption: 'ui-caption',
  micro: 'ui-micro',
  tableHeader: 'ui-table-header',
  button: 'ui-btn-type',
  numberLg: 'ui-number-lg',
  numeric: 'font-numeric',
  boH1: 'ui-bo-h1',
};

const SAMPLE: Record<string, string> = {
  displayHero: 'Torneo C85',
  h1: 'Classifica',
  h2Display: 'Prossime partite',
  cardTitle: 'Girone A',
  sectionTitle: 'Partite di oggi',
  body: 'Testo corrente per descrizioni e contenuti.',
  bodySm: '12 squadre, 3 campi, sabato 21 novembre',
  label: 'Nome squadra',
  caption: 'Aggiornato 2 min fa',
  micro: 'MR',
  tableHeader: 'Punti',
  button: 'Iscriviti',
  numberLg: '3 – 2',
  numeric: "12, 45', 1.024",
  boH1: 'Gestione tornei',
};

@Component({
  selector: 'fd-typography',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <section class="glass fd-card" aria-labelledby="fam-h">
        <h2 id="fam-h" class="ui-card-title fd-h2">Famiglie</h2>
        <div class="fams">
          <div>
            <p class="ui-meta">--ui-font-sans, 200–800</p>
            <p class="sans">Manrope Aa Bb Cc 0123456789</p>
            <p class="fd-code fd-muted">{{ font.sans }}</p>
          </div>
          <div>
            <p class="ui-meta">--ui-font-display, 500 / 600 / 700</p>
            <p class="display">Barlow Condensed 0123456789</p>
            <p class="fd-code fd-muted">{{ font.display }}</p>
          </div>
        </div>
        <p class="ui-body-sm fd-muted">
          Pesi ammessi: {{ font.weights.join(', ') }}. Body 16px / 1.5, antialiased, optimizeLegibility; h1–h3 con text-wrap: balance. Solo i display salgono
          di un gradino da 640px.
        </p>
      </section>

      <section class="glass fd-card" aria-labelledby="ger-h">
        <h2 id="ger-h" class="ui-card-title fd-h2">Gerarchia</h2>
        <div class="fd-scroll" tabindex="0" aria-label="Tabella gerarchia tipografica">
          <table class="fd-table">
            <thead>
              <tr>
                <th scope="col" class="ui-table-header">Livello</th>
                <th scope="col" class="ui-table-header">Esempio</th>
                <th scope="col" class="ui-table-header">Specifiche</th>
              </tr>
            </thead>
            <tbody>
              @for (t of rows; track t.key) {
                <tr>
                  <th scope="row">
                    <span class="fd-code">.{{ t.cls }}</span>
                    <div class="ui-caption fd-muted">{{ t.style.use }}</div>
                  </th>
                  <td>
                    <span [class]="t.cls">{{ t.sample }}</span>
                  </td>
                  <td class="fd-code fd-muted spec">{{ t.spec }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="glass fd-card" aria-labelledby="tr-h">
        <h2 id="tr-h" class="ui-card-title fd-h2">Tracking</h2>
        <p class="ui-body-sm fd-muted">Tracking solo sulla voce display (maiuscole condensed) e sui numeri. Etichette, header tabella, badge e tagline sono in frase, senza maiuscole spaziate.</p>
        <ul class="tracking">
          @for (t of tracking; track t[0]) {
            <li>
              <span class="fd-code">--ui-tracking-{{ t[0] }}</span> <span class="fd-code fd-muted">{{ t[1] }}</span>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .fams { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
      .fams p { margin: 0 0 0.25rem; }
      .sans { font-family: var(--ui-font-sans); font-size: 1.5rem; font-weight: 600; }
      .display { font-family: var(--ui-font-display); font-size: 1.75rem; font-weight: 700; }
      .spec { white-space: normal; min-width: 14rem; }
      .ui-btn-type { font-size: var(--ui-type-button-size); font-weight: 600; line-height: 1; }
      .tracking { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.25rem; }
      .tracking li { display: flex; gap: 0.75rem; }
    `,
  ],
})
class TypographyPage {
  protected readonly font = FONT;
  protected readonly tracking = Object.entries(TRACKING).map(([k, v]) => [k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()), v]);
  protected readonly rows = Object.entries(TYPE).map(([key, style]) => ({
    key,
    style,
    cls: CLASS[key],
    sample: SAMPLE[key],
    spec: [
      style.family,
      style.size ? `${style.size}${style.sizeSm ? ' → ' + style.sizeSm + ' (≥640px)' : ''}` : 'eredita',
      style.lineHeight ? `lh ${style.lineHeight}` : null,
      `${style.weight}`,
      style.transform ? 'UPPERCASE' : null,
      style.tracking ? `tracking ${style.tracking}` : null,
      style.numeric ? 'tabular-nums' : null,
      style.color ? 'text-muted' : null,
    ]
      .filter(Boolean)
      .join(', '),
  }));
}

const meta: Meta = {
  title: 'Foundations/Tipografia',
  tags: ['!autodocs'],
  render: () => ({ template: `<fd-typography />`, moduleMetadata: { imports: [TypographyPage] } }),
};
export default meta;
export const Gerarchia: StoryObj = {};
