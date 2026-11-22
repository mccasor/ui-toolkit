import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { ImageInput } from './image-input';

/** PNG generato al volo (nessuna richiesta esterna). */
async function samplePng(w = 1200, h = 800): Promise<File> {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ui-primary') || 'orange';
  ctx.fillRect(0, 0, w, h);
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/png'));
  return new File([blob], 'logo.png', { type: 'image/png' });
}

const meta: Meta<ImageInput> = {
  title: 'Components/ImageInput',
  component: ImageInput,
  decorators: [moduleMetadata({ imports: [ImageInput] })],
  args: { shape: 'square', label: 'Logo squadra', previewName: 'Leoni di Quartiere' },
  argTypes: { shape: { control: 'inline-radio', options: ['circle', 'square'] } },
  render: (args) => ({
    props: { ...args, v: signal('') },
    template: `<div style="max-width:28rem"><ui-image-input [label]="label" [previewName]="previewName" [shape]="shape" [(value)]="v" /></div>
      <p class="ui-body-sm text-muted">Valore: <strong data-testid="value">{{ v() ? (v()!.slice(0, 22) + '…') : '—' }}</strong></p>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Immagine da **file** (anche trascinato; ridimensionata nel browser in un data URL: \`size\` px, \`mime\`, \`fit\` cover / contain / scale,
qualità ridotta fino a \`targetChars\`, mai oltre \`maxChars\`) o da **URL** http(s); anteprima \`square\` (TeamLogo) o \`circle\` (Avatar); "Rimuovi".
Errori (tipo, peso, URL non valido o non caricabile, errore esterno) con \`role="alert"\`. \`keepValue\` accetta valori dell'app (es. riferimenti a immagini
già salvate, risolti da \`UI_IMAGE_RESOLVER\`). Testi da \`provideUiLabels\`.

**Accessibilità** — fieldset con legend; scelta file / URL con Segmented (tab); il bottone apre il file input nativo; l'URL è un campo etichettato con
\`aria-invalid\` e descrizione dell'errore.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<ImageInput>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const file = canvasElement.querySelector<HTMLInputElement>('input[type=file]')!;
    await userEvent.upload(file, await samplePng());
    await waitFor(() => expect(c.getByTestId('value')).toHaveTextContent('data:image/'));
    // ridimensionata: quadrato di 256 px (fit contain)
    await waitFor(async () => {
      const img = canvasElement.querySelector<HTMLImageElement>('ui-team-logo img')!;
      await expect(img.naturalWidth).toBe(256);
    });
    await userEvent.click(c.getByRole('button', { name: 'Rimuovi' }));
    await expect(c.getByTestId('value')).toHaveTextContent('—');
    // URL non valido → errore
    await userEvent.click(c.getByRole('tab', { name: 'URL' }));
    const url = c.getByLabelText('Indirizzo: Logo squadra');
    await userEvent.type(url, 'non-un-url');
    url.blur();
    await waitFor(() => expect(c.getByRole('alert')).toHaveTextContent('URL valido'));
    await expect(url).toHaveAttribute('aria-invalid', 'true');
  },
};
export const Circle: Story = { name: 'Anteprima circle (avatar)', args: { shape: 'circle', label: 'Foto profilo', previewName: 'Mario Rossi' } };
export const WrongType: Story = {
  name: 'Errore: file non immagine',
  play: async ({ canvasElement }) => {
    const file = canvasElement.querySelector<HTMLInputElement>('input[type=file]')!;
    file.removeAttribute('accept');
    await userEvent.upload(file, new File(['ciao'], 'note.txt', { type: 'text/plain' }), { applyAccept: false });
    await waitFor(() => expect(within(canvasElement).getByRole('alert')).toHaveTextContent("non è un'immagine"));
  },
};
const themes = themeStories<ImageInput>(meta.render, { args: meta.args });
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
