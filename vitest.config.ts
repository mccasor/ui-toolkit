import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const configDir = path.join(import.meta.dirname, 'projects/ui-toolkit/.storybook');

/**
 * - tokens: contrasti WCAG, CSS ≡ TS, helper colore, lint "nessun colore letterale" (Node).
 * - storybook: ogni storia renderizzata in Chromium headless con controllo axe (a11y: 'error') e play function.
 * I test unitari dei componenti girano con `ng test`.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'tokens',
          environment: 'node',
          include: ['projects/ui-toolkit/tokens/**/*.spec.ts', 'projects/ui-toolkit/lint/**/*.spec.ts'],
        },
      },
      {
        plugins: [storybookAngularVitest({ zoneless: true, tsConfig: 'projects/ui-toolkit/.storybook/tsconfig.json' }), storybookTest({ configDir })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
