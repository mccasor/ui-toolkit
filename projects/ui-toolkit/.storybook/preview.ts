import { provideZonelessChangeDetection } from '@angular/core';
import { applicationConfig, componentWrapperDecorator, type Preview } from '@storybook/angular-vite';

let wrapperClass = 'sb-story-root';

type Theme = 'light' | 'dark' | 'system' | 'backoffice' | 'backoffice-dark';

/** Applica tema e preferenze all'<html> (come farebbe l'app) prima del render della storia. */
function applyGlobals(g: Record<string, string>) {
  const root = document.documentElement;
  const theme = (g['theme'] ?? 'light') as Theme;
  const scheme = theme === 'dark' || theme === 'backoffice-dark' ? 'dark' : theme === 'system' ? null : 'light';
  if (scheme) root.setAttribute('data-theme', scheme);
  else root.removeAttribute('data-theme');
  const toggle = (attr: string, on: boolean, value: string) => (on ? root.setAttribute(attr, value) : root.removeAttribute(attr));
  toggle('data-motion', g['motion'] === 'reduce', 'reduce');
  toggle('data-transparency', g['transparency'] === 'reduce', 'reduce');
  toggle('data-contrast', g['contrast'] === 'more', 'more');
  return theme.startsWith('backoffice');
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Tema',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'Sistema (prefers-color-scheme)', icon: 'browser' },
          { value: 'backoffice', title: 'Backoffice', icon: 'sidebar' },
          { value: 'backoffice-dark', title: 'Backoffice dark', icon: 'sidebaralt' },
        ],
      },
    },
    motion: {
      description: 'prefers-reduced-motion',
      toolbar: {
        title: 'Motion',
        icon: 'play',
        dynamicTitle: true,
        items: [
          { value: 'auto', title: 'Motion: sistema' },
          { value: 'reduce', title: 'Reduced motion' },
        ],
      },
    },
    transparency: {
      description: 'prefers-reduced-transparency',
      toolbar: {
        title: 'Trasparenza',
        icon: 'contrast',
        dynamicTitle: true,
        items: [
          { value: 'auto', title: 'Trasparenza: sistema' },
          { value: 'reduce', title: 'Reduced transparency' },
        ],
      },
    },
    contrast: {
      description: 'prefers-contrast',
      toolbar: {
        title: 'Contrasto',
        icon: 'eye',
        dynamicTitle: true,
        items: [
          { value: 'auto', title: 'Contrasto: sistema' },
          { value: 'more', title: 'High contrast (more)' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light', motion: 'auto', transparency: 'auto', contrast: 'auto' },
  // L'ultimo decoratore è il più esterno: applica i globals prima che il wrapper legga `wrapperClass`.
  decorators: [
    componentWrapperDecorator((story) => `<div class="${wrapperClass}">${story}</div>`),
    (storyFn, ctx) => {
      const bo = applyGlobals(ctx.globals as Record<string, string>);
      wrapperClass = bo ? 'sb-story-root bo' : 'sb-story-root';
      return storyFn();
    },
    applicationConfig({ providers: [provideZonelessChangeDetection()] }),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    viewport: {
      options: {
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        desktop: { name: 'Desktop 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
      },
    },
    a11y: {
      // Le violazioni axe fanno fallire i test delle storie.
      test: 'error',
      // tutto il body dell'iframe: include gli overlay CDK (select, dialog, toast) montati fuori da #storybook-root
      context: 'body',
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } },
    },
    options: {
      storySort: { order: ['Introduzione', 'Foundations', 'Components', 'Patterns'] },
    },
  },
  tags: ['autodocs'],
};

export default preview;
