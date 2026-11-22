import { ChangeDetectionStrategy, Component, Directive, booleanAttribute, computed, inject, input, linkedSignal, output, resource } from '@angular/core';
import { avatarColors, initials } from 'ui-toolkit/tokens';
import { UI_IMAGE_RESOLVER } from '../util/image-resolver';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** xs 1.5 · sm 2 · md 2.5 · lg 3.5 · xl 5rem */
export const AVATAR_SIZES: Record<AvatarSize, string> = { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3.5rem', xl: '5rem' };

@Directive()
abstract class AvatarBase {
  /** nome della persona/squadra: iniziali, colore di fallback e nome accessibile */
  readonly name = input.required<string>();
  readonly src = input<string | null>();
  /** colore scelto dall'utente: il testo usa onColor; senza colore, palette fallback da hash del nome */
  readonly color = input<string | null>();
  readonly size = input<AvatarSize>('md');
  /** decorativo: nascosto alle tecnologie assistive (es. accanto al nome già scritto) */
  readonly decorative = input(false, { transform: booleanAttribute });

  /** emesso quando l'immagine non si carica (si vedono le iniziali) */
  readonly imageError = output<void>();

  private readonly resolver = inject(UI_IMAGE_RESOLVER, { optional: true });
  /** legge l'immagine di una `src` gestita dal resolver dell'app, se non è già in cache */
  private readonly resolved = resource({
    params: () => {
      const src = this.src();
      return src && this.resolver?.handles(src) && this.resolver.peek(src) === undefined ? src : undefined;
    },
    loader: ({ params }) => this.resolver!.resolve(params),
  });
  /** cosa mostra l'<img>: `src`, o l'immagine risolta dall'app ('' finché non arriva) */
  protected readonly imageSrc = computed(() => {
    const src = this.src();
    if (!src) return '';
    if (!this.resolver?.handles(src)) return src;
    this.resolved.status();
    return this.resolver.peek(src) ?? '';
  });
  /** si azzera a ogni nuova sorgente: un URL nuovo si ritenta */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly showImage = computed(() => !!this.imageSrc() && !this.failed());

  protected onImageError(): void {
    this.failed.set(true);
    this.imageError.emit();
  }
  protected readonly colors = computed(() => avatarColors(this.name(), this.color()));
  protected readonly letters = computed(() => initials(this.name()));
  protected readonly dimension = computed(() => AVATAR_SIZES[this.size()]);

}

const TEMPLATE = `
  @if (showImage()) {
    <img [src]="imageSrc()" alt="" (error)="onImageError()" />
  } @else {
    <span class="initials" aria-hidden="true">{{ letters() }}</span>
  }
`;

const HOST = {
  '[attr.role]': 'decorative() ? null : "img"',
  '[attr.aria-label]': 'decorative() ? null : name()',
  '[attr.aria-hidden]': 'decorative() ? "true" : null',
  '[style.--ui-avatar-size]': 'dimension()',
  '[style.--ui-avatar-fill]': 'showImage() ? null : colors().fill',
  '[style.--ui-avatar-on]': 'colors().on',
};

const STYLES = `
  :host {
    display: inline-grid;
    place-items: center;
    flex: none;
    box-sizing: border-box;
    width: var(--ui-avatar-size);
    height: var(--ui-avatar-size);
    overflow: hidden;
    vertical-align: middle;
    background: var(--ui-avatar-fill, transparent);
    color: var(--ui-avatar-on, var(--ui-text));
  }
  .initials {
    font-family: var(--ui-font-display);
    font-weight: 700;
    font-size: calc(var(--ui-avatar-size) * 0.38);
    line-height: 1;
    letter-spacing: var(--ui-tracking-numeric);
    user-select: none;
  }
  img { width: 100%; height: 100%; display: block; }
`;

/** Avatar persona: cerchio; immagine con fallback a iniziali (max 2, display 700, size × 0.38). */
@Component({
  selector: 'ui-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
  host: { ...HOST, class: 'ui-avatar' },
  styles: [STYLES, `:host { border-radius: var(--ui-radius-pill); } img { object-fit: cover; }`],
})
export class Avatar extends AvatarBase {}

/** Logo squadra: quadrato radius 28% su tile glass, `object-fit: contain`; fallback a iniziali come Avatar. */
@Component({
  selector: 'ui-team-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
  host: { ...HOST, class: 'ui-team-logo', '[class.glass]': 'showImage()' },
  styles: [STYLES, `:host { border-radius: var(--ui-radius-logo); } :host(.glass) { box-shadow: none; } img { object-fit: contain; padding: 12%; box-sizing: border-box; }`],
})
export class TeamLogo extends AvatarBase {}
