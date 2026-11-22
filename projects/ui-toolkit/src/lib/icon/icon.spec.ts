import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BUILTIN_ICONS } from './icons.generated';
import { Icon, provideIcons } from './icon';

@Component({
  imports: [Icon],
  template: `<ui-icon [name]="name()" [size]="24" [label]="label()" />`,
})
class Host {
  name = signal('home');
  label = signal<string | undefined>(undefined);
}

describe('Icon', () => {
  async function setup(providers: unknown[] = []) {
    TestBed.configureTestingModule({ providers: providers as never[] });
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const svg = () => f.nativeElement.querySelector('svg') as SVGSVGElement;
    return { f, svg };
  }

  it('disegna un\'icona inclusa: griglia 256, currentColor, dimensione', async () => {
    const { svg } = await setup();
    expect(svg().getAttribute('viewBox')).toBe('0 0 256 256');
    expect(svg().getAttribute('fill')).toBe('currentColor');
    expect(svg().getAttribute('width')).toBe('24');
    expect(svg().querySelectorAll('path').length).toBe(BUILTIN_ICONS.home.length);
  });

  it('decorativa senza label, role="img" con label', async () => {
    const { f, svg } = await setup();
    expect(svg().getAttribute('aria-hidden')).toBe('true');
    f.componentInstance.label.set('Casa');
    await f.whenStable();
    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBe('Casa');
    expect(svg().hasAttribute('aria-hidden')).toBe(false);
  });

  it('usa le icone registrate dall\'app, che possono sostituire quelle incluse', async () => {
    const { f, svg } = await setup([provideIcons({ 'yellow-card': ['M0 0h10v10z'] }), provideIcons({ home: ['M1 1z', 'M2 2z'] })]);
    expect(svg().querySelectorAll('path').length).toBe(2);
    f.componentInstance.name.set('yellow-card');
    await f.whenStable();
    expect(svg().querySelector('path')?.getAttribute('d')).toBe('M0 0h10v10z');
  });

  it('nome sconosciuto: niente path', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { f, svg } = await setup();
    f.componentInstance.name.set('boh');
    await f.whenStable();
    expect(svg().querySelectorAll('path').length).toBe(0);
  });
});
