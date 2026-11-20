import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Field, FieldInput } from './field';

type Args = { label: string; hint: string; error: string; required: boolean; placeholder: string; disabled: boolean };

const meta: Meta<Args> = {
  title: 'Components/Field e Input',
  component: Field,
  subcomponents: { FieldInput },
  decorators: [moduleMetadata({ imports: [Field, FieldInput] })],
  args: { label: 'Nome squadra', hint: 'Max 24 caratteri, visibile in classifica', error: '', required: false, placeholder: 'Es. Leoni di Quartiere', disabled: false },
  render: (args) => ({
    props: args,
    template: `<ui-field style="max-width:24rem" [label]="label" [hint]="hint" [error]="error || null" [required]="required">
      <input uiInput type="text" [placeholder]="placeholder" [disabled]="disabled" />
    </ui-field>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `\`ui-field\` è il wrapper (label 0.875rem/700 con asterisco danger-text se required, hint text-sm muted, errore text-sm 600 danger-text con icona alert).
\`uiInput\` è la direttiva su \`input\`, \`select\`, \`textarea\`: min-height 2.75rem, padding 0.625rem 0.875rem, radius control, bordo border-strong, fondo surface-strong.
Focus: bordo focus + anello \`0 0 0 3px brand-soft, 0 0 0 1px focus\`. Invalid: bordo danger. Placeholder muted all'85%.

**Accessibilità** — il Field collega automaticamente \`label[for]\`/\`id\`, \`aria-describedby\` (hint + errore), \`aria-invalid\` e \`required\`.
L'errore ha \`role="alert"\` ed è annunciato quando compare; l'asterisco è \`aria-hidden\` (lo stato è nel \`required\` nativo).`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByLabelText('Nome squadra');
    await expect(input).toHaveAccessibleDescription('Max 24 caratteri, visibile in classifica');
    await userEvent.type(input, 'Falchi');
    await expect(input).toHaveValue('Falchi');
  },
};
export const Required: Story = { args: { required: true } };
export const WithError: Story = {
  name: 'Errore',
  args: { error: 'Questo nome è già usato da un’altra squadra', required: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByLabelText(/Nome squadra/);
    await expect(input).toBeInvalid();
    await expect(c.getByRole('alert')).toHaveTextContent('già usato');
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Focus: Story = { name: 'Stato: focus', parameters: { pseudo: { focus: true, focusVisible: true } } };
export const Hover: Story = { name: 'Stato: hover', parameters: { pseudo: { hover: true } } };

const FORM = () => ({
  template: `<form style="display:grid;gap:1rem;max-width:24rem" (submit)="$event.preventDefault()">
    <ui-field label="Email" hint="Riceverai la conferma d'iscrizione" required><input uiInput type="email" autocomplete="email" /></ui-field>
    <ui-field label="Categoria"><select uiInput><option>Under 12</option><option>Under 14</option><option>Open</option></select></ui-field>
    <ui-field label="Note"><textarea uiInput placeholder="Allergie, orari, richieste…"></textarea></ui-field>
    <ui-field label="Telefono" error="Inserisci un numero valido"><input uiInput type="tel" value="12" /></ui-field>
  </form>`,
});
export const Controls: Story = { name: 'Input, select, textarea', render: FORM };
const themes = themeStories<Args>(FORM);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
