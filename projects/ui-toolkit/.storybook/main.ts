import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts', '../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: ['@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs', 'storybook-addon-pseudo-states'],
  framework: { name: '@storybook/angular-vite', options: { tsconfig: resolve(import.meta.dirname, 'tsconfig.json') } },
  // Stili e font serviti così come verranno pubblicati (nessuna CDN).
  staticDirs: [{ from: '../styles', to: '/ui-toolkit/styles' }],
  docs: { defaultName: 'Docs' },
  // Le storie importano la libreria come la importerà un consumer.
  viteFinal: async (cfg) => {
    cfg.resolve ??= {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias as Record<string, string>),
      'ui-toolkit/tokens': resolve(import.meta.dirname, '../tokens/src/public-api.ts'),
      'ui-toolkit': resolve(import.meta.dirname, '../src/public-api.ts'),
    };
    // pre-bundle delle dipendenze caricate dai componenti, evita il reload a metà dei test
    cfg.optimizeDeps ??= {};
    cfg.optimizeDeps.include = [
      ...(cfg.optimizeDeps.include ?? []),
      '@angular/cdk/dialog',
      '@angular/cdk/overlay',
      '@angular/cdk/portal',
      '@angular/cdk/a11y',
      'rxjs',
      'chart.js/auto',
    ];
    return cfg;
  },
};
export default config;
