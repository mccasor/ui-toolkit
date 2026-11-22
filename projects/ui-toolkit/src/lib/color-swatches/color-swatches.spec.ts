import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ColorSwatches } from './color-swatches';

@Component({ imports: [ColorSwatches], template: `<ui-color-swatches label="Colore" [(value)]="v" /><ui-color-swatches id="named" name="team-color" />` })
class Host {
  v = signal<string | null>(null);
}

describe('ColorSwatches', () => {
  it('radio nativi con nome, "Nessuno" selezionato di default, cambio valore', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const radios = [...f.nativeElement.querySelectorAll('ui-color-swatches:not(#named) input[type=radio]')] as HTMLInputElement[];
    expect(radios).toHaveLength(12);
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    expect(radios[0].checked).toBe(true);
    radios[6].click();
    await f.whenStable();
    expect(f.componentInstance.v()).toBe('#1565C0');
  });

  it('name: nome del gruppo scelto dall\'app', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const radios = [...f.nativeElement.querySelectorAll('#named input[type=radio]')] as HTMLInputElement[];
    expect(radios.every((r) => r.name === 'team-color')).toBe(true);
  });
});
