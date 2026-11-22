import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Segmented, type SegmentedOption } from './segmented';

@Component({
  imports: [Segmented],
  template: `<ui-segmented ariaLabel="Vista" [options]="opts" [(value)]="value" />`,
})
class Host {
  opts: SegmentedOption[] = [
    { value: 'a', label: 'Partite' },
    { value: 'b', label: 'Classifica', disabled: true },
    { value: 'c', label: 'Squadre', icon: 'users' },
  ];
  value = signal<string | null>('a');
}

describe('Segmented', () => {
  async function setup() {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const tabs = [...f.nativeElement.querySelectorAll('[role=tab]')] as HTMLButtonElement[];
    const list = f.nativeElement.querySelector('[role=tablist]') as HTMLElement;
    const key = async (k: string) => {
      list.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      await f.whenStable();
    };
    return { f, tabs, list, key };
  }

  it("l'icona dell'opzione è un <ui-icon> decorativo", async () => {
    const { tabs } = await setup();
    expect(tabs[0].querySelector('ui-icon')).toBeNull();
    expect(tabs[2].querySelector('.icon[aria-hidden=true] ui-icon svg')).not.toBeNull();
  });

  it('ruoli e roving tabindex', async () => {
    const { tabs, list } = await setup();
    expect(list.getAttribute('aria-label')).toBe('Vista');
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
  });

  it('frecce con wrap saltando i disabilitati, Home/End', async () => {
    const { f, key } = await setup();
    await key('ArrowRight');
    expect(f.componentInstance.value()).toBe('c');
    await key('ArrowRight');
    expect(f.componentInstance.value()).toBe('a');
    await key('ArrowLeft');
    expect(f.componentInstance.value()).toBe('c');
    await key('Home');
    expect(f.componentInstance.value()).toBe('a');
    await key('End');
    expect(f.componentInstance.value()).toBe('c');
  });
});
