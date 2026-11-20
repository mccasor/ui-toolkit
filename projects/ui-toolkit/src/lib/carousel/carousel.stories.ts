import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Badge } from '../badge/badge';
import { GlassCard } from '../glass-card/glass-card';
import { Carousel } from './carousel';

const PARTITE = [
  { casa: 'Leoni', ospiti: 'Falchi', ora: '15:00', campo: 'Campo 1', live: true },
  { casa: 'Aquile', ospiti: 'San Marco', ora: '15:45', campo: 'Campo 2', live: false },
  { casa: 'Perché No', ospiti: 'Città Alta', ora: '16:30', campo: 'Campo 1', live: false },
  { casa: 'Olimpia', ospiti: 'Stella Rossa', ora: '17:15', campo: 'Campo 3', live: false },
  { casa: 'Velox', ospiti: 'Atlético Borgo', ora: '18:00', campo: 'Campo 2', live: false },
];

type Args = { slideWidth: string; arrows: boolean; dots: boolean };

const SLIDES = `
  @for (p of partite; track $index) {
    <ui-glass-card>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
        <span class="ui-eyebrow">{{ p.campo }} · {{ p.ora }}</span>
        @if (p.live) { <ui-badge tone="live">Live</ui-badge> }
      </div>
      <p class="ui-card-title" style="margin:.5rem 0 0">{{ p.casa }} – {{ p.ospiti }}</p>
    </ui-glass-card>
  }`;

const meta: Meta<Args> = {
  title: 'Components/Carousel',
  component: Carousel,
  decorators: [moduleMetadata({ imports: [Carousel, GlassCard, Badge] })],
  args: { slideWidth: 'min(85%, 24rem)', arrows: true, dots: true },
  render: (args) => ({
    props: { ...args, partite: PARTITE },
    template: `<ui-carousel label="Prossime partite" [slideWidth]="slideWidth" [arrows]="arrows" [dots]="dots">${SLIDES}</ui-carousel>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Scroll-snap orizzontale nativo (swipe e trackpad), \`slideWidth\` (85% default; consigliato \`min(85%, 24rem)\` su mobile e
\`min(42.5%, 12rem)\` su desktop), gap 0.75rem, frecce e pallini opzionali, tastiera sulla traccia.

**Accessibilità** — \`role="region"\` + \`aria-roledescription="carousel"\` con \`label\`; ogni slide \`role="group"\`,
\`aria-roledescription="slide"\`, etichetta "n di m" (o \`data-label\`). La traccia è focusabile: ←/→, Home/End. Frecce e pallini sono bottoni
etichettati (\`aria-current\` sul pallino attivo). Scorrimento istantaneo con reduced motion.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Prossime partite' })).toHaveAttribute('aria-roledescription', 'carousel');
    const slides = c.getAllByRole('group', { name: /di 5$/ });
    await expect(slides).toHaveLength(5);
    const dots = c.getAllByRole('button', { name: /Vai alla slide/ });
    await expect(dots[0]).toHaveAttribute('aria-current', 'true');
    await expect(c.getByRole('button', { name: 'Slide precedente' })).toBeDisabled();
    // tastiera sulla traccia
    const track = canvasElement.querySelector<HTMLElement>('.track')!;
    track.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(dots[1]).toHaveAttribute('aria-current', 'true'));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(dots[4]).toHaveAttribute('aria-current', 'true'));
    await userEvent.click(c.getByRole('button', { name: 'Slide precedente' }));
    await waitFor(() => expect(dots[3]).toHaveAttribute('aria-current', 'true'));
    await userEvent.click(dots[0]);
    await waitFor(() => expect(track.scrollLeft).toBe(0));
  },
};
export const Plain: Story = { name: 'Senza controlli', args: { arrows: false, dots: false } };
export const Desktop: Story = { name: 'Card desktop min(42.5%, 12rem)', args: { slideWidth: 'min(42.5%, 12rem)', dots: false } };
export const Mobile: Story = { args: { slideWidth: '85%' }, globals: { viewport: { value: 'mobile', isRotated: false } } };
export const FocusTrack: Story = { name: 'Stato: focus traccia', parameters: { pseudo: { focusVisible: ['.track'] } } };

const ALL = () => ({ props: { partite: PARTITE }, template: `<ui-carousel label="Prossime partite" slideWidth="min(85%, 24rem)" arrows dots>${SLIDES}</ui-carousel>` });
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
