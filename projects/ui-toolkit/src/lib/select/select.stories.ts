import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Field } from '../field/field';
import { Select, type SelectOption } from './select';

const CATEGORIE: SelectOption<string>[] = [
  { value: 'u12', label: 'Under 12' },
  { value: 'u14', label: 'Under 14' },
  { value: 'u16', label: 'Under 16', disabled: true },
  { value: 'open', label: 'Open' },
];

const SQUADRE: SelectOption<string>[] = [
  { value: 'leoni', label: 'Leoni di Quartiere', description: 'Girone A · 12 punti', group: 'Girone A', avatar: { color: '#1565C0', shape: 'square' } },
  { value: 'falchi', label: 'Falchi', description: 'Girone A · 9 punti', group: 'Girone A', avatar: { color: '#FFB936', shape: 'square' } },
  { value: 'aquile', label: 'Aquile Città', description: 'Girone A · 7 punti', group: 'Girone A', avatar: { shape: 'square' } },
  { value: 'sanmarco', label: 'San Marco', description: 'Girone A · 4 punti', group: 'Girone A', avatar: { color: '#6A1B9A', shape: 'square' } },
  { value: 'perche', label: 'Perché No', description: 'Girone B · 11 punti', group: 'Girone B', avatar: { color: '#00796B', shape: 'square' } },
  { value: 'citta', label: 'Città Alta', description: 'Girone B · 10 punti', group: 'Girone B', avatar: { shape: 'square' } },
  { value: 'olimpia', label: 'Olimpia', description: 'Girone B · 6 punti', group: 'Girone B', avatar: { color: '#C62828', shape: 'square' } },
  { value: 'stella', label: 'Stella Rossa', description: 'Girone B · 2 punti', group: 'Girone B', avatar: { color: '#455A64', shape: 'square' } },
  { value: 'velox', label: 'Velox', description: 'Girone C · 8 punti', group: 'Girone C', avatar: { color: '#FDD835', shape: 'square' } },
  { value: 'atletico', label: 'Atlético Borgo', description: 'Girone C · 5 punti', group: 'Girone C', avatar: { shape: 'square' } },
];

const ARBITRI: SelectOption<string>[] = [
  { value: 'mr', label: 'Mario Rossi', description: 'Arbitro federale', avatar: { name: 'Mario Rossi' } },
  { value: 'gb', label: 'Giulia Bianchi', description: 'Assistente', avatar: { name: 'Giulia Bianchi' } },
  { value: 'lv', label: 'Luca Verdi', description: 'Arbitro', avatar: { name: 'Luca Verdi', color: '#2E7D32' } },
];

type Args = { options: SelectOption<string>[]; value: string | null; placeholder: string; disabled: boolean; error: string; searchThreshold: number };

