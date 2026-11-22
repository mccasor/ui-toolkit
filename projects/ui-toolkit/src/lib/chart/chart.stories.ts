import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { GlassCard } from '../glass-card/glass-card';
import { Chart, type ChartData } from './chart';

const GOL: ChartData = {
  labels: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'],
  datasets: [
    { label: 'Leoni', data: [3, 1, 4, 2, 5, 3] },
    { label: 'Falchi', data: [1, 2, 2, 4, 1, 3] },
    { label: 'Aquile', data: [0, 3, 1, 1, 2, 4] },
  ],
};
const PUNTI: ChartData = { labels: ['Leoni', 'Falchi', 'Aquile', 'San Marco', 'Olimpia'], datasets: [{ label: 'Punti', data: [12, 9, 7, 4, 3] }] };
const MARCATORI: ChartData = {
  labels: ['Marco Bianchi', 'Luca Ferrari', 'Andrea Colombo', 'Davide Ricci', 'Simone Galli'],
  datasets: [{ label: 'Gol', data: [11, 9, 8, 6, 5] }],
};
/** parte del tutto: una sola barra orizzontale impilata, una serie per parte (max 3 nella rampa) */
const ESITI: ChartData = {
  labels: ['Partite'],
  datasets: [
    { label: 'Vittorie casa', data: [18] },
    { label: 'Pareggi', data: [6] },
    { label: 'Vittorie ospiti', data: [12] },
  ],
};
/** due squadre a confronto + la media del girone come serie di contesto */
const CONFRONTO: ChartData = {
  labels: GOL.labels,
  datasets: [GOL.datasets[0], GOL.datasets[1], { label: 'Media girone', data: [1.6, 2, 2.4, 2.2, 2.6, 3], context: true }],
};

type Args = { type: Chart['type'] extends () => infer T ? T : never; height: string };

/** Composizione consigliata: titolo (il "cosa") + didascalia con il messaggio (il "perché") sopra al grafico. */
const card = (title: string, insight: string, chart: string, style = '') => `<ui-glass-card style="${style}">
  <h3 class="ui-card-title" style="margin:0">${title}</h3>
  <p style="margin:.25rem 0 .75rem;font-size:var(--ui-font-size-sm);color:var(--ui-text-muted)">${insight}</p>
  ${chart}
</ui-glass-card>`;
const COPY: Record<string, [string, string]> = {
  line: ['Gol per giornata', 'I Leoni chiudono in crescita, le Aquile segnano di più nelle ultime giornate.'],
  bar: ['Classifica punti', 'Leoni in testa con 3 punti sui Falchi.'],
};

