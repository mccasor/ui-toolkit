import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog';

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
});
