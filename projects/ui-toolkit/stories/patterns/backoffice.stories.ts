import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { Avatar, Badge, Button, Chart, Field, FieldInput, GlassCard, Select, Stat, Table, TableCell, TeamLogo, type ChartData, type TableColumn } from 'ui-toolkit';
import { SbIcon } from '../support/icon';
import { GIRONI } from './data';

interface Iscrizione {
  id: string;
  squadra: string;
  colore: string;
  responsabile: string;
  girone: string;
  giocatori: number;
  quota: string;
  stato: 'pagata' | 'in attesa' | 'scaduta';
}

const ISCRIZIONI: Iscrizione[] = [
  { id: 'i1', squadra: 'Leoni di Quartiere', colore: '#1565C0', responsabile: 'Mario Rossi', girone: 'A', giocatori: 9, quota: '€ 180', stato: 'pagata' },
  { id: 'i2', squadra: 'Falchi', colore: '#FFB936', responsabile: 'Giulia Bianchi', girone: 'A', giocatori: 8, quota: '€ 180', stato: 'pagata' },
  { id: 'i3', squadra: 'Aquile Città', colore: '#2E7D32', responsabile: 'Luca Verdi', girone: 'A', giocatori: 10, quota: '€ 180', stato: 'in attesa' },
  { id: 'i4', squadra: 'San Marco', colore: '#6A1B9A', responsabile: 'Sara Neri', girone: 'A', giocatori: 7, quota: '€ 180', stato: 'scaduta' },
  { id: 'i5', squadra: 'Perché No', colore: '#00796B', responsabile: 'Paolo Gialli', girone: 'B', giocatori: 9, quota: '€ 180', stato: 'pagata' },
  { id: 'i6', squadra: 'Città Alta', colore: '#AD1457', responsabile: 'Anna Blu', girone: 'B', giocatori: 11, quota: '€ 180', stato: 'pagata' },
  { id: 'i7', squadra: 'Olimpia', colore: '#C62828', responsabile: 'Marco Viola', girone: 'B', giocatori: 8, quota: '€ 180', stato: 'in attesa' },
  { id: 'i8', squadra: 'Stella Rossa', colore: '#455A64', responsabile: 'Elena Grigi', girone: 'B', giocatori: 9, quota: '€ 180', stato: 'pagata' },
];

const COLS: TableColumn<Iscrizione>[] = [
  { key: 'squadra', label: 'Squadra', primary: true },
  { key: 'responsabile', label: 'Responsabile' },
  { key: 'girone', label: 'Girone' },
  { key: 'giocatori', label: 'Giocatori', numeric: true },
  { key: 'quota', label: 'Quota', numeric: true },
  { key: 'stato', label: 'Stato' },
];

const ISCRIZIONI_CHART: ChartData = {
  labels: ['1 nov', '4 nov', '7 nov', '10 nov', '13 nov', '16 nov', '19 nov'],
  datasets: [
    { label: 'Iscrizioni', data: [2, 5, 9, 12, 16, 21, 24] },
    { label: 'Pagate', data: [1, 3, 6, 9, 12, 15, 18] },
  ],
};

