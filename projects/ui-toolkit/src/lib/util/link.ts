import { InjectionToken, Provider, inject } from '@angular/core';

/**
 * Navigazione dei link interni dei componenti (righe di tabella, ecc.) senza dipendere dal router: l'app fornisce un
 * gestore che naviga e restituisce `true` se ha gestito il click (il componente annulla allora la navigazione nativa).
 * Es. `provideUiLinkHandler((href) => (router.navigateByUrl(href), true))`.
 */
export type UiLinkHandler = (href: string, event: MouseEvent) => boolean;

export const UI_LINK_HANDLER = new InjectionToken<UiLinkHandler>('UI_LINK_HANDLER');

export function provideUiLinkHandler(handler: UiLinkHandler): Provider {
  return { provide: UI_LINK_HANDLER, useValue: handler };
}

/** `(click)` per i link interni: chiama il gestore solo per click semplici (niente tasti modificatori, tasto sinistro). */
export function injectLinkClick(): (href: string, event: MouseEvent) => void {
  const handler = inject(UI_LINK_HANDLER, { optional: true });
  return (href, event) => {
    if (!handler || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (handler(href, event)) event.preventDefault();
  };
}
