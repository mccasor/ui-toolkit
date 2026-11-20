import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Header di app: sticky, glass a tutta larghezza senza radius, solo bordo inferiore, ombra 0 8px 24px -18px.
 * Altezza 3.75rem: logo (tile 2.5rem radius 0.875rem con gradiente scuro) + titolo display 1.375rem UPPERCASE tracking 0.025em
 * + tagline 0.6875rem/700 UPPERCASE tracking 0.18em muted. Slot: `[uiHeaderLogo]`, `[uiHeaderActions]`.
 * Con `skipTo` rende lo skip link "Vai al contenuto" come primo elemento focusabile.
 */
@Component({
  selector: 'ui-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (skipTo()) {
      <a class="ui-skip-link" [href]="skipTo()">{{ skipLabel() }}</a>
    }
    <header class="bar glass">
      <div class="inner">
        @if (homeHref()) {
          <a class="brand" [href]="homeHref()" [attr.aria-label]="homeLabel() ?? null">
            <ng-container *ngTemplateOutlet="brand" />
          </a>
        } @else {
          <div class="brand"><ng-container *ngTemplateOutlet="brand" /></div>
        }
        <div class="actions"><ng-content select="[uiHeaderActions]" /></div>
      </div>
    </header>
    <ng-template #brand>
      <span class="logo" aria-hidden="true"><ng-content select="[uiHeaderLogo]" /></span>
      <span class="titles">
        <span class="title">{{ title() }}</span>
        @if (tagline()) {
          <span class="tagline">{{ tagline() }}</span>
        }
      </span>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
  host: { class: 'ui-header' },
  styles: `
    :host { display: block; position: sticky; top: 0; z-index: var(--ui-z-header); view-transition-name: ui-header; }
    .bar {
      border: 0;
      border-bottom: 1px solid var(--ui-glass-edge);
      border-radius: 0;
      box-shadow: var(--ui-shadow-header);
      padding-top: env(safe-area-inset-top);
    }
    .inner {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      /* 3.75rem complessivi, bordo inferiore compreso: --ui-sticky-top resta esatto */
      height: calc(var(--ui-header-height) - 1px);
      max-width: var(--ui-container-max);
      margin-inline: auto;
      padding-inline: var(--ui-page-padding-x);
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; min-width: 0; color: var(--ui-text); text-decoration: none; border-radius: var(--ui-radius-control); }
    .logo {
      display: grid;
      place-items: center;
      flex: none;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--ui-radius-control);
      background: linear-gradient(135deg, var(--ui-logo-tile-from), var(--ui-logo-tile-to));
      color: var(--ui-primary);
      overflow: hidden;
    }
    .logo ::ng-deep img, .logo ::ng-deep svg { width: 70%; height: 70%; object-fit: contain; }
    .titles { display: grid; min-width: 0; }
    .title {
      font-family: var(--ui-font-display);
      font-size: var(--ui-font-size-xl);
      font-weight: 700;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: var(--ui-tracking-h1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tagline {
      margin-top: 0.125rem;
      font-size: var(--ui-font-size-micro);
      font-weight: 700;
      line-height: 0.75rem;
      text-transform: uppercase;
      letter-spacing: var(--ui-tracking-tagline);
      color: var(--ui-text-muted);
      /* come in Torneo: va a capo (max 2 righe) invece di troncare */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .actions { display: flex; align-items: center; gap: 0.5rem; flex: none; }
  `,
})
export class Header {
  readonly title = input.required<string>();
  readonly tagline = input<string>();
  /** rende logo + titolo un link alla home */
  readonly homeHref = input<string>();
  readonly homeLabel = input<string>();
  /** destinazione dello skip link (es. "#main"); vuoto = nessuno skip link */
  readonly skipTo = input<string>();
  readonly skipLabel = input('Vai al contenuto');
}
