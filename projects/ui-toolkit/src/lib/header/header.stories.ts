import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SbIcon, iconSvg } from '../../../stories/support/icon';
import { themeStories } from '../../../stories/support/themes';
import { Button } from '../button/button';
import { Header } from './header';

const LOGO = `${iconSvg('trophy', 'fill', 'uiHeaderLogo')}`;

const meta: Meta<Header> = {
  title: 'Components/Header',
  component: Header,
  decorators: [moduleMetadata({ imports: [Header, Button, SbIcon] })],
  args: { title: 'Torneo C85', tagline: 'Calcio a 5 · Bergamo', homeHref: '#home', skipTo: '#main' },
  render: (args) => ({
    props: args,
    template: `<div style="margin:-1.5rem -1rem 0">
      <ui-header [title]="title" [tagline]="tagline" [homeHref]="homeHref" [skipTo]="skipTo">
        ${LOGO}
        <div uiHeaderActions><button uiButton variant="ghost" iconOnly aria-label="Cerca"><sb-icon name="search" /></button></div>
      </ui-header>
      <main id="main" style="padding:1.5rem 1rem" class="ui-body text-muted">Contenuto della pagina…</main>
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Sticky, glass a tutta larghezza senza radius, solo bordo inferiore, ombra 0 8px 24px -18px. Altezza 3.75rem (+ safe-area):
logo (tile 2.5rem radius 0.875rem con gradiente #2c2c30 → #0f0f10) + titolo display 1.375rem UPPERCASE tracking 0.025em + tagline 0.6875rem/700
UPPERCASE tracking 0.18em muted. Resta fermo nelle view transition (\`view-transition-name: ui-header\`).

**Accessibilità** — landmark \`<header>\` (banner); logo decorativo; con \`skipTo\` lo skip link "Vai al contenuto" è il primo elemento focusabile
e compare al focus.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Header>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('banner')).toBeInTheDocument();
    await userEvent.tab();
    await expect(c.getByRole('link', { name: 'Vai al contenuto' })).toHaveFocus();
  },
};
export const SkipLinkVisible: Story = { name: 'Skip link al focus', parameters: { pseudo: { focusVisible: ['.ui-skip-link'] } } };
export const NoTagline: Story = { name: 'Senza tagline', args: { tagline: undefined } };
export const Mobile: Story = { args: { title: 'Torneo dei Quartieri di Città Alta' }, globals: { viewport: { value: 'mobile', isRotated: false } } };

const themes = themeStories<Header>(meta.render);
export const Light: Story = { ...themes.Light, args: meta.args };
export const Dark: Story = { ...themes.Dark, args: meta.args };
export const Backoffice: Story = { ...themes.Backoffice, args: meta.args };
export const BackofficeDark: Story = { ...themes.BackofficeDark, args: meta.args };
