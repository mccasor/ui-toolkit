import { TestBed } from '@angular/core/testing';
import { ToastRegion, ToastService } from './toast';

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('errori nella live region assertive, il resto in polite; auto-dismiss', async () => {
    const f = TestBed.createComponent(ToastRegion);
    const svc = TestBed.inject(ToastService);
    TestBed.tick();
    const [assertive, polite] = f.nativeElement.querySelectorAll('[aria-live]');
    expect(assertive.getAttribute('aria-live')).toBe('assertive');
    expect(polite.getAttribute('aria-live')).toBe('polite');
    svc.success('Salvato');
    svc.error('Errore di rete', 'Riprova tra qualche secondo');
    TestBed.tick();
    expect(polite.textContent).toContain('Salvato');
    expect(assertive.textContent).toContain('Errore di rete');
    vi.advanceTimersByTime(5001);
    TestBed.tick();
    expect(polite.textContent).not.toContain('Salvato');
    expect(assertive.textContent).toContain('Errore di rete');
  });

  it('pausa del timer', () => {
    const svc = TestBed.inject(ToastService);
    const id = svc.show({ title: 'x', duration: 1000 });
    vi.advanceTimersByTime(500);
    svc.pause(id);
    vi.advanceTimersByTime(2000);
    expect(svc.toasts()).toHaveLength(1);
    svc.resume(id);
    vi.advanceTimersByTime(501);
    expect(svc.toasts()).toHaveLength(0);
  });
});
