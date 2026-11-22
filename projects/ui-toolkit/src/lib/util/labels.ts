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
  /** `{label}` = etichetta del campo */
  imageSource: string;
  imageAddress: string;
  imageModeFile: string;
  imageModeUrl: string;
  imageChoose: string;
  imageChange: string;
  imageDrop: string;
  imageErrorNotImage: string;
  imageErrorUnreadable: string;
  imageErrorNoCanvas: string;
  imageErrorTooLarge: string;
  imageErrorGeneric: string;
  imageErrorLoadFailed: string;
  imageErrorInvalidUrl: string;
  /** `{max}` = caratteri ammessi */
  imageErrorValueTooLarge: string;
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
  imageSource: 'Origine: {label}',
  imageAddress: 'Indirizzo: {label}',
  imageModeFile: 'Carica file',
  imageModeUrl: 'URL',
  imageChoose: 'Scegli immagine',
  imageChange: 'Cambia immagine',
  imageDrop: 'o trascinala qui',
  imageErrorNotImage: "Il file scelto non è un'immagine.",
  imageErrorUnreadable: "Impossibile leggere l'immagine. Prova con un altro file.",
  imageErrorNoCanvas: "Il browser non riesce a elaborare l'immagine.",
  imageErrorTooLarge: "Immagine troppo pesante anche dopo il ridimensionamento: prova con un'immagine più semplice.",
  imageErrorGeneric: "Impossibile elaborare l'immagine. Prova con un altro file.",
  imageErrorLoadFailed: "Impossibile caricare l'immagine da questo indirizzo.",
  imageErrorInvalidUrl: 'Inserisci un URL valido (http o https)',
  imageErrorValueTooLarge: 'Immagine troppo pesante: massimo {max} caratteri.',
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
