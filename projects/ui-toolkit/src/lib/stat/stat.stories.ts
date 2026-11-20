import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { SbIcon } from '../../../stories/support/icon';
import { themeStories } from '../../../stories/support/themes';
import { Stat } from './stat';

const meta: Meta<Stat> = {
  title: 'Components/Stat',
  component: Stat,
  decorators: [moduleMetadata({ imports: [Stat, SbIcon] })],
  args: { label: 'Gol segnati', value: 128, hint: '+12 rispetto alla scorsa giornata', tone: 'neutral' },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'brand', 'success', 'danger'] } },
  render: (args) => ({ props: args, template: `<ui-stat ${argsToTemplate(args)} style="max-width:16rem"><sb-icon uiStatIcon name="goal" [size]="16" /></ui-stat>` }),
  parameters: {
    docs: {
      description: {
        component: `Tile glass, padding 1rem, struttura \`<dl>\`. Label 0.75rem/700 UPPERCASE muted con icona in tile 2rem radius 0.75rem;
valore font-numeric (Barlow Condensed, tabular-nums) 2.25rem/700; hint text-sm muted. \`tone\` colora tile icona e valore (sempre *-text, ≥ 4.5:1).

**Accessibilità** — \`dt\`/\`dd\` associano etichetta e valore per gli screen reader; l'icona è decorativa.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Stat>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('term')).toHaveTextContent('Gol segnati');
    await expect(c.getAllByRole('definition')[0]).toHaveTextContent('128');
  },
};
export const Brand: Story = { args: { tone: 'brand', label: 'Squadre', value: 24, hint: '4 gironi' } };
export const Success: Story = { args: { tone: 'success', label: 'Partite giocate', value: '36/48', hint: '75% del torneo' } };
export const Danger: Story = { args: { tone: 'danger', label: 'Cartellini rossi', value: 3, hint: undefined } };

const ALL = () => ({
  template: `<div style="display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(12rem,1fr))">
    <ui-stat label="Squadre" [value]="24" hint="4 gironi"><sb-icon uiStatIcon name="users" [size]="16" /></ui-stat>
    <ui-stat label="Gol" [value]="128" tone="brand" hint="3,6 a partita"><sb-icon uiStatIcon name="goal" [size]="16" /></ui-stat>
    <ui-stat label="Giocate" value="36/48" tone="success"><sb-icon uiStatIcon name="check" [size]="16" /></ui-stat>
    <ui-stat label="Rossi" [value]="3" tone="danger"><sb-icon uiStatIcon name="alert" [size]="16" /></ui-stat>
  </div>`,
});
const themes = themeStories<Stat>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
