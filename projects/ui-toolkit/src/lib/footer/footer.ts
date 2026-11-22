import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { injectUiLabels } from '../util/labels';

export interface FooterLink {
  label: string;
  href: string;
}

/**
 * Footer: bordo superiore border, link 0.875rem/600 muted (target 44px), hover text + sottolineatura offset 4px, link separati dallo spazio (nessun separatore ·).
 * Contenuto libero (es. copyright) nello slot.
 */
@Component({
  selector: 'ui-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="inner">
      @if (links().length) {
        <nav [attr.aria-label]="labelText()">
          <ul>
            @for (l of links(); track l.href) {
              <li><a [href]="l.href">{{ l.label }}</a></li>
            }
          </ul>
        </nav>
      }
      <div class="note"><ng-content /></div>
    </footer>
  `,
  host: { class: 'ui-footer' },
  styles: `
    :host { display: block; border-top: 1px solid var(--ui-border); }
    .inner {
      box-sizing: border-box;
      max-width: var(--ui-container-max);
      margin-inline: auto;
      padding: 1rem var(--ui-page-padding-x);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem 1.5rem;
    }
    ul { display: flex; flex-wrap: wrap; align-items: center; gap: 0 1.25rem; margin: 0; padding: 0; list-style: none; }
    li { display: flex; align-items: center; }
    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--ui-touch-target);
      font-size: var(--ui-font-size-sm);
      font-weight: 600;
      color: var(--ui-text-muted);
      text-decoration: none;
      text-underline-offset: 4px;
      transition: color var(--ui-duration-micro) var(--ui-ease);
    }
    a:hover { color: var(--ui-text); text-decoration: underline; }
    .note { font-size: var(--ui-font-size-sm); color: var(--ui-text-muted); }
    .note:empty { display: none; }
  `,
})
export class Footer {
  readonly links = input<readonly FooterLink[]>([]);
  protected readonly uiLabels = injectUiLabels();
  readonly label = input<string>();
  protected readonly labelText = computed(() => this.label() ?? this.uiLabels().footer);
}
