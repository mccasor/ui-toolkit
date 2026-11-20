import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { ColorSwatches } from './color-swatches';

const meta: Meta<ColorSwatches> = {
  title: 'Components/ColorSwatches',
  component: ColorSwatches,
  decorators: [moduleMetadata({ imports: [ColorSwatches] })],
  render: () => ({
    props: { v: signal<string | null>('#1565C0') },
    template: `<ui-color-swatches label="Colore squadra" [(value)]="v" />
      <p class="ui-body-sm text-muted">Valore: <strong data-testid="value">{{ v() ?? 'nessuno' }}</strong></p>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Radio group nativo: "Nessuno" (tratteggio diagonale) + gli 11 swatch utente; il selezionato ha il doppio anello (surface 2px + text 4px).
Il valore è l'hex scelto (o null); il testo sopra quel colore si ottiene con \`onColor(hex)\`.

**Accessibilità** — \`fieldset\`/\`legend\`, radio nativi con nome (es. "Blu") anche come tooltip: frecce per muoversi, un solo tab stop,
focus visibile sul pallino; target 44px.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<ColorSwatches>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole('group', { name: 'Colore squadra' });
    const radios = within(group).getAllByRole('radio');
    await expect(radios).toHaveLength(12);
    await expect(c.getByRole('radio', { name: 'Blu' })).toBeChecked();
    await userEvent.click(c.getByRole('radio', { name: 'Viola' }));
    await expect(c.getByTestId('value')).toHaveTextContent('#6A1B9A');
    await userEvent.click(c.getByRole('radio', { name: 'Nessuno' }));
    await expect(c.getByTestId('value')).toHaveTextContent('nessuno');
  },
};
export const FocusVisible: Story = { name: 'Stato: focus-visible', parameters: { pseudo: { focusVisible: true } } };
const themes = themeStories<ColorSwatches>(meta.render);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
