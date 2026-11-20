import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { GlassCard } from '../glass-card/glass-card';
import { Spinner } from '../spinner/spinner';
import { Skeleton } from './skeleton';

const meta: Meta<Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  subcomponents: { Spinner },
  decorators: [moduleMetadata({ imports: [Skeleton, Spinner, GlassCard] })],
  args: { variant: 'text', lines: 3 },
  argTypes: { variant: { control: 'inline-radio', options: ['text', 'rect', 'circle'] }, width: { control: 'text' }, height: { control: 'text' } },
  render: (args) => ({ props: args, template: `<section aria-busy="true" aria-label="Caricamento" style="max-width:24rem"><ui-skeleton ${argsToTemplate(args)} /></section>` }),
  parameters: {
    docs: {
      description: {
        component: `Segnaposto con shimmer 1.4s ease-in-out (gradiente 200%), statico con reduced motion. Varianti text (ultima riga al 60%), rect, circle.

**Spinner** — 1em, bordo 2px currentColor con lato destro trasparente, 700ms lineare. Con \`label\` diventa \`role="status"\`.

**Accessibilità** — lo skeleton è sempre \`aria-hidden\`; la regione che carica porta \`aria-busy="true"\`.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Skeleton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('ui-skeleton')!;
    await expect(host).toHaveAttribute('aria-hidden', 'true');
    const lines = host.querySelectorAll<HTMLElement>('.line');
    await expect(lines.length).toBe(3);
    await expect(lines[2].style.width).toBe('60%');
  },
};
export const Text: Story = { args: { variant: 'text', lines: 1, width: '12rem' } };
export const Rect: Story = { args: { variant: 'rect', height: '8rem' } };
export const Circle: Story = { args: { variant: 'circle', width: '3.5rem' } };
export const SpinnerStory: Story = {
  name: 'Spinner',
  render: () => ({ template: `<div style="display:flex;gap:1rem;align-items:center;font-size:1.5rem"><ui-spinner label="Caricamento classifica" /><span class="text-accent"><ui-spinner /></span></div>` }),
};

const CARD = () => ({
  template: `<section aria-busy="true" aria-label="Caricamento partite" style="display:grid;gap:.75rem;max-width:24rem">
    @for (i of [1,2]; track i) {
      <ui-glass-card>
        <div style="display:flex;gap:.75rem;align-items:center">
          <ui-skeleton variant="circle" />
          <div style="flex:1"><ui-skeleton [lines]="2" /></div>
        </div>
      </ui-glass-card>
    }
  </section>`,
});
export const CardLoading: Story = { name: 'Card in caricamento', render: CARD };
const themes = themeStories<Skeleton>(CARD);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
