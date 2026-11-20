import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, waitFor, within } from 'storybook/test';
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
const ESITI: ChartData = { labels: ['Vittorie casa', 'Pareggi', 'Vittorie ospiti'], datasets: [{ label: 'Partite', data: [18, 6, 12] }] };

type Args = { type: Chart['type'] extends () => infer T ? T : never; height: string };

const meta: Meta<Args> = {
  title: 'Components/Chart',
  component: Chart,
  decorators: [moduleMetadata({ imports: [Chart, GlassCard] })],
  args: { type: 'line', height: '12rem' },
  argTypes: { type: { control: 'inline-radio', options: ['line', 'bar', 'doughnut', 'radar'] } },
  render: (args) => ({
    props: { ...args, data: args.type === 'doughnut' ? ESITI : args.type === 'bar' ? PUNTI : GOL },
    template: `<ui-glass-card style="max-width:36rem"><ui-chart [type]="type" [data]="data" [height]="height" ariaLabel="Gol segnati per giornata dalle prime tre squadre" categoryLabel="Giornata" /></ui-glass-card>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Wrapper Chart.js 4 caricato on demand: \`type\`, \`data\`, \`options\`, \`ariaLabel\`, \`height\` (12rem). Chart.js è una peer dependency
opzionale. Colori di assi (text-muted), griglia (border) e serie letti dai token e aggiornati al cambio tema: le serie usano \`chartSeries(mode)\`,
palette agganciata alla banda OKLCH del modo (L 0.43–0.77 light, 0.48–0.67 dark, contrasto ≥ 3:1, ΔE ≥ 15 e ≥ 8 in protanopia/deuteranopia).

**Accessibilità** — canvas \`role="img"\` con \`aria-label\`; i dati sono anche in una tabella \`sr-only\` con caption e intestazioni;
\`aria-busy\` finché la libreria non è caricata; animazioni off con reduced motion.`,
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
    // cambio tema → colori ricalcolati
    document.documentElement.setAttribute('data-theme', 'dark');
    await waitFor(() => expect(host).toHaveAttribute('data-mode', 'dark'));
    document.documentElement.setAttribute('data-theme', 'light');
    await waitFor(() => expect(host).toHaveAttribute('data-mode', 'light'));
  },
};
export const Bar: Story = { args: { type: 'bar' } };
export const Doughnut: Story = { args: { type: 'doughnut', height: '14rem' } };
export const ReducedMotion: Story = { name: 'Reduced motion', globals: { motion: 'reduce' } };

const ALL = () => ({
  props: { gol: GOL, punti: PUNTI },
  template: `<div style="display:grid;gap:.75rem;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr))">
    <ui-glass-card><ui-chart type="line" [data]="gol" ariaLabel="Gol per giornata" categoryLabel="Giornata" /></ui-glass-card>
    <ui-glass-card><ui-chart type="bar" [data]="punti" ariaLabel="Punti per squadra" categoryLabel="Squadra" /></ui-glass-card>
  </div>`,
});
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
