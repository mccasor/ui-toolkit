import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PHOSPHOR, PHOSPHOR_NAMES, type IconName, type IconWeight } from './phosphor';

/**
 * Icone SOLO per le storie, da Phosphor Icons (https://phosphoricons.com, MIT) — il set di ui-toolkit è fuori scope:
 * i componenti ricevono l'icona da fuori e ne controllano solo size e colore (`currentColor`).
 *
 * Peso: `bold` di default (a 20px il tratto è ≈ 1.9px, vicino ai 2px su griglia 24 del documento),
 * `regular` a 32px nelle empty state (≈ 2px, come lo stroke 1.75 su 24), `fill` per le icone piene (es. voce attiva).
 * Path rigenerati da `npm run icons`.
 */
@Component({
  selector: 'sb-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 256 256"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    @for (d of paths(); track $index) {
      <path [attr.d]="d" />
    }
  </svg>`,
  host: { style: 'display:inline-flex;flex:none' },
})
export class SbIcon {
  readonly name = input.required<IconName | string>();
  readonly size = input(20);
  readonly weight = input<IconWeight>('bold');
  protected readonly paths = computed(() => (PHOSPHOR[this.name() as IconName] ?? PHOSPHOR.info)[this.weight()]);
}

export const ICON_NAMES = Object.keys(PHOSPHOR_NAMES) as IconName[];

/** SVG grezzo (per slot che stilano direttamente `svg`, es. `[uiHeaderLogo]`). */
export function iconSvg(name: IconName, weight: IconWeight = 'fill', attrs = ''): string {
  return `<svg ${attrs} viewBox="0 0 256 256" fill="currentColor">${PHOSPHOR[name][weight].map((d) => `<path d="${d}"/>`).join('')}</svg>`;
}
