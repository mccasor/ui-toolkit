import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

/**
 * Segnaposto di caricamento: shimmer 1.4s (statico con reduced motion). Sempre `aria-hidden`:
 * la regione che carica deve portare `aria-busy="true"`.
 * Variante text: `lines` righe, l'ultima al 60%.
 */
@Component({
  selector: 'ui-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'text') {
      @for (l of rows(); track $index) {
        <span class="ui-skeleton line" [style.width]="$last && rows().length > 1 ? '60%' : '100%'"></span>
      }
    } @else {
      <span class="ui-skeleton block" [class.circle]="variant() === 'circle'"></span>
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[attr.data-variant]': 'variant()',
    '[style.width]': 'width() ?? null',
    '[style.height]': "variant() === 'text' ? null : (height() ?? width() ?? null)",
  },
  styles: `
    :host { display: grid; gap: 0.5rem; }
    :host([data-variant='rect']) { width: 100%; height: 6rem; }
    :host([data-variant='circle']) { width: 2.5rem; height: 2.5rem; }
    .line { height: 0.875rem; }
    .block { width: 100%; height: 100%; border-radius: var(--ui-radius-tile); }
    .circle { border-radius: var(--ui-radius-pill); }
  `,
})
export class Skeleton {
  readonly variant = input<SkeletonVariant>('text');
  readonly lines = input(1, { transform: numberAttribute });
  /** Larghezza CSS (es. `12rem`, `60%`). */
  readonly width = input<string>();
  /** Altezza CSS (rect/circle). */
  readonly height = input<string>();
  protected readonly rows = computed(() => Array.from({ length: Math.max(1, this.lines()) }));
}