@Component({
  selector: 'pt-backoffice',
  imports: [Avatar, Badge, Button, Chart, Field, FieldInput, GlassCard, Select, Stat, Table, TableCell, TeamLogo, SbIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="ui-skip-link" href="#bo-main">Vai al contenuto</a>
    <div class="layout">
      <nav class="sidebar" data-theme="dark" aria-label="Gestione torneo">
        <div class="brand"><span class="mark" aria-hidden="true">C85</span><span>Gestione</span></div>
        <ul>
          @for (i of menu; track i.id) {
            <li>
              <a [href]="'#' + i.id" class="item" [attr.aria-current]="i.id === 'iscrizioni' ? 'page' : null"><sb-icon [name]="i.icon" [size]="18" />{{ i.label }}</a>
            </li>
          }
        </ul>
      </nav>
      <div class="main">
        <header class="topbar">
          <ui-field label="Cerca" class="search"><input uiInput type="search" placeholder="Squadre, giocatori, partite…" /></ui-field>
          <ui-avatar name="Mario Rossi" size="sm" />
        </header>
        <main id="bo-main" class="content" tabindex="-1">
          <div class="page-head">
            <div>
              <p class="ui-eyebrow" style="margin:0">Torneo C85 · 2026</p>
              <h1 class="ui-bo-h1" style="margin:0">Iscrizioni</h1>
            </div>
            <div class="page-actions">
              <ui-select [options]="gironi" [(value)]="girone" ariaLabel="Filtra per girone" placeholder="Tutti i gironi" />
              <button uiButton variant="secondary"><sb-icon name="list" /> Esporta</button>
              <button uiButton variant="primary"><sb-icon name="plus" /> Nuova iscrizione</button>
            </div>
          </div>

          <section class="stats" aria-label="Riepilogo">
            <ui-stat label="Squadre iscritte" [value]="24" hint="su 32 posti"><sb-icon uiStatIcon name="users" [size]="16" /></ui-stat>
            <ui-stat label="Quote pagate" [value]="18" tone="success" hint="€ 3.240"><sb-icon uiStatIcon name="check" [size]="16" /></ui-stat>
            <ui-stat label="In attesa" [value]="4" tone="brand"><sb-icon uiStatIcon name="calendar" [size]="16" /></ui-stat>
            <ui-stat label="Scadute" [value]="2" tone="danger"><sb-icon uiStatIcon name="alert" [size]="16" /></ui-stat>
          </section>

          <div class="grid">
            <ui-glass-card variant="brand" padding="md">
              <h2 class="ui-card-title" style="margin:0 0 .75rem">Andamento iscrizioni</h2>
              <ui-chart type="line" [data]="chart" ariaLabel="Iscrizioni e quote pagate dal 1 al 19 novembre" categoryLabel="Data" height="14rem" />
            </ui-glass-card>
            <ui-glass-card padding="none">
              <ui-table caption="Iscrizioni" [columns]="cols" [rows]="rows" rowKey="id" [rowLink]="link" stack>
                <ng-template uiCell="squadra" let-row>
                  <span class="team"><ui-team-logo [name]="row.squadra" [color]="row.colore" size="xs" decorative />{{ row.squadra }}</span>
                </ng-template>
                <ng-template uiCell="stato" let-value="value">
                  <ui-badge [tone]="value === 'pagata' ? 'success' : value === 'scaduta' ? 'danger' : 'warning'">{{ value }}</ui-badge>
                </ng-template>
              </ui-table>
            </ui-glass-card>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; min-height: 100dvh; background: var(--ui-bg); }
    .layout { display: grid; min-height: 100dvh; }
    @media (min-width: 1024px) { .layout { grid-template-columns: 15rem 1fr; } }
    .sidebar { background: var(--bo-sidebar); color: var(--bo-sidebar-text); padding: 0.75rem; }
    @media (min-width: 1024px) { .sidebar { position: sticky; top: 0; height: 100dvh; box-sizing: border-box; } }
    .brand { display: flex; align-items: center; gap: 0.625rem; height: var(--ui-bo-topbar-height); padding: 0 0.5rem; font-weight: 800; }
    .mark { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: var(--ui-radius-control); background: var(--bo-sidebar-active-bg); color: var(--bo-sidebar-active-fg); font-family: var(--ui-font-display); font-size: var(--ui-font-size-sm); }
    ul { list-style: none; margin: 0.5rem 0 0; padding: 0; display: flex; gap: 0.25rem; overflow-x: auto; }
    @media (min-width: 1024px) { ul { flex-direction: column; overflow: visible; } }
    .item { display: flex; align-items: center; gap: 0.625rem; min-height: 2.5rem; padding: 0 0.75rem; border-radius: var(--ui-radius-control); color: var(--bo-sidebar-muted); text-decoration: none; font-size: var(--ui-font-size-sm); font-weight: 600; white-space: nowrap; }
    .item:hover { color: var(--bo-sidebar-text); background: var(--ui-surface-sunken); }
    .item[aria-current='page'] { background: var(--bo-sidebar-active-bg); color: var(--bo-sidebar-active-fg); font-weight: 700; }
    .main { min-width: 0; display: flex; flex-direction: column; }
    .topbar { position: sticky; top: 0; z-index: var(--ui-z-header); display: flex; align-items: center; justify-content: space-between; gap: 1rem; height: var(--ui-bo-topbar-height); padding: 0 1.5rem; background: var(--ui-surface); border-bottom: 1px solid var(--ui-border); }
    .search { width: min(24rem, 100%); }
    .search ::ng-deep label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .content { padding: 1.5rem; display: grid; gap: 1.5rem; align-content: start; }
    .content:focus { outline: none; }
    .page-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--ui-border); }
    .page-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
    .page-actions ui-select { width: 12rem; }
    .stats { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
    .grid { display: grid; gap: 1rem; }
    @media (min-width: 1280px) { .grid { grid-template-columns: 2fr 3fr; align-items: start; } }
    .team { display: inline-flex; align-items: center; gap: 0.5rem; }
  `,
})
class BackofficeDashboard {
  protected readonly menu = [
    { id: 'panoramica', label: 'Panoramica', icon: 'grid' },
    { id: 'iscrizioni', label: 'Iscrizioni', icon: 'users' },
    { id: 'calendario', label: 'Calendario', icon: 'calendar' },
    { id: 'risultati', label: 'Risultati', icon: 'goal' },
    { id: 'classifiche', label: 'Classifiche', icon: 'trophy' },
    { id: 'impostazioni', label: 'Impostazioni', icon: 'settings' },
  ];
  protected readonly gironi = GIRONI;
  protected readonly girone = signal<string | null>(null);
  protected readonly cols = COLS;
  protected readonly rows = ISCRIZIONI;
  protected readonly chart = ISCRIZIONI_CHART;
  protected readonly link = (r: Iscrizione) => `#iscrizione-${r.id}`;
}

