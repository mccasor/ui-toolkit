import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Button } from '../button/button';
import { Field, FieldInput } from '../field/field';
import { DialogActions, DialogService, DialogShell } from './dialog';

@Component({
  selector: 'sb-team-form-dialog',
  imports: [DialogShell, DialogActions, Button, Field, FieldInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-dialog title="Nuova squadra" description="La squadra comparirà nel girone selezionato.">
      <form id="team-form" style="display:grid;gap:1rem" (submit)="$event.preventDefault(); ref.close(name())">
        <ui-field label="Nome squadra" required><input uiInput [value]="name()" (input)="name.set($any($event.target).value)" /></ui-field>
        <ui-field label="Allenatore" hint="Facoltativo"><input uiInput /></ui-field>
      </form>
      <div uiDialogActions>
        <button uiButton variant="secondary" (click)="ref.close()">Annulla</button>
        <button uiButton variant="primary" type="submit" form="team-form">Crea squadra</button>
      </div>
    </ui-dialog>
  `,
})
class TeamFormDialog {
  protected readonly ref = inject<DialogRef<string>>(DialogRef);
  protected readonly name = signal('');
}

@Component({
  selector: 'sb-dialog-demo',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
      <button uiButton variant="primary" (click)="form()">Form in dialog</button>
      <button uiButton variant="secondary" (click)="sheet()">Form in sheet</button>
      <button uiButton variant="secondary" (click)="confirm()">Conferma</button>
      <button uiButton variant="danger" (click)="remove()">Elimina squadra</button>
      <button uiButton variant="ghost" (click)="choose()">Scegli campo</button>
    </div>
    <p class="ui-body-sm text-muted" aria-live="polite">Risultato: <strong data-testid="result">{{ result() }}</strong></p>
  `,
})
class DialogDemo {
  readonly autoOpen = input<'confirm' | 'danger' | 'form' | 'choose' | 'sheet' | null>(null);
  private readonly dialog = inject(DialogService);
  protected readonly result = signal('—');
  ngOnInit() {
    const a = this.autoOpen();
    if (a === 'confirm') this.confirm();
    if (a === 'danger') this.remove();
    if (a === 'form') this.form();
    if (a === 'choose') this.choose();
    if (a === 'sheet') this.sheet();
  }
  async confirm() {
    const ok = await this.dialog.confirm({ title: 'Pubblicare il calendario?', message: 'Le squadre riceveranno una notifica con gli orari.', confirmLabel: 'Pubblica' });
    this.result.set(String(ok));
  }
  async remove() {
    const ok = await this.dialog.confirm({
      title: 'Eliminare “Leoni di Quartiere”?',
      message: 'Verranno eliminati anche risultati e statistiche. L’azione non si può annullare.',
      confirmLabel: 'Elimina',
      tone: 'danger',
    });
    this.result.set(String(ok));
  }
  async choose() {
    const v = await this.dialog.choose({
      title: 'Su quale campo?',
      options: [
        { value: 'c1', label: 'Campo 1', description: 'Erba sintetica · coperto' },
        { value: 'c2', label: 'Campo 2', description: 'Erba naturale' },
        { value: 'c3', label: 'Campo 3', description: 'Calcio a 5' },
      ],
    });
    this.result.set(String(v));
  }
  form() {
    this.dialog.open<string>(TeamFormDialog).closed.subscribe((v) => this.result.set(v ?? 'annullato'));
  }
  sheet() {
    this.dialog.open<string>(TeamFormDialog, { sheet: true }).closed.subscribe((v) => this.result.set(v ?? 'annullato'));
  }
}

const meta: Meta = {
  title: 'Components/Dialog',
  component: DialogShell,
  subcomponents: { DialogActions },
  decorators: [moduleMetadata({ imports: [DialogDemo] })],
  render: (args) => ({ props: args, template: `<sb-dialog-demo [autoOpen]="autoOpen" />` }),
  args: { autoOpen: null },
  argTypes: { autoOpen: { control: 'select', options: [null, 'form', 'sheet', 'confirm', 'danger', 'choose'] } },
  parameters: {
    docs: {
      description: {
        component: `\`DialogService\` apre un pannello glass su backdrop \`rgb(15 15 16 / .45)\` + blur 4px. Dialog centrato \`min(32rem, 100vw − 2rem)\`
con pop-in 220ms; sheet ancorato in basso (max 40rem, 90dvh, angoli inferiori a 0, safe-area) con slide-up 260ms.

\`\`\`ts
const ok = await dialog.confirm({ title, message, confirmLabel, cancelLabel, tone: 'danger' }); // Promise<boolean>
const campo = await dialog.choose({ title, options: [{ value, label, description }] });       // valore o null
dialog.open(MioComponente, { data, sheet: true | 'auto' });                                     // DialogRef
\`\`\`

\`<ui-dialog title description>\` impagina il contenuto e collega il titolo come \`aria-labelledby\`; \`[uiDialogActions]\` per i bottoni.

**Accessibilità** — \`role="dialog"\` + \`aria-modal="true"\`, focus trap, focus iniziale sul primo elemento tabbabile (nella conferma: “Annulla”,
scelta sicura), Esc e click sul backdrop chiudono, il focus torna all'elemento che ha aperto il dialog.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Conferma (tastiera e focus)',
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const body = within(document.body);
    const opener = c.getByRole('button', { name: 'Conferma' });
    await userEvent.click(opener);
    const dialog = await body.findByRole('dialog', { name: 'Pubblicare il calendario?' });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    const cancel = body.getByRole('button', { name: 'Annulla' });
    await waitFor(() => expect(cancel).toHaveFocus());
    // focus trap: Tab, Tab torna su Annulla
    await userEvent.tab();
    await expect(body.getByRole('button', { name: 'Pubblica' })).toHaveFocus();
    await userEvent.tab();
    await expect(cancel).toHaveFocus();
    // CDK riconosce Esc da keyCode (27): user-event non lo valorizza, il browser reale sì.
    await fireEvent.keyDown(document.activeElement!, { key: 'Escape', code: 'Escape', keyCode: 27 });
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(c.getByTestId('result')).toHaveTextContent('false'));
    await waitFor(() => expect(opener).toHaveFocus());
  },
};

export const Danger: Story = {
  name: 'Conferma distruttiva',
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(c.getByRole('button', { name: 'Elimina squadra' }));
    await userEvent.click(await body.findByRole('button', { name: 'Elimina' }));
    await waitFor(() => expect(c.getByTestId('result')).toHaveTextContent('true'));
  },
};

export const Choose: Story = {
  name: 'Scelta',
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(c.getByRole('button', { name: 'Scegli campo' }));
    await userEvent.click(await body.findByRole('button', { name: /Campo 2/ }));
    await waitFor(() => expect(c.getByTestId('result')).toHaveTextContent('c2'));
  },
};

export const FormOpen: Story = { name: 'Form in dialog (aperto)', args: { autoOpen: 'form' } };
export const ConfirmOpen: Story = { name: 'Conferma (aperta)', args: { autoOpen: 'danger' } };
export const ChooseOpen: Story = { name: 'Scelta (aperta)', args: { autoOpen: 'choose' } };
export const SheetOpen: Story = { name: 'Sheet (aperto, mobile)', args: { autoOpen: 'sheet' }, globals: { viewport: { value: 'mobile', isRotated: false } } };

const OPEN = () => ({ template: `<sb-dialog-demo autoOpen="form" />` });
const themes = themeStories(OPEN);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
