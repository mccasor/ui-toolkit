/**
 * Gli overlay CDK vivono in fondo al <body>, fuori dal contenitore che porta il tema.
 * Copia sul pannello il contesto del punto d'origine: classe `.bo` e `data-theme` più vicino.
 */
export function applyThemeContext(origin: Element, pane: HTMLElement) {
  const bo = origin.closest('.bo');
  pane.classList.toggle('bo', !!bo);
  const themed = origin.closest('[data-theme]');
  if (themed && themed !== document.documentElement) pane.setAttribute('data-theme', themed.getAttribute('data-theme')!);
  else pane.removeAttribute('data-theme');
}
