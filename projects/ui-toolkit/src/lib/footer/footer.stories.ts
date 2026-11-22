import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Footer } from './footer';

const LINKS = [
  { label: 'Regolamento', href: '#regolamento' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Contatti', href: '#contatti' },
];

const meta: Meta<Footer> = {
  title: 'Components/Footer',
  component: Footer,
  decorators: [moduleMetadata({ imports: [Footer] })],
  render: () => ({ props: { links: LINKS }, template: `<div style="margin:0 -1rem"><ui-footer [links]="links">© 2026 Torneo C85</ui-footer></div>` }),
  parameters: {
    docs: {
      description: {
        component: `Bordo superiore border, link 0.875rem/600 muted con target 44px, hover text + sottolineatura offset 4px; i link sono
separati dallo spazio, senza separatore a puntino. Slot per note/copyright.

**Accessibilità** — \`<footer>\` (contentinfo) con \`<nav>\` etichettata ed elenco di link.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Footer>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('contentinfo')).toBeInTheDocument();
    const nav = c.getByRole('navigation', { name: 'Link a piè di pagina' });
    await expect(within(nav).getAllByRole('link')).toHaveLength(3);
    await expect(within(nav).getByRole('link', { name: 'Privacy' }).offsetHeight).toBeGreaterThanOrEqual(44);
  },
};
export const Hover: Story = { name: 'Stato: hover', parameters: { pseudo: { hover: ['li:nth-child(2) a'] } } };
const themes = themeStories<Footer>(meta.render);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
