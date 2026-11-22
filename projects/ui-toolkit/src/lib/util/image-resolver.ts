import { InjectionToken } from '@angular/core';

/**
 * Sorgenti d'immagine che l'app risolve da sé (es. riferimenti a documenti `asset:…`): Avatar e TeamLogo chiedono
 * l'immagine al resolver per le `src` che `handles()` riconosce, e mostrano le iniziali finché non arriva.
 */
export interface UiImageResolver {
  handles(src: string): boolean;
  /** immagine già in cache (`undefined` = non ancora letta, `''`/null = assente) */
  peek(src: string): string | null | undefined;
  resolve(src: string): Promise<string | null | undefined>;
}

export const UI_IMAGE_RESOLVER = new InjectionToken<UiImageResolver>('UI_IMAGE_RESOLVER');
