import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Stat } from '../stat/stat';
import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState, Stat],
  template: `
    <ui-empty-state id="named" title="Nessuna partita" icon="ball" />
    <ui-empty-state id="bare" title="Vuoto" />
    <ui-stat label="Gol" [value]="12" icon="ball" />
  `,
})
class Host {}

describe('EmptyState e Stat: input icon', () => {
  it("disegnano l'icona per nome; senza icona il contenitore resta vuoto", async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#named .icon ui-icon svg')?.getAttribute('width')).toBe('32');
    expect(el.querySelector('#bare .icon ui-icon')).toBeNull();
    expect(el.querySelector('ui-stat .icon ui-icon svg')?.getAttribute('width')).toBe('16');
  });
});
