import { DestroyRef, inject, signal, type Signal } from '@angular/core';

/** Signal che segue una media query (false fuori dal browser). */
export function mediaQuery(query: string): Signal<boolean> {
  const mql = typeof matchMedia === 'function' ? matchMedia(query) : null;
  const s = signal(mql?.matches ?? false);
  if (mql) {
    const on = (e: MediaQueryListEvent) => s.set(e.matches);
    mql.addEventListener('change', on);
    inject(DestroyRef).onDestroy(() => mql.removeEventListener('change', on));
  }
  return s.asReadonly();
}

/** true se l'utente (o il toggle data-motion) chiede reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-motion') === 'reduce') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
