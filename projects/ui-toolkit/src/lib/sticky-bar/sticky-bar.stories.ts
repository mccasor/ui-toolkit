import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { GlassCard } from '../glass-card/glass-card';
import { Header } from '../header/header';
import { Segmented } from '../segmented/segmented';
import { StickyBar } from './sticky-bar';

const OPTS = [
  { value: 'tutte', label: 'Tutte' },
  { value: 'live', label: 'Live' },
  { value: 'finite', label: 'Finite' },
];

const meta: Meta<StickyBar> = {
  title: 'Components/StickyBar',
  component: StickyBar,
  decorators: [moduleMetadata({ imports: [StickyBar, Segmented, GlassCard, Header] })],
  args: { surface: false },
  render: (args) => ({
    props: { ...args, opts: OPTS, v: signal('tutte'), cards: Array.from({ length: 12 }, (_, i) => i + 1) },
    template: `<div style="margin:-1.5rem -1rem 0">
      <ui-header title="Torneo C85" tagline="Partite" />
      <div class="ui-container" style="display:grid;gap:.75rem">
        <ui-sticky-bar [surface]="surface"><ui-segmented [options]="opts" [(value)]="v" ariaLabel="Filtro partite" /></ui-sticky-bar>
        @for (c of cards; track c) { <ui-glass-card><strong class="ui-card-title">Partita {{ c }}</strong></ui-glass-card> }
      </div>
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Barra di pagina sticky che si ferma sotto l'header (\`top: sticky-top + 0.5rem\`, z-index 900, sotto header e tab bar).
\`surface\` aggiunge un fondo glass strong a pill con shadow-float.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<StickyBar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector('ui-sticky-bar')!;
    await expect(getComputedStyle(bar).position).toBe('sticky');
    await expect(getComputedStyle(bar).zIndex).toBe('900');
  },
};
export const Surface: Story = { args: { surface: true } };
const themes = themeStories<StickyBar>(meta.render, { args: { surface: true } });
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
