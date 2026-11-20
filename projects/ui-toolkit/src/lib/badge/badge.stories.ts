import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { SbIcon } from '../../../stories/support/icon';
import { themeStories } from '../../../stories/support/themes';
import { Badge, RoleChip } from './badge';

type Args = Badge & { label: string };

const meta: Meta<Args> = {
  title: 'Components/Badge',
  component: Badge,
  subcomponents: { RoleChip },
  decorators: [moduleMetadata({ imports: [Badge, RoleChip, SbIcon] })],
  args: { tone: 'neutral', label: 'Girone A' },
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'live'] } },
  render: ({ label, ...args }) => ({ props: args, template: `<ui-badge ${argsToTemplate(args)}>${label}</ui-badge>` }),
  parameters: {
    docs: {
      description: {
        component: `Pill 0.25rem 0.625rem, 0.75rem/700, tracking 0.02em. Toni: neutral (surface-sunken + border), brand (fill primary, testo ink),
success / warning / danger (soft + *-text, ≥ 4.5:1), live (fill danger, testo bianco, UPPERCASE 0.08em, pallino pulsante).

**Role chip** — cerchio 1.25rem con una lettera visibile, nome completo \`sr-only\` e tooltip \`title\`.

**Accessibilità** — l'informazione è nel testo, mai solo nel colore; il pallino live è \`aria-hidden\` e statico con reduced motion.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const Neutral: Story = { args: { tone: 'neutral', label: '12 squadre' } };
export const Brand: Story = { args: { tone: 'brand', label: 'In corso' } };
export const Success: Story = { args: { tone: 'success', label: 'Confermata' } };
export const Warning: Story = { args: { tone: 'warning', label: 'In attesa' } };
export const Danger: Story = { args: { tone: 'danger', label: 'Annullata' } };
export const Live: Story = { args: { tone: 'live', label: 'Live' } };
export const WithIcon: Story = {
  name: 'Con icona',
  render: () => ({ template: `<ui-badge tone="success"><sb-icon name="check" [size]="16" /> Pagato</ui-badge>` }),
};

export const RoleChips: Story = {
  name: 'Role chip',
  render: () => ({
    template: `<div style="display:flex;gap:.5rem;align-items:center">
      <ui-role-chip label="Capitano" tone="primary" />
      <ui-role-chip label="Ammonito" tone="warning" />
      <ui-role-chip label="Espulso" tone="danger" />
      <ui-role-chip label="Portiere" tone="success" />
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Capitano')).toHaveClass('sr-only');
    await expect(c.getByTitle('Espulso')).toBeInTheDocument();
  },
};

const ALL = () => ({
  template: `<div style="display:grid;gap:.75rem">
    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
      <ui-badge>Neutral</ui-badge><ui-badge tone="brand">Brand</ui-badge><ui-badge tone="success">Success</ui-badge>
      <ui-badge tone="warning">Warning</ui-badge><ui-badge tone="danger">Danger</ui-badge><ui-badge tone="live">Live</ui-badge>
    </div>
    <div class="glass" style="display:flex;gap:.5rem;flex-wrap:wrap;padding:1rem;border-radius:var(--ui-radius-card)">
      <ui-badge>Neutral</ui-badge><ui-badge tone="brand">Brand</ui-badge><ui-badge tone="success">Success</ui-badge>
      <ui-badge tone="warning">Warning</ui-badge><ui-badge tone="danger">Danger</ui-badge><ui-badge tone="live">Live</ui-badge>
      <ui-role-chip label="Capitano" /><ui-role-chip label="Ammonito" tone="warning" /><ui-role-chip label="Espulso" tone="danger" /><ui-role-chip label="Portiere" tone="success" />
    </div>
  </div>`,
});
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
