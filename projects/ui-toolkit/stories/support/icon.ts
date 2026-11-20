import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Icone SOLO per le storie: il set di ui-toolkit è fuori scope. Griglia 24×24, stroke currentColor 2px,
 * cap/join round (stile Lucide). I componenti ricevono l'icona da fuori e ne controllano solo size e colore.
 */
const PATHS: Record<string, string> = {
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  trash: 'M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13',
  alert: 'M12 8v5M12 16.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  info: 'M12 11v6M12 7.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7',
  calendar: 'M5 6h14v14H5zM5 10h14M9 3.5V7M15 3.5V7',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a5 5 0 0 1 3 6',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2.5v3M12 18.5v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  goal: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7l4 3-1.5 4.5h-5L8 10z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6v.01M4 12v.01M4 18v.01',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  inbox: 'M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5',
};

@Component({
  selector: 'sb-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    [attr.stroke-width]="stroke()"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path [attr.d]="d()" />
  </svg>`,
  host: { style: 'display:inline-flex;flex:none' },
})
export class SbIcon {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly stroke = input(2);
  protected readonly d = computed(() => PATHS[this.name()] ?? PATHS['info']);
}

export const ICON_NAMES = Object.keys(PATHS);
