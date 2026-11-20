import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Field, FieldInput } from './field';

@Component({
  imports: [Field, FieldInput],
  template: `
    <ui-field label="Email" hint="Useremo questo indirizzo per le notifiche" [error]="error()" required>
      <input uiInput type="email" />
    </ui-field>
    <ui-field label="Note"><textarea uiInput id="note"></textarea></ui-field>
  `,
})
class Host {
  error = signal<string | null>(null);
}

describe('Field + Input', () => {
  it('collega label, id, aria-describedby, required', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    const input = el.querySelector('input')!;
    const label = el.querySelector('label')!;
    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.hasAttribute('required')).toBe(true);
    const hint = el.querySelector('.hint')!;
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.classList).toContain('ui-input');
  });

  it('errore: role=alert, aria-invalid e descrizione', async () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.error.set('Indirizzo non valido');
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    const input = el.querySelector('input')!;
    const err = el.querySelector('[role=alert]')!;
    expect(err.textContent).toContain('Indirizzo non valido');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(err.id);
  });

  it('rispetta un id esistente sul controllo', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const labels = f.nativeElement.querySelectorAll('label');
    expect(labels[1].getAttribute('for')).toBe('note');
  });
});
