import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Carousel, Segmented, Stat, StickyBar } from 'ui-toolkit';
import { SbIcon } from '../support/icon';
import { PARTITE } from './data';
import { MatchCard, PatternShell } from './shell';

@Component({
  selector: 'pt-home',
  imports: [PatternShell, MatchCard, Carousel, Stat, SbIcon, StickyBar, Segmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pt-shell active="home">
      <p class="ui-meta" style="margin:0">Sabato 21 novembre</p>
      <h1 class="ui-display-hero" style="margin:.25rem 0 1.5rem">Torneo C85</h1>

      <section aria-labelledby="h-stat" class="section">
        <h2 id="h-stat" class="ui-section-title">In numeri</h2>
        <div class="stats">
          <ui-stat label="Squadre" [value]="24" hint="4 gironi"><sb-icon uiStatIcon name="users" [size]="16" /></ui-stat>
          <ui-stat label="Gol" [value]="128" tone="brand" hint="3,6 a partita"><sb-icon uiStatIcon name="goal" [size]="16" /></ui-stat>
        </div>
      </section>

      <section aria-labelledby="h-live" class="section">
        <h2 id="h-live" class="ui-section-title">In evidenza</h2>
        <ui-carousel label="Partite in evidenza" slideWidth="var(--pt-slide)" dots>
          @for (m of partite.slice(0, 4); track m.id) { <pt-match-card [m]="m" /> }
        </ui-carousel>
      </section>

      <section aria-labelledby="h-list" class="section">
        <h2 id="h-list" class="ui-section-title">Partite di oggi</h2>
        <ui-sticky-bar surface style="justify-self:start">
          <ui-segmented [options]="filters" [(value)]="filter" ariaLabel="Filtra partite" />
        </ui-sticky-bar>
        <div class="list">
          @for (m of visibili(); track m.id) { <pt-match-card [m]="m" /> }
        </div>
      </section>
    </pt-shell>
  `,
  styles: `
    :host { --pt-slide: min(85%, 24rem); }
    @media (min-width: 1024px) { :host { --pt-slide: min(42.5%, 24rem); } }
    .section { display: grid; gap: 0.75rem; margin-bottom: 2rem; }
    .section > h2 { margin: 0; }
    .stats { display: grid; gap: 0.75rem; grid-template-columns: repeat(2, 1fr); }
    .list { display: grid; gap: 0.75rem; }
    @media (min-width: 1024px) { .list { grid-template-columns: repeat(2, 1fr); } }
  `,
})
class HomePage {
  protected readonly partite = PARTITE;
  protected readonly filters = [
    { value: 'tutte', label: 'Tutte' },
    { value: 'live', label: 'Live' },
    { value: 'finita', label: 'Finite' },
  ];
  protected readonly filter = signal('tutte');
  protected readonly visibili = computed(() => (this.filter() === 'tutte' ? PARTITE : PARTITE.filter((p) => p.stato === this.filter())));
}

const meta: Meta = {
  title: 'Patterns/Header e tab bar',
  decorators: [moduleMetadata({ imports: [HomePage] })],
  render: () => ({ template: `<pt-home />` }),
  parameters: {
    fullBleed: true,
    docs: {
      description: {
        component: `Shell dell'app pubblica: header sticky con skip link, contenuto in \`.ui-container--tabbar\` (riserva tab-bar-height + 2.5rem + safe-area),
footer e tab bar flottante. Pagina con stat, carousel di card (\`min(85%, 24rem)\` mobile, \`min(42.5%, 24rem)\` desktop), segmented sticky sotto
l'header e lista di card partita (2 colonne da 1024px).`,
      },
    },
  },
  tags: ['!autodocs'],
};
export default meta;
type Story = StoryObj;

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('link', { name: 'Vai al contenuto' })).toHaveFocus();
    await userEvent.click(c.getByRole('tab', { name: 'Live' }));
    const list = canvasElement.querySelector('.list')!;
    await expect(list.querySelectorAll('pt-match-card')).toHaveLength(1);
    await expect(c.getByRole('navigation', { name: 'Navigazione principale' })).toBeInTheDocument();
  },
};
export const MobileDark: Story = { name: 'Mobile dark', globals: { viewport: { value: 'mobile', isRotated: false }, theme: 'dark' } };
export const Desktop: Story = { globals: { viewport: { value: 'desktop', isRotated: false } } };