const meta: Meta<Args> = {
  title: 'Components/Chart',
  component: Chart,
  decorators: [moduleMetadata({ imports: [Chart, GlassCard] })],
  args: { type: 'line', height: '12rem' },
  argTypes: { type: { control: 'inline-radio', options: ['line', 'bar'] } },
  render: (args) => ({
    props: { ...args, data: args.type === 'bar' ? PUNTI : GOL },
    template: card(
      COPY[args.type][0],
      COPY[args.type][1],
      `<ui-chart [type]="type" [data]="data" [height]="height" ariaLabel="Gol segnati per giornata dalle prime tre squadre" categoryLabel="Giornata" />`,
      'max-width:36rem',
    ),
  }),
  parameters: {
    docs: {
      description: {
        component: `Wrapper Chart.js 4 caricato on demand: \`type\`, \`data\`, \`options\`, \`ariaLabel\`, \`height\` (12rem). Chart.js è una peer dependency
opzionale. Colori di assi (text-muted), griglia (border) e serie letti dai token e aggiornati al cambio tema: le serie usano \`chartSeries(mode)\`,
una rampa di luminosità sulla tinta accento (light L 0.42 / 0.54 / 0.66, dark arancio brand / 0.70 / 0.57; contrasto ≥ 3:1, ΔE ≥ 12 e ≥ 8 in
protanopia/deuteranopia). Al massimo 3 serie in evidenza: le serie \`context: true\` (media, riferimento) sono in text-muted tratteggiato.

**Accessibilità** — canvas \`role="img"\` con \`aria-label\`; i dati sono anche in una tabella \`sr-only\` con caption e intestazioni;
\`aria-busy\` finché la libreria non è caricata; animazioni off con reduced motion. Il canvas è focusabile: ←/→ (Home/End) scorrono le categorie
mostrando il tooltip e annunciando i valori in una live region; Esc chiude.

**Codifica** — una sola tinta: la prima serie è l'accento, le altre si allontanano di luminosità; le linee hanno tratteggi diversi,
ripetuti nella legenda, e nessun marker (il punto compare al passaggio o con la tastiera). Barre sempre con baseline a zero; griglia solo sull'asse dei valori; legenda nascosta con una
sola serie (il titolo basta). Numeri formattati con la lingua della pagina.

**Scelta del grafico** — confronto tra valori → \`bar\` (orizzontale con \`options: { indexAxis: 'y' }\` per etichette lunghe);
andamento nel tempo → \`line\`; parte del tutto → barra orizzontale impilata (\`stacked: true\`), mai torta o ciambella (in sviluppo compare un avviso);
più di 3 serie → piccoli multipli o tabella.
Dare al grafico un titolo e una didascalia che dica il messaggio, non solo cosa mostra.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  name: 'Line',
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('ui-chart')!;
    await waitFor(() => expect(host).not.toHaveAttribute('aria-busy'), { timeout: 5000 });
    const c = within(canvasElement);
    await expect(c.getByRole('img', { name: /Gol segnati/ })).toBeInTheDocument();
    const table = c.getByRole('table', { name: /Gol segnati/ });
    await expect(within(table).getAllByRole('row')).toHaveLength(7);
    await expect(host).toHaveAttribute('data-mode', 'light');
    // esplorazione da tastiera: annuncio dei valori della categoria attiva
    const live = canvasElement.querySelector('[aria-live]')!;
    c.getByRole('img', { name: /Gol segnati/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(live).toHaveTextContent('G1: Leoni 3, Falchi 1, Aquile 0'));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(live).toHaveTextContent(/^G6:/));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(live.textContent?.trim()).toBe(''));
    // cambio tema → colori ricalcolati
    document.documentElement.setAttribute('data-theme', 'dark');
    await waitFor(() => expect(host).toHaveAttribute('data-mode', 'dark'));
    document.documentElement.setAttribute('data-theme', 'light');
    await waitFor(() => expect(host).toHaveAttribute('data-mode', 'light'));
  },
};
export const Bar: Story = { args: { type: 'bar' } };
export const BarreOrizzontali: Story = {
  name: 'Bar orizzontale (etichette lunghe)',
  render: () => ({
    props: { data: MARCATORI },
    template: card(
      'Classifica marcatori',
      'Bianchi capocannoniere con 11 gol.',
      `<ui-chart type="bar" [data]="data" [options]="{ indexAxis: 'y' }" height="14rem" ariaLabel="Gol dei primi cinque marcatori" categoryLabel="Giocatore" />`,
      'max-width:36rem',
    ),
  }),
};
export const Contesto: Story = {
  name: 'Line con serie di contesto',
  render: () => ({
    props: { data: CONFRONTO },
    template: card(
      'Leoni e Falchi contro la media',
      'I Leoni restano sopra la media del girone in quattro giornate su sei.',
      `<ui-chart type="line" [data]="data" ariaLabel="Gol per giornata di Leoni e Falchi rispetto alla media del girone" categoryLabel="Giornata" />`,
      'max-width:36rem',
    ),
  }),
};
export const ParteDelTutto: Story = {
  name: 'Parte del tutto (barra impilata)',
  render: () => ({
    props: { data: ESITI, options: { indexAxis: 'y', scales: { x: { stacked: true }, y: { stacked: true, display: false } } } },
    template: card(
      'Esiti delle partite',
      'La metà delle partite finisce con la vittoria in casa.',
      `<ui-chart type="bar" [data]="data" [options]="options" height="6rem" ariaLabel="Esiti delle 36 partite: vittorie in casa, pareggi, vittorie ospiti" categoryLabel="Totale" />`,
      'max-width:36rem',
    ),
  }),
};
export const ReducedMotion: Story = { name: 'Reduced motion', globals: { motion: 'reduce' } };

const ALL = () => ({
  props: { gol: GOL, punti: PUNTI },
  template: `<div style="display:grid;gap:.75rem;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr))">
    ${card(COPY['line'][0], COPY['line'][1], `<ui-chart type="line" [data]="gol" ariaLabel="Gol per giornata" categoryLabel="Giornata" />`)}
    ${card(COPY['bar'][0], COPY['bar'][1], `<ui-chart type="bar" [data]="punti" ariaLabel="Punti per squadra" categoryLabel="Squadra" />`)}
  </div>`,
});
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
