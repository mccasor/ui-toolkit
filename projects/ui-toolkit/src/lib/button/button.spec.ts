import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button, type ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <button uiButton [variant]="variant()" [loading]="loading()" [disabled]="disabled()" (click)="clicks = clicks + 1">Salva</button>
    <a uiButton href="/x" [disabled]="disabled()" (click)="linkClicks = linkClicks + 1">Link</a>
    <button uiButton type="submit" size="lg" block>Invia</button>
  `,
})
class Host {
  variant = signal<ButtonVariant>('primary');
  loading = signal(false);
  disabled = signal(false);
  clicks = 0;
  linkClicks = 0;
}

describe('Button', () => {
  async function setup() {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const [btn, submit] = f.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const link = f.nativeElement.querySelector('a') as HTMLAnchorElement;
    return { f, btn, submit, link };
  }

  it('type="button" di default, classi di variante e size', async () => {
    const { btn, submit } = await setup();
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.classList).toContain('ui-btn');
    expect(btn.classList).toContain('ui-btn--primary');
    expect(submit.getAttribute('type')).toBe('submit');
    expect(submit.classList).toContain('ui-btn--lg');
    expect(submit.classList).toContain('ui-btn--block');
  });

  it('loading: spinner, aria-busy, disabilitato', async () => {
    const { f, btn } = await setup();
    f.componentInstance.loading.set(true);
    await f.whenStable();
    expect(btn.querySelector('.ui-spinner')?.getAttribute('aria-hidden')).toBe('true');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.disabled).toBe(true);
  });

  it('<a> disabled → aria-disabled, tabindex -1, click bloccato', async () => {
    const { f, link } = await setup();
    f.componentInstance.disabled.set(true);
    await f.whenStable();
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.hasAttribute('disabled')).toBe(false);
    expect(link.hasAttribute('type')).toBe(false);
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(f.componentInstance.linkClicks).toBe(0);
  });

  it('cambio variante', async () => {
    const { f, btn } = await setup();
    f.componentInstance.variant.set('danger');
    await f.whenStable();
    expect(btn.classList).toContain('ui-btn--danger');
    expect(btn.classList).not.toContain('ui-btn--primary');
  });
});
