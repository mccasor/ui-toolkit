import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Button } from '../button/button';
import { ToastRegion, ToastService } from './toast';

@Component({
  selector: 'sb-toast-demo',
  imports: [Button, ToastRegion],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-toast-region top="1rem" />
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:12rem">
      <button uiButton variant="secondary" (click)="toast.info('Calendario aggiornato', 'Gli orari del girone B sono cambiati')">Info</button>
      <button uiButton variant="secondary" (click)="toast.success('Risultato salvato')">Success</button>
      <button uiButton variant="secondary" (click)="toast.warning('Campo 2 non disponibile', 'Le partite sono state spostate sul campo 3')">Warning</button>
      <button uiButton variant="danger" (click)="toast.error('Salvataggio non riuscito', 'Controlla la connessione e riprova')">Danger</button>
    </div>
  `,
})
class ToastDemo {
  readonly preset = input(false);
  protected readonly toast = inject(ToastService);
  ngOnInit() {
    this.toast.clear();
    if (this.preset()) {
      this.toast.show({ tone: 'info', title: 'Calendario aggiornato', detail: 'Gli orari del girone B sono cambiati', duration: 0 });
      this.toast.show({ tone: 'success', title: 'Risultato salvato', duration: 0 });
      this.toast.show({ tone: 'warning', title: 'Campo 2 non disponibile', detail: 'Le partite sono state spostate sul campo 3', duration: 0 });
      this.toast.show({ tone: 'danger', title: 'Salvataggio non riuscito', detail: 'Controlla la connessione e riprova', duration: 0 });
    }
  }
  ngOnDestroy() {
    this.toast.clear();
  }
}

const meta: Meta = {
  title: 'Components/Toast',
  component: ToastRegion,
  decorators: [moduleMetadata({ imports: [ToastDemo] })],
  args: { preset: false },
  render: (args) => ({ props: args, template: `<sb-toast-demo [preset]="preset" />` }),
  parameters: {
    docs: {
      description: {
        component: `\`ToastService\` (\`show\`, \`info\`, \`success\`, \`warning\`, \`error\`, \`dismiss\`) + \`<ui-toast-region>\` una volta nel layout.
In alto sotto l'header (sticky-top + 0.5rem, safe-area), larghezza min(26rem, 100%), radius 1rem, glass strong, shadow-float, bordo sinistro 4px del tono
(info = text, success, warning, danger), icona colorata col *-text, titolo bold + dettaglio text-sm muted. Ingresso 260ms.

**Accessibilità** — due live region sempre nel DOM: \`assertive\` per gli errori, \`polite\` per il resto. Il timer (5s, 8s per gli errori) si ferma
con hover o focus; ogni toast si chiude con un bottone etichettato.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const polite = canvasElement.querySelector('[aria-live=polite]')!;
    const assertive = canvasElement.querySelector('[aria-live=assertive]')!;
    await userEvent.click(c.getByRole('button', { name: 'Success' }));
    await waitFor(() => expect(polite).toHaveTextContent('Risultato salvato'));
    await userEvent.click(c.getByRole('button', { name: 'Danger' }));
    await waitFor(() => expect(assertive).toHaveTextContent('Salvataggio non riuscito'));
    await userEvent.click(within(assertive as HTMLElement).getByRole('button', { name: 'Chiudi notifica' }));
    await waitFor(() => expect(assertive).not.toHaveTextContent('Salvataggio'));
  },
};
export const AllTones: Story = { name: 'Tutti i toni', args: { preset: true } };
export const Mobile: Story = { name: 'Mobile', args: { preset: true }, globals: { viewport: { value: 'mobile', isRotated: false } } };

const ALL = () => ({ template: `<sb-toast-demo [preset]="true" />` });
const themes = themeStories(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
