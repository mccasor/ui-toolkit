import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AVATAR_FALLBACK } from 'ui-toolkit/tokens';
import { Avatar, TeamLogo } from './avatar';

@Component({
  imports: [Avatar, TeamLogo],
  template: `
    <ui-avatar name="Mario Rossi" size="lg" />
    <ui-avatar name="Giulia" color="#1565C0" decorative />
    <ui-team-logo name="Leoni di Quartiere" [src]="src()" />
  `,
})
class Host {
  src = signal<string | null>('logo.png');
}

describe('Avatar / TeamLogo', () => {
  it('iniziali, nome accessibile, colori fallback e on calcolato', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const [a, b] = f.nativeElement.querySelectorAll('ui-avatar') as NodeListOf<HTMLElement>;
    expect(a.getAttribute('role')).toBe('img');
    expect(a.getAttribute('aria-label')).toBe('Mario Rossi');
    expect(a.textContent?.trim()).toBe('MR');
    expect(a.style.getPropertyValue('--ui-avatar-size')).toBe('3.5rem');
    const fill = a.style.getPropertyValue('--ui-avatar-fill');
    expect(AVATAR_FALLBACK.map((x) => x.fill)).toContain(fill);
    expect(b.getAttribute('aria-hidden')).toBe('true');
    expect(b.style.getPropertyValue('--ui-avatar-on')).toBe('#FFFFFF');
  });

  it('logo: immagine, poi fallback a iniziali se il caricamento fallisce', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const logo = f.nativeElement.querySelector('ui-team-logo') as HTMLElement;
    const img = logo.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('');
    img.dispatchEvent(new Event('error'));
    await f.whenStable();
    expect(logo.querySelector('img')).toBeNull();
    expect(logo.textContent?.trim()).toBe('LQ');
  });
});
