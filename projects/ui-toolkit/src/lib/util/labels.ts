import { InjectionToken, Provider, computed, inject, isSignal, signal, type Signal } from '@angular/core';

/** Testi predefiniti dei componenti (etichette accessibili, bottoni, messaggi). Gli input dei componenti hanno la precedenza. */
export interface UiLabels {
  cancel: string;
  confirm: string;
  close: string;
  toastClose: string;
  carouselPrev: string;
  carouselNext: string;
  carouselDots: string;
  search: string;
  selectPlaceholder: string;
  noResults: string;
  clear: string;
  tableEmpty: string;
  chartCategory: string;
  chartSeries: string;
  chartKeyboardHint: string;
  image: string;
  imageUpload: string;
  imageRemove: string;
  color: string;
  colorNone: string;
  skipToContent: string;
  tabBar: string;
  footer: string;
}

/** Default in italiano. */
export const UI_LABELS_IT: UiLabels = {
  cancel: 'Annulla',
  confirm: 'Conferma',
  close: 'Chiudi',
  toastClose: 'Chiudi notifica',
  carouselPrev: 'Slide precedente',
  carouselNext: 'Slide successiva',
  carouselDots: 'Scegli la slide',
  search: 'Cerca',
  selectPlaceholder: 'Seleziona…',
  noResults: 'Nessun risultato',
  clear: 'Svuota',
  tableEmpty: 'Nessun dato',
  chartCategory: 'Categoria',
  chartSeries: 'Serie',
  chartKeyboardHint: 'Usa le frecce sinistra e destra per scorrere i valori.',
  image: 'Immagine',
  imageUpload: 'Carica immagine',
  imageRemove: 'Rimuovi',
  color: 'Colore',
  colorNone: 'Nessuno',
  skipToContent: 'Vai al contenuto',
  tabBar: 'Navigazione principale',
  footer: 'Link a piè di pagina',
};

export const UI_LABELS = new InjectionToken<Signal<Partial<UiLabels>>>('UI_LABELS');

/**
 * Testi dei componenti, anche reattivi (cambio lingua): `provideUiLabels(computed(() => ({ cancel: t('Annulla') … })))`.
 * Le chiavi mancanti restano in italiano.
 */
export function provideUiLabels(labels: Signal<Partial<UiLabels>> | Partial<UiLabels>): Provider {
  return { provide: UI_LABELS, useValue: isSignal(labels) ? labels : signal(labels) };
}

/** I testi correnti (default italiani + quelli forniti dall'app). */
export function injectUiLabels(): Signal<UiLabels> {
  const provided = inject(UI_LABELS, { optional: true });
  return computed(() => ({ ...UI_LABELS_IT, ...provided?.() }));
}
