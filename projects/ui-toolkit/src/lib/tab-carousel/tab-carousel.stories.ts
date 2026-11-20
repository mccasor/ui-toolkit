import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { GlassCard } from '../glass-card/glass-card';
import { TabCarousel, TabPanel } from './tab-carousel';

const BODY = `
  <ui-tab-panel value="partite" label="Partite">
    <ui-glass-card><p class="ui-card-title" style="margin:0">Leoni – Falchi</p><p class="ui-body-sm text-muted" style="margin:.25rem 0 0">Campo 1 · 15:00</p></ui-glass-card>
  </ui-tab-panel>
  <ui-tab-panel value="classifica" label="Classifica">
    <ui-glass-card>
      <ol class="ui-body-sm" style="margin:0;padding-left:1.25rem;display:grid;gap:.5rem">
        <li>Leoni di Quartiere · 12 pt</li><li>Falchi · 9 pt</li><li>Aquile Città · 7 pt</li><li>San Marco · 4 pt</li><li>Olimpia · 3 pt</li>
      </ol>
    </ui-glass-card>
  </ui-tab-panel>
  <ui-tab-panel value="squadre" label="Squadre">
    <ui-glass-card><p class="ui-body-sm" style="margin:0">8 squadre in 2 gironi.</p></ui-glass-card>
  </ui-tab-panel>`;

type Args = { block: boolean };

const meta: Meta<Args> = {
  title: 'Components/TabCarousel',
  component: TabCarousel,
  subcomponents: { TabPanel },
  decorators: [moduleMetadata({ imports: [TabCarousel, TabPanel, GlassCard] })],
  args: { block: false },
  render: (args) => ({ props: args, template: `<div style="max-width:28rem"><ui-tab-carousel label="Torneo" [block]="block">${BODY}</ui-tab-carousel></div>` }),
  parameters: {
    docs: {
      description: {
        component: `Segmented sopra un Carousel di pannelli a tutta larghezza; l'altezza si adatta al pannello attivo (200ms). Scegliere un tab scorre al
pannello, lo swipe sul pannello aggiorna il tab.

**Accessibilità** — tablist (Segmented) con \`aria-controls\` verso i \`ui-tab-panel\` (\`role="tabpanel"\`, \`aria-labelledby\` del tab).
I pannelli non attivi sono \`inert\` (fuori dalla sequenza Tab e dall'albero di accessibilità); il pannello attivo è focusabile.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const tabs = c.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);
    const panel = c.getByRole('tabpanel', { name: 'Partite' });
    await expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
    await userEvent.click(tabs[1]);
    await waitFor(() => expect(c.getByRole('tabpanel', { name: 'Classifica' })).not.toHaveAttribute('inert'));
    await expect(panel).toHaveAttribute('inert');
    // tastiera: → sposta tab e pannello
    tabs[1].focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(c.getByRole('tabpanel', { name: 'Squadre' })).not.toHaveAttribute('inert'));
  },
};
export const Block: Story = { args: { block: true } };
export const Mobile: Story = { args: { block: true }, globals: { viewport: { value: 'mobile', isRotated: false } } };

const ALL = () => ({ template: `<div style="max-width:28rem"><ui-tab-carousel label="Torneo">${BODY}</ui-tab-carousel></div>` });
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
