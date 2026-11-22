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

  describe('estensioni per le app', () => {
    @Component({
      imports: [Select],
      template: `<ui-select ariaLabel="Squadra" controlId="team-pick" [options]="opts" [(value)]="value" clearable required
                            [searchable]="true" searchPlaceholder="Cerca squadra" (touch)="touched = touched + 1" />`,
    })
    class Ext {
      opts: SelectOption<string>[] = [
        { value: 'a', label: 'Leoni', icon: 'shield' },
        { value: 'b', label: 'Tigri', avatar: { src: null, color: '#C62828', shape: 'square' } },
      ];
      value = signal<string | null>('a');
      touched = 0;
    }

    async function setup() {
      const f = TestBed.createComponent(Ext);
      await f.whenStable();
      const el: HTMLElement = f.nativeElement;
      const trigger = el.querySelector('[role=combobox]') as HTMLButtonElement;
      return { f, el, trigger };
    }

    it('controlId, required e icona dell\'opzione scelta', async () => {
      const { trigger } = await setup();
      expect(trigger.id).toBe('team-pick');
      expect(trigger.getAttribute('aria-required')).toBe('true');
      expect(trigger.querySelector('ui-icon')).not.toBeNull();
    });

    it('clearable: svuota il valore e torna sul trigger', async () => {
      const { f, el, trigger } = await setup();
      (el.querySelector('.clear') as HTMLButtonElement).click();
      await f.whenStable();
      expect(f.componentInstance.value()).toBeNull();
      expect(document.activeElement).toBe(trigger);
      expect(el.querySelector('.clear')).toBeNull();
    });

    it('searchable forzato con due opzioni e segnaposto', async () => {
      const { f, trigger } = await setup();
      trigger.click();
      await f.whenStable();
      const search = document.querySelector('.cdk-overlay-container input.search') as HTMLInputElement;
      expect(search.placeholder).toBe('Cerca squadra');
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.querySelector('.cdk-overlay-container')!.innerHTML = '';
    });

    it('touch quando si lascia il trigger', async () => {
      const { f, trigger } = await setup();
      trigger.focus();
      trigger.blur();
      expect(f.componentInstance.touched).toBe(1);
    });
  });
});
