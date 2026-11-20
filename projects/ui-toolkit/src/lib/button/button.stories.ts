import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SbIcon } from '../../../stories/support/icon';
import { Button } from './button';

type Args = Button & { label: string; click: () => void };

const meta: Meta<Args> = {
  title: 'Components/Button',
  component: Button,
  decorators: [moduleMetadata({ imports: [Button, SbIcon] })],
  args: { label: 'Salva', variant: 'primary', size: 'md', block: false, iconOnly: false, loading: false, disabled: false, type: 'button', click: fn() },
  argTypes: {
    label: { control: 'text', description: 'Contenuto (slot)' },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    click: { table: { disable: true } },
  },
  render: ({ label, click, ...args }) => ({
    props: { ...args, label, click },
    template: `<button uiButton ${argsToTemplate(args)} (click)="click()">${label}</button>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Attributo \`uiButton\` su \`<button>\` e \`<a>\` (stessa resa). Altezza sm 2.25rem / md 2.75rem / lg 3.25rem, padding 0.875 / 1.125 / 1.5rem,
radius control, 700, line-height 1. Piatto: niente gradienti né glow, bordo 1px più scuro del riempimento.

**Accessibilità**
- \`type="button"\` di default: un submit va dichiarato esplicitamente.
- \`loading\` → spinner \`aria-hidden\`, \`aria-busy="true"\`, bottone disabilitato.
- Su \`<a>\`, \`disabled\` diventa \`aria-disabled="true"\` + \`tabindex="-1"\` e il click viene annullato.
- \`iconOnly\` richiede \`aria-label\` (avviso in dev mode); l'icona è decorativa (\`aria-hidden\`).
- Focus visibile: outline 3px \`--ui-focus\`, offset 2px. md ≥ 44px (touch target).
- Testo scuro su arancio (ink, 9.7:1), bianco su danger (5.3:1).`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Salva' });
    await expect(btn).toHaveAttribute('type', 'button');
    await userEvent.click(btn);
    await expect(args.click).toHaveBeenCalledOnce();
  },
};
export const Primary: Story = { args: { variant: 'primary', label: 'Iscriviti' } };
export const Secondary: Story = { args: { variant: 'secondary', label: 'Annulla' } };
export const Ghost: Story = { args: { variant: 'ghost', label: 'Dettagli' } };
export const Danger: Story = { args: { variant: 'danger', label: 'Elimina' } };
export const Small: Story = { args: { size: 'sm', label: 'Piccolo' } };
export const Large: Story = { args: { size: 'lg', label: 'Grande' } };
export const Block: Story = { args: { block: true, label: 'A tutta larghezza' } };

export const WithIcon: Story = {
  name: 'Con icona',
  render: () => ({ template: `<button uiButton variant="primary"><sb-icon name="plus" /> Nuova partita</button>` }),
};

export const IconOnly: Story = {
  name: 'Solo icona',
  render: () => ({
    template: `<div style="display:flex;gap:.5rem">
      <button uiButton variant="primary" iconOnly aria-label="Aggiungi"><sb-icon name="plus" /></button>
      <button uiButton variant="secondary" iconOnly aria-label="Cerca"><sb-icon name="search" /></button>
      <button uiButton variant="ghost" iconOnly aria-label="Impostazioni"><sb-icon name="settings" /></button>
      <button uiButton variant="danger" iconOnly aria-label="Elimina"><sb-icon name="trash" /></button>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Aggiungi' });
    await expect(btn.offsetWidth).toBe(btn.offsetHeight);
  },
};

export const Loading: Story = {
  args: { loading: true, label: 'Salvataggio…' },
  play: async ({ canvasElement, args }) => {
    const btn = within(canvasElement).getByRole('button');
    await expect(btn).toHaveAttribute('aria-busy', 'true');
    await expect(btn).toBeDisabled();
    await expect(args.click).not.toHaveBeenCalled();
  },
};
export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  name: 'Come link (<a>)',
  render: () => ({
    template: `<div style="display:flex;gap:.5rem;flex-wrap:wrap">
      <a uiButton variant="primary" href="#classifica">Vai alla classifica</a>
      <a uiButton variant="secondary" href="#x" disabled>Link disabilitato</a>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const disabled = within(canvasElement).getByText('Link disabilitato');
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(disabled).toHaveAttribute('tabindex', '-1');
  },
};

const MATRIX = `
  <div style="display:grid;gap:1rem">
    @for (s of ['sm','md','lg']; track s) {
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">
        <button uiButton variant="primary" [size]="$any(s)">Primary</button>
        <button uiButton variant="secondary" [size]="$any(s)">Secondary</button>
        <button uiButton variant="ghost" [size]="$any(s)">Ghost</button>
        <button uiButton variant="danger" [size]="$any(s)">Danger</button>
        <button uiButton variant="primary" [size]="$any(s)" loading>Loading</button>
        <button uiButton variant="secondary" [size]="$any(s)" disabled>Disabled</button>
        <button uiButton variant="secondary" [size]="$any(s)" iconOnly aria-label="Aggiungi"><sb-icon name="plus" /></button>
      </div>
    }
  </div>`;

export const Hover: Story = { name: 'Stato: hover', render: () => ({ template: MATRIX }), parameters: { pseudo: { hover: true } } };
export const FocusVisible: Story = { name: 'Stato: focus-visible', render: () => ({ template: MATRIX }), parameters: { pseudo: { focusVisible: true } } };
export const Active: Story = { name: 'Stato: active', render: () => ({ template: MATRIX }), parameters: { pseudo: { active: true } } };

export const Light: Story = { name: 'Tema: light', render: () => ({ template: MATRIX }), globals: { theme: 'light' } };
export const Dark: Story = { name: 'Tema: dark', render: () => ({ template: MATRIX }), globals: { theme: 'dark' } };
export const Backoffice: Story = { name: 'Tema: backoffice', render: () => ({ template: MATRIX }), globals: { theme: 'backoffice' } };
export const BackofficeDark: Story = { name: 'Tema: backoffice dark', render: () => ({ template: MATRIX }), globals: { theme: 'backoffice-dark' } };

export const Keyboard: Story = {
  name: 'Tastiera',
  render: () => ({ template: `<button uiButton variant="secondary">Primo</button> <button uiButton variant="primary">Secondo</button>` }),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button', { name: 'Primo' })).toHaveFocus();
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button', { name: 'Secondo' })).toHaveFocus();
  },
};