const meta: Meta = {
  title: 'Patterns/Dashboard backoffice',
  decorators: [moduleMetadata({ imports: [BackofficeDashboard] })],
  render: () => ({ template: `<pt-backoffice />` }),
  parameters: {
    fullBleed: true,
    docs: {
      description: {
        component: `Tema piatto desktop (classe \`.bo\`): sidebar sempre scura con voce attiva orange su ink, top bar 3.5rem, header di pagina con titolo a sinistra
e azioni a destra separati da un divisore, stat, card brand con bordo sinistro 3px arancio e grafico, lista come unico pannello a righe divise con zebra
e header sticky. Sotto 1024px la sidebar diventa una barra di navigazione orizzontale.`,
      },
    },
  },
  tags: ['!autodocs'],
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = {
  globals: { theme: 'backoffice', viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const nav = c.getByRole('navigation', { name: 'Gestione torneo' });
    await expect(within(nav).getByRole('link', { name: 'Iscrizioni' })).toHaveAttribute('aria-current', 'page');
    await expect(c.getByRole('table', { name: 'Iscrizioni' })).toBeInTheDocument();
    // tema piatto: niente vetro
    const card = canvasElement.querySelector('ui-stat')!;
    await expect(getComputedStyle(card).backdropFilter).toBe('none');
    await expect(getComputedStyle(card).borderRadius).toBe('8px');
  },
};
export const DesktopDark: Story = { name: 'Desktop dark', globals: { theme: 'backoffice-dark', viewport: { value: 'desktop', isRotated: false } } };
export const Tablet: Story = { name: 'Sotto 1024px', globals: { theme: 'backoffice', viewport: { value: 'mobile', isRotated: false } } };
