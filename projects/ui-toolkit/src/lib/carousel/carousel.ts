import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { uniqueId } from '../util/id';
import { prefersReducedMotion } from '../util/media';

/**
 * Carousel con scroll-snap orizzontale nativo. Le slide sono i figli diretti (qualsiasi elemento).
 * - `slideWidth` (default 85%), gap 0.75rem, frecce e pallini opzionali, tastiera sulla traccia (←/→, Home/End).
 * - `adaptiveHeight`: l'altezza segue la slide attiva, senza animazione (si animano solo transform e opacity).
 * - Swipe/scroll aggiornano `index`; impostare `index` scorre alla slide.
 */
@Component({
  selector: 'ui-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #track
      class="track"
      [id]="trackId"
      tabindex="0"
      [attr.aria-label]="trackLabel()"
      [style.--ui-slide-width]="slideWidth()"
      [style.height]="height()"
      (keydown)="onKeydown($event)"
      (scroll)="onScroll()"
    >
      <ng-content />
    </div>
    @if (arrows() || dots()) {
      <div class="controls">
        @if (arrows()) {
          <button type="button" class="ui-btn ui-btn--secondary ui-btn--icon ui-btn--sm" [attr.aria-controls]="trackId" [attr.aria-label]="prevLabel()" [disabled]="index() <= 0" (click)="goTo(index() - 1)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
        }
        @if (dots()) {
          <div class="dots" role="group" [attr.aria-label]="dotsLabel()">
            @for (d of dotList(); track $index) {
              <button type="button" class="dot" [attr.aria-label]="'Vai alla slide ' + ($index + 1)" [attr.aria-current]="$index === index() ? 'true' : null" [attr.aria-controls]="trackId" (click)="goTo($index)"></button>
            }
          </div>
        }
        @if (arrows()) {
          <button type="button" class="ui-btn ui-btn--secondary ui-btn--icon ui-btn--sm" [attr.aria-controls]="trackId" [attr.aria-label]="nextLabel()" [disabled]="index() >= count() - 1" (click)="goTo(index() + 1)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        }
      </div>
    }
  `,
  host: {
    class: 'ui-carousel',
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'label()',
  },
  styles: `
    :host { display: block; min-width: 0; }
    .track {
      position: relative;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: var(--ui-slide-width);
      gap: var(--ui-carousel-gap, 0.75rem);
      align-items: start;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      scrollbar-width: none;
      /* spazio per l'ombra delle card (non tagliata dall'overflow), compensato dal margine */
      padding-block: 0.25rem 1.25rem;
      margin-block: -0.25rem -1.25rem;
      box-sizing: content-box;
    }
    .track::-webkit-scrollbar { display: none; }
    .track:focus-visible { outline: 3px solid var(--ui-focus); outline-offset: -1px; border-radius: var(--ui-radius-card); }
    .track > ::ng-deep * { scroll-snap-align: start; scroll-snap-stop: always; min-width: 0; }
    .controls { position: relative; display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 0.75rem; }
    .dots { display: flex; gap: 0.25rem; }
    .dot {
      position: relative;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      border: 0;
      border-radius: var(--ui-radius-pill);
      background: transparent;
      cursor: pointer;
    }
    .dot::after {
      content: '';
      position: absolute;
      inset: 0;
      margin: auto;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: var(--ui-radius-pill);
      background: var(--ui-border-strong);
      /* la larghezza del pallino attivo cambia senza animazione: si anima solo il colore */
      transition: background-color var(--ui-duration-micro) var(--ui-ease);
    }
    .dot[aria-current='true']::after { width: 1.25rem; background: var(--ui-text); }
  `,
})
export class Carousel {
  /** nome accessibile della region */
  readonly label = input.required<string>();
  readonly slideWidth = input('85%');
  readonly arrows = input(false, { transform: booleanAttribute });
  readonly dots = input(false, { transform: booleanAttribute });
  readonly adaptiveHeight = input(false, { transform: booleanAttribute });
  /** imposta role/aria sulle slide (group "n di m"); disattivalo se le slide hanno già una semantica (es. tabpanel) */
  readonly decorateSlides = input(true, { transform: booleanAttribute });
  readonly index = model(0);
  readonly prevLabel = input('Slide precedente');
  readonly nextLabel = input('Slide successiva');
  readonly dotsLabel = input('Scegli la slide');
  readonly trackLabel = input<string | null>(null);

  protected readonly trackId = uniqueId('ui-carousel-track');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly count = signal(0);
  protected readonly height = signal<string | null>(null);
  protected readonly dotList = computed(() => Array.from({ length: this.count() }));
  private scrollFrame = 0;
  private settledIndex = -1;
  private resize?: ResizeObserver;

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const track = this.track().nativeElement;
      const refresh = () => {
        this.count.set(this.slides().length);
        this.decorate();
        this.observeHeight();
      };
      refresh();
      const mo = new MutationObserver(refresh);
      mo.observe(track, { childList: true });
      destroy.onDestroy(() => {
        mo.disconnect();
        this.resize?.disconnect();
        cancelAnimationFrame(this.scrollFrame);
      });
      this.goTo(this.index(), true);
    });

    // index impostato dall'esterno → scorri
    effect(() => {
      const i = this.index();
      untracked(() => {
        if (i !== this.settledIndex && this.count()) this.goTo(i);
        this.decorate();
        this.observeHeight();
      });
    });
  }

  private slides(): HTMLElement[] {
    return [...this.track().nativeElement.children] as HTMLElement[];
  }

  private decorate() {
    if (!this.decorateSlides()) return;
    const slides = this.slides();
    slides.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      // `data-label` sulla slide sostituisce l'etichetta di default "n di m"
      s.setAttribute('aria-label', s.dataset['label'] ?? `${i + 1} di ${slides.length}`);
    });
  }

  private observeHeight() {
    if (!this.adaptiveHeight()) return;
    this.resize?.disconnect();
    const active = this.slides()[this.index()];
    if (!active || typeof ResizeObserver === 'undefined') return;
    this.resize = new ResizeObserver(() => this.height.set(`${active.offsetHeight}px`));
    this.resize.observe(active);
    this.height.set(`${active.offsetHeight}px`);
  }

  /** Scorre alla slide i (clamp ai limiti). */
  goTo(i: number, instant = false) {
    const slides = this.slides();
    if (!slides.length) return;
    const target = Math.max(0, Math.min(slides.length - 1, i));
    const track = this.track().nativeElement;
    const left = slides[target].offsetLeft - (slides[0]?.offsetLeft ?? 0);
    track.scrollTo({ left, behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth' });
    this.settledIndex = target;
    if (this.index() !== target) this.index.set(target);
  }

  protected onScroll() {
    cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => {
      const track = this.track().nativeElement;
      const slides = this.slides();
      if (!slides.length) return;
      const origin = slides[0].offsetLeft;
      let best = 0;
      let dist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft - origin - track.scrollLeft);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      // a fine corsa l'ultima slide può non arrivare allo snap iniziale
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) best = slides.length - 1;
      if (best !== this.index()) {
        this.settledIndex = best;
        this.index.set(best);
      }
    });
  }

  protected onKeydown(e: KeyboardEvent) {
    if (e.target !== this.track().nativeElement) return;
    const map: Record<string, number> = { ArrowRight: this.index() + 1, ArrowLeft: this.index() - 1, Home: 0, End: this.count() - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    this.goTo(map[e.key]);
  }
}
