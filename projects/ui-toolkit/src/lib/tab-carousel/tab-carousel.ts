import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChildren, inject, input, model, viewChild } from '@angular/core';
import { Carousel } from '../carousel/carousel';
import { Segmented, type SegmentedOption } from '../segmented/segmented';
import { uniqueId } from '../util/id';

/** Pannello di un TabCarousel (`role="tabpanel"`, etichettato dal suo tab, `inert` se non attivo). */
@Component({
  selector: 'ui-tab-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'tabpanel',
    class: 'ui-tab-panel',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.inert]': 'active() ? null : ""',
    '[attr.tabindex]': 'active() ? 0 : null',
  },
  styles: `:host { display: block; min-width: 0; } :host(:focus-visible) { outline: 3px solid var(--ui-focus); outline-offset: -3px; border-radius: var(--ui-radius-card); }`,
})
export class TabPanel {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly id = uniqueId('ui-tab-panel');
  private readonly parent = inject(TabCarousel);
  protected readonly active = computed(() => this.parent.activeValue() === this.value());
  protected readonly labelledBy = computed(() => this.parent.tabIdFor(this.value()));
}

/**
 * TabCarousel = Segmented sopra un Carousel di pannelli a tutta larghezza; l'altezza si adatta al pannello attivo (200ms).
 * Selezione da tab o da swipe restano sincronizzate.
 */
@Component({
  selector: 'ui-tab-carousel',
  imports: [Segmented, Carousel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-segmented class="tabs" [options]="options()" [value]="activeValue()" (valueChange)="value.set($event)" [ariaLabel]="label()" [block]="block()" />
    <ui-carousel [label]="label()" slideWidth="100%" adaptiveHeight [decorateSlides]="false" [index]="activeIndex()" (indexChange)="onSwipe($event)">
      <ng-content />
    </ui-carousel>
  `,
  host: { class: 'ui-tab-carousel' },
  styles: `
    :host { display: grid; gap: 0.75rem; min-width: 0; }
    .tabs { justify-self: start; }
    :host(.ui-tab-carousel) .tabs.ui-segmented--block { justify-self: stretch; }
  `,
})
export class TabCarousel {
  /** nome accessibile di tablist e region */
  readonly label = input.required<string>();
  readonly value = model<string | null>(null);
  readonly block = input(false, { transform: booleanAttribute });

  private readonly panels = contentChildren(TabPanel);
  private readonly segmented = viewChild(Segmented);

  /** valore attivo (default: primo pannello) */
  readonly activeValue = computed(() => this.value() ?? this.panels()[0]?.value() ?? null);
  protected readonly activeIndex = computed(() => Math.max(0, this.panels().findIndex((p) => p.value() === this.activeValue())));
  protected readonly options = computed<SegmentedOption[]>(() => this.panels().map((p) => ({ value: p.value(), label: p.label(), controls: p.id })));

  tabIdFor(value: string): string | null {
    const i = this.panels().findIndex((p) => p.value() === value);
    return i < 0 ? null : (this.segmented()?.tabId(i) ?? null);
  }

  protected onSwipe(i: number) {
    const p = this.panels()[i];
    if (p && p.value() !== this.activeValue()) this.value.set(p.value());
  }
}
