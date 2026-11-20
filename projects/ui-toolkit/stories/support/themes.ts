import type { StoryObj } from '@storybook/angular-vite';

/** Una storia per tema (light, dark, backoffice, backoffice dark) con lo stesso render. */
export function themeStories<T>(render: StoryObj<T>['render'], extra: Partial<StoryObj<T>> = {}) {
  const mk = (name: string, theme: string): StoryObj<T> => ({ ...extra, name: `Tema: ${name}`, render, globals: { theme } });
  return {
    Light: mk('light', 'light'),
    Dark: mk('dark', 'dark'),
    Backoffice: mk('backoffice', 'backoffice'),
    BackofficeDark: mk('backoffice dark', 'backoffice-dark'),
  };
}