const meta: Meta<Args> = {
  title: 'Components/Select',
  component: Select,
  decorators: [moduleMetadata({ imports: [Select, Field] })],
  args: { options: CATEGORIE, value: null, placeholder: 'Seleziona…', disabled: false, error: '', searchThreshold: 8 },
  render: (args) => ({
    props: { ...args, v: signal(args.value) },
    template: `<div style="max-width:22rem;min-height:22rem">
      <ui-field label="Categoria" [error]="error || null">
        <ui-select [options]="options" [(value)]="v" [placeholder]="placeholder" [disabled]="disabled" [searchThreshold]="searchThreshold" />
      </ui-field>
      <p class="ui-body-sm text-muted">Valore: <strong data-testid="value">{{ v() ?? '—' }}</strong></p>
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Trigger \`role="combobox"\` con aspetto Input; pannello overlay (surface-solid, shadow-float) della stessa larghezza, che si ribalta sopra se manca spazio;
bottom sheet sotto 640px. Ricerca interna accent-insensitive oltre \`searchThreshold\` opzioni (default 8). Opzioni con riga secondaria, avatar/logo
con colore (on calcolato) e gruppi con intestazione.

**Accessibilità** — pattern WAI-ARIA combobox select-only: \`aria-expanded\`, \`aria-controls\`, \`aria-activedescendant\`, listbox con \`option\`
\`aria-selected\` e \`group\` etichettati. Tastiera: ↓/↑/Invio/Spazio aprono; ↑/↓, Home/End, PagSu/PagGiù; type-ahead; Invio/Spazio scelgono; Esc chiude
e ripristina il focus; Tab sceglie e chiude. Dentro \`ui-field\` riceve label, descrizione, invalid e required.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const body = within(document.body);
    const combo = c.getByRole('combobox', { name: 'Categoria' });
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
    combo.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(combo).toHaveAttribute('aria-expanded', 'true');
    const listbox = await body.findByRole('listbox');
    await expect(combo).toHaveAttribute('aria-controls', listbox.id);
    // Under 12 attiva → ↓ Under 14 → ↓ salta Under 16 (disabilitata) → Open
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(combo.getAttribute('aria-activedescendant')).toBe(body.getByRole('option', { name: 'Open' }).id);
    await userEvent.keyboard('{Home}');
    await expect(combo.getAttribute('aria-activedescendant')).toBe(body.getByRole('option', { name: 'Under 12' }).id);
    await userEvent.keyboard('{Enter}');
    await expect(c.getByTestId('value')).toHaveTextContent('u12');
    await expect(combo).toHaveFocus();
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
    // type-ahead + Tab
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('o');
    await userEvent.tab();
    await expect(c.getByTestId('value')).toHaveTextContent('open');
    // Esc chiude senza cambiare
    combo.focus();
    await userEvent.keyboard('{ArrowDown}{End}{Escape}');
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
    await expect(c.getByTestId('value')).toHaveTextContent('open');
    await expect(combo).toHaveFocus();
  },
};

export const WithSearch: Story = {
  name: 'Con ricerca, gruppi e loghi',
  args: { options: SQUADRE },
  render: (args) => ({
    props: { ...args, v: signal<string | null>(null) },
    template: `<div style="max-width:22rem;min-height:26rem">
      <ui-field label="Squadra" hint="Cerca per nome o girone">
        <ui-select [options]="options" [(value)]="v" />
      </ui-field>
      <p class="ui-body-sm text-muted">Valore: <strong data-testid="value">{{ v() ?? '—' }}</strong></p>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(c.getByRole('combobox', { name: 'Squadra' }));
    const search = await body.findByRole('combobox', { name: 'Cerca' });
    await waitFor(() => expect(search).toHaveFocus());
    await expect(body.getAllByRole('group')).toHaveLength(3);
    // ricerca accent-insensitive: "citta" trova "Aquile Città" e "Città Alta"
    await userEvent.type(search, 'citta');
    await expect(body.getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(c.getByTestId('value')).toHaveTextContent('citta');
  },
};

export const WithAvatars: Story = {
  name: 'Avatar e riga secondaria',
  args: { options: ARBITRI, value: 'gb' },
  render: (args) => ({
    props: { ...args, v: signal(args.value) },
    template: `<div style="max-width:22rem;min-height:18rem"><ui-field label="Arbitro"><ui-select [options]="options" [(value)]="v" /></ui-field></div>`,
  }),
};

export const Open: Story = {
  name: 'Aperto',
  args: { options: ARBITRI, value: 'gb' },
  render: WithAvatars.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    await expect(await within(document.body).findByRole('listbox')).toBeVisible();
  },
};

export const WithError: Story = { name: 'Errore', args: { error: 'Scegli una categoria' } };
export const Disabled: Story = { args: { disabled: true, value: 'u14' } };
export const FocusVisible: Story = { name: 'Stato: focus-visible', parameters: { pseudo: { focusVisible: true, focus: true } } };

export const MobileSheet: Story = {
  name: 'Bottom sheet (mobile)',
  args: { options: ARBITRI },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  render: WithAvatars.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const body = within(document.body);
    const listbox = await body.findByRole('listbox');
    await expect(listbox.closest('.panel')).toHaveClass('sheet');
    await expect(body.getByRole('button', { name: 'Chiudi' })).toBeVisible();
  },
};

const ALL = () => ({
  props: { a: CATEGORIE, b: ARBITRI, v1: signal('u14'), v2: signal('mr') },
  template: `<div style="display:grid;gap:1rem;max-width:22rem">
    <ui-field label="Categoria"><ui-select [options]="a" [(value)]="v1" /></ui-field>
    <ui-field label="Arbitro" hint="Con avatar"><ui-select [options]="b" [(value)]="v2" /></ui-field>
    <ui-field label="Vuoto" error="Campo obbligatorio" required><ui-select [options]="a" /></ui-field>
  </div>`,
});
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
