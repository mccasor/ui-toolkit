import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SbIcon } from '../../../stories/support/icon';
import { themeStories } from '../../../stories/support/themes';
import { TabBar, TabBarItem } from './tab-bar';

const ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'partite', label: 'Partite', icon: 'calendar' },
  { id: 'classifica', label: 'Classifica', icon: 'trophy' },
  { id: 'squadre', label: 'Squadre', icon: 'users' },
];

const TEMPLATE = `
  <ui-tab-bar [fixed]="false">
    @for (i of items; track i.id) {
      <a uiTabBarItem [href]="'#' + i.id" [active]="current() === i.id" (click)="$event.preventDefault(); current.set(i.id)">
        <sb-icon uiTabIcon [name]="i.icon" [weight]="current() === i.id ? 'fill' : 'bold'" />{{ i.label }}
      </a>
    }
  </ui-tab-bar>`;

const meta: Meta<TabBar> = {
  title: 'Components/TabBar',
  component: TabBar,
  subcomponents: { TabBarItem },
  decorators: [moduleMetadata({ imports: [TabBar, TabBarItem, SbIcon] })],
  render: () => ({ props: { items: ITEMS, current: signal('home') }, template: `<div style="padding-top:4rem">${TEMPLATE}</div>` }),
  parameters: {
    docs: {
      description: {
        component: `Flottante in basso (0.75rem + safe-area), max 30rem, radius 1.5rem, glass strong + shadow-glass + shadow-float. Voci: colonna icona + label
0.6875rem/700 (0.75rem da 640px), min-height 3.5rem; icona in una pill 3rem × 1.875rem che da attiva prende nav-active bg/fg; press scale(0.92).
Ferma nelle view transition. Nelle storie \`[fixed]="false"\` la mette in flusso.

**Accessibilità** — \`<nav>\` etichettato; la voce corrente ha \`aria-current="page"\` (da \`active\` o da \`routerLinkActive\` con
\`ariaCurrentWhenActive="page"\`); icone decorative, label sempre visibile; target ≥ 44px.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<TabBar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const nav = c.getByRole('navigation', { name: 'Navigazione principale' });
    await expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(within(nav).getByRole('link', { name: 'Classifica' }));
    await expect(within(nav).getByRole('link', { name: 'Classifica' })).toHaveAttribute('aria-current', 'page');
    await expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  },
};
export const Fixed: Story = {
  name: 'Fissa in basso (mobile)',
  render: () => ({
    props: { items: ITEMS, current: signal('partite') },
    template: `<div style="height:40rem;transform:translateZ(0);margin:-1.5rem -1rem;padding:1rem" class="ui-container--tabbar">
      <p class="ui-body text-muted">La tab bar resta fissa in basso; la pagina riserva tab-bar-height + 2.5rem + safe-area.</p>
      ${TEMPLATE.replace('[fixed]="false"', '')}
    </div>`,
  }),
  globals: { viewport: { value: 'mobile', isRotated: false } },
};
export const Pressed: Story = { name: 'Stato: active (press)', parameters: { pseudo: { active: ['a:nth-child(2)'] } } };
export const FocusVisible: Story = { name: 'Stato: focus-visible', parameters: { pseudo: { focusVisible: ['a:nth-child(3)'] } } };

const themes = themeStories<TabBar>(meta.render);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
