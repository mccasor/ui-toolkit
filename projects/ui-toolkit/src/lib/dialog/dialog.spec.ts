import { ApplicationRef, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideUiLabels } from '../util/labels';
import { DialogService, DialogShell } from './dialog';

describe('DialogService', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((e) => (e.innerHTML = '')));

  it('confirm → true sul bottone di conferma, dialog modale etichettato', async () => {
    const svc = TestBed.inject(DialogService);
    const p = svc.confirm({ title: 'Eliminare?', confirmLabel: 'Elimina', tone: 'danger' });
    await TestBed.inject(ApplicationRef).whenStable();
    const dialog = document.querySelector('[role=dialog]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = dialog.querySelector('h2')!;
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.classList).toContain('glass-strong');
    const btn = [...dialog.querySelectorAll('button')].find((b) => b.textContent?.includes('Elimina'))!;
    expect(btn.classList).toContain('ui-btn--danger');
    btn.click();
    expect(await p).toBe(true);
  });

  it('choose → valore scelto', async () => {
    const svc = TestBed.inject(DialogService);
    const p = svc.choose({ title: 'Campo', options: [{ value: 1, label: 'Uno' }, { value: 2, label: 'Due' }], sheet: false });
    await new Promise((r) => setTimeout(r));
    const btn = [...document.querySelectorAll('.choice')].find((b) => b.textContent?.includes('Due')) as HTMLButtonElement;
    btn.click();
    expect(await p).toBe(2);
  });

  const stable = () => TestBed.inject(ApplicationRef).whenStable();
  const buttons = () => [...document.querySelectorAll('[role=dialog] .ui-dialog-actions button')] as HTMLButtonElement[];

  it('choose a bottoni: risposte nelle azioni dopo Annulla, con la loro variante', async () => {
    const svc = TestBed.inject(DialogService);
    const p = svc.choose({ title: 'Modifiche non salvate', layout: 'buttons', sheet: false, options: [{ value: 'discard', label: 'Scarta', tone: 'danger' }, { value: 'save', label: 'Salva', tone: 'primary' }] });
    await stable();
    expect(document.querySelector('.choices')).toBeNull();
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Annulla', 'Scarta', 'Salva']);
    expect(buttons()[1].classList).toContain('ui-btn--danger');
    buttons()[2].click();
    expect(await p).toBe('save');
  });

  it('wide: pannello largo; closeAll chiude tutto', async () => {
    const svc = TestBed.inject(DialogService);
    const ref = svc.open(DialogTpl, { wide: true });
    const closed = vi.fn();
    ref.closed.subscribe(closed);
    await stable();
    expect((document.querySelector('.ui-dialog-pane') as HTMLElement).style.width).toContain('64rem');
    svc.closeAll();
    expect(closed).toHaveBeenCalled();
  });

  it('testi dal provider (cambio lingua) e output closed', async () => {
    const labels = signal({ cancel: 'Cancel', confirm: 'OK', close: 'Close' });
    TestBed.configureTestingModule({ providers: [provideUiLabels(labels)] });
    const svc = TestBed.inject(DialogService);
    void svc.confirm({ title: 'Sure?' });
    await stable();
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Cancel', 'OK']);
    svc.closeAll();
    DialogTpl.closedCount = 0;
    svc.open(DialogTpl);
    await stable();
    const close = document.querySelector('[role=dialog] .close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close');
    close.click();
    expect(DialogTpl.closedCount).toBe(1);
  });
});

@Component({
  imports: [DialogShell],
  template: `<ui-dialog title="Foto" (closed)="onClosed()">Contenuto</ui-dialog>`,
})
class DialogTpl {
  static closedCount = 0;
  onClosed(): void {
    DialogTpl.closedCount++;
  }
}
