/** tokens.ts → styles/tokens.css + styles/tailwind-preset.css */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildTailwindPreset, buildTokensCss } from '../projects/ui-toolkit/tokens/src/generate';

const styles = resolve(import.meta.dirname, '../projects/ui-toolkit/styles');
writeFileSync(resolve(styles, 'tokens.css'), buildTokensCss());
writeFileSync(resolve(styles, 'tailwind-preset.css'), buildTailwindPreset());
console.log('tokens.css e tailwind-preset.css generati in', styles);
