import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Badge } from '../badge/badge';
import { GlassCard } from './glass-card';

type Args = GlassCard & { content: string };

const meta: Meta<Args> = {
  title: 'Components/GlassCard',
  component: GlassCard,
  decorators: [moduleMetadata({ imports: [GlassCard, Badge] })],
  args: { variant: 'default', padding: 'md', interactive: false, content: 'Girone A, 4 squadre, prossima partita sabato alle 15:00' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'strong', 'brand'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    content: { control: 'text' },
  },
  render: ({ content, ...args }) => ({
    props: args,
    template: `<ui-glass-card ${argsToTemplate(args)} style="max-width:24rem">
      <h3 class="ui-card-title" style="margin:0 0 .25rem">Girone A</h3>
      <p class="ui-body-sm text-muted" style="margin:0">${content}</p>
    </ui-glass-card>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Card su superficie piena (nome storico \`GlassCard\`): surface, bordo glass-edge, shadow-glass corta, radius 1.25rem, overflow hidden.
L'elevazione è data dalla luminosità e dall'ombra, non da blur o gradienti. Variante \`brand\`: fondo arancio all'8% piatto + bordo arancio 55%.
Con high contrast il bordo diventa border-strong. Nel backoffice è piatta (niente ombra, radius 0.5rem).

**Accessibilità** — per una card cliccabile usa \`<a uiGlassCard interactive>\` o \`<button uiGlassCard>\`: un solo elemento focusabile, con focus visibile. Il lift è puramente visivo (statico con reduced motion).`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const Strong: Story = { args: { variant: 'strong' } };
export const Brand: Story = { args: { variant: 'brand' } };
export const PaddingNone: Story = { name: 'Padding: none', args: { padding: 'none' } };
export const PaddingSmall: Story = { name: 'Padding: sm', args: { padding: 'sm' } };
export const PaddingLarge: Story = { name: 'Padding: lg', args: { padding: 'lg' } };

export const Interactive: Story = {
  name: 'Interattiva (link)',
  render: () => ({
    template: `<a uiGlassCard interactive href="#partita" style="max-width:24rem">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
        <strong class="ui-card-title">Leoni – Falchi</strong><ui-badge tone="live">Live</ui-badge>
      </div>
      <p class="ui-body-sm text-muted" style="margin:.25rem 0 0">Campo 2, 2° tempo</p>
    </a>`,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveClass('ui-glass-card--interactive');
  },
};
export const InteractiveHover: Story = { ...Interactive, name: 'Stato: hover', parameters: { pseudo: { hover: true } }, play: undefined };
export const InteractiveFocus: Story = { ...Interactive, name: 'Stato: focus-visible', parameters: { pseudo: { focusVisible: true } }, play: undefined };

const ALL = () => ({
  template: `<div style="display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr))">
    <ui-glass-card><strong class="ui-card-title">Default</strong><p class="ui-body-sm text-muted" style="margin:.25rem 0 0">surface 72%</p></ui-glass-card>
    <ui-glass-card variant="strong"><strong class="ui-card-title">Strong</strong><p class="ui-body-sm text-muted" style="margin:.25rem 0 0">surface 86%</p></ui-glass-card>
    <ui-glass-card variant="brand"><strong class="ui-card-title">Brand</strong><p class="ui-body-sm text-muted" style="margin:.25rem 0 0">fondo tinto + bordo arancio</p></ui-glass-card>
    <a uiGlassCard interactive href="#x"><strong class="ui-card-title">Interattiva</strong><p class="ui-body-sm text-muted" style="margin:.25rem 0 0">lift + float</p></a>
  </div>`,
});
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
