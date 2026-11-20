import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Field } from '../field/field';
import { Select, type SelectOption } from './select';

@Component({
  imports: [Select, Field],
  template: `<ui-field label="Categoria" hint="Scegli" required><ui-select [options]="opts" [(value)]="value" /></ui-field>`,
})
class Host {
  opts: SelectOption<string>[] = [
    { value: 'a', label: 'Àlfa' },
    { value: 'b', label: 'Beta', disabled: true },
    { value: 'c', label: 'Gamma' },
  ];
  value = signal<string | null>(null);
}

describe('Select', () => {
  it('trigger combobox collegato al Field', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    const trigger = el.querySelector('[role=combobox]')!;
    const label = el.querySelector('label')!;
    expect(trigger.getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.getAttribute('for')).toBe(trigger.id);
    expect(trigger.getAttribute('aria-required')).toBe('true');
    expect(trigger.getAttribute('aria-describedby')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Seleziona…');
  });

  it('apre, naviga saltando i disabilitati e sceglie con Invio', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const trigger = f.nativeElement.querySelector('[role=combobox]') as HTMLButtonElement;
    const key = async (k: string) => {
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      await f.whenStable();
    };
    await key('ArrowDown');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const options = [...document.querySelectorAll('[role=option]')];
    expect(options).toHaveLength(3);
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[0].id);
    await key('ArrowDown');
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[2].id);
    await key('Enter');
    expect(f.componentInstance.value()).toBe('c');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Gamma');
  });
});
