import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, effect, inject, input, computed } from '@angular/core';
import { injectUiLabels } from '../util/labels';

/**
 * Tab bar flottante in basso (0.75rem + safe-area), max 30rem, radius 1.5rem, glass strong + shadow-glass + shadow-float.
 * Contiene `a[uiTabBarItem]` (o `button`). Con il router: `routerLinkActive` + `ariaCurrentWhenActive="page"`.
 */
@Component({
  selector: 'ui-tab-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nav class="bar glass-strong" [attr.aria-label]="labelText()"><ng-content /></nav>`,
  host: { class: 'ui-tab-bar', '[class.ui-tab-bar--static]': '!fixed()' },
  styles: `
    :host {
      position: fixed;
      z-index: var(--ui-z-tab-bar);
      left: 50%;
      bottom: calc(0.75rem + env(safe-area-inset-bottom));
      transform: translateX(-50%);
      width: calc(100% - 1.5rem);
      max-width: 30rem;
      view-transition-name: ui-tab-bar;
    }
    :host(.ui-tab-bar--static) { position: relative; left: auto; bottom: auto; transform: none; margin-inline: auto; }
    .bar {
      display: flex;
      gap: 0.25rem;
      padding: 0.25rem;
      border-radius: var(--ui-radius-tab-bar);
      box-shadow: var(--ui-shadow-glass), var(--ui-shadow-float);
    }
  `,
})
export class TabBar {
  /** nome accessibile della navigazione */
  protected readonly uiLabels = injectUiLabels();
  readonly label = input<string>();
  protected readonly labelText = computed(() => this.label() ?? this.uiLabels().tabBar);
  /** false = in flusso (anteprime, storie) */
  readonly fixed = input(true, { transform: booleanAttribute });
}

/**
 * Voce della tab bar: colonna icona + label 0.6875rem/700 (0.75rem da 640px), min-height 3.5rem;
 * icona in una pill 3rem × 1.875rem che da attiva prende nav-active bg/fg; press scale(0.92).
 * Icona da fuori con `[uiTabIcon]`. Stato attivo da `active` o da `aria-current="page"`.
 */
@Component({
  selector: 'a[uiTabBarItem], button[uiTabBarItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pill" aria-hidden="true"><ng-content select="[uiTabIcon]" /></span>
    <span class="label"><ng-content /></span>
  `,
  host: { class: 'ui-tab-bar-item' },
  styles: `
    :host {
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.125rem;
      min-height: 3.5rem;
      padding: 0.25rem 0;
      border: 0;
      border-radius: calc(var(--ui-radius-tab-bar) - 0.25rem);
      background: transparent;
      color: var(--ui-text-muted);
      font: inherit;
      text-decoration: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform var(--ui-duration-micro) var(--ui-ease), color var(--ui-duration-micro) var(--ui-ease);
    }
    :host(:active) { transform: scale(var(--ui-tab-press-scale)); }
    :host([aria-current='page']) { color: var(--ui-text); }
    .pill {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 1.875rem;
      border-radius: var(--ui-radius-pill);
      transition: background-color var(--ui-duration-card) var(--ui-ease), color var(--ui-duration-card) var(--ui-ease);
    }
    .pill ::ng-deep svg { width: 20px; height: 20px; }
    :host([aria-current='page']) .pill { background: var(--ui-nav-active-bg); color: var(--ui-nav-active-fg); }
    @media (hover: hover) { :host(:hover:not([aria-current='page'])) { color: var(--ui-text); } }
    .label {
      max-width: 100%;
      font-size: var(--ui-font-size-micro);
      font-weight: 700;
      line-height: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media (min-width: 640px) { .label { font-size: var(--ui-font-size-xs); } }
  `,
})
export class TabBarItem {
  readonly active = input(false, { transform: booleanAttribute });

  constructor() {
    // tocca aria-current solo quando cambia `active`, così non interferisce con routerLinkActive
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let prev = false;
    effect(() => {
      const on = this.active();
      if (on) el.setAttribute('aria-current', 'page');
      else if (prev) el.removeAttribute('aria-current');
      prev = on;
    });
  }
}
