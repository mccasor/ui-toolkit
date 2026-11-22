import { ChangeDetectionStrategy, Component, InjectionToken, Provider, computed, inject, input, isDevMode } from '@angular/core';
import { BUILTIN_ICONS } from './icons.generated';

/** Path `d` di un'icona su viewBox 256×256 (riempiti con `currentColor`). */
export type IconPaths = readonly string[];
/** Nomi delle icone incluse (Phosphor regular). */
export type BuiltinIconName = keyof typeof BUILTIN_ICONS;

/** Registri di icone forniti dall'app (multi): sommati a quelle incluse, che possono sostituire. */
export const UI_ICONS = new InjectionToken<readonly Record<string, IconPaths>[]>('UI_ICONS');

/** Registra icone di dominio (es. cartellini): `providers: [provideIcons({ 'yellow-card': ['M…'] })]`. */
export function provideIcons(icons: Record<string, IconPaths>): Provider {
  return { provide: UI_ICONS, useValue: icons, multi: true };
}

/**
 * Icona SVG inline. Set incluso: Phosphor regular (https://phosphoricons.com, MIT), nomi semantici
 * (`BuiltinIconName`), rigenerato da `npm run icons`; altre icone con `provideIcons()`.
 * Decorativa di default (`aria-hidden`); con `label` diventa `role="img"`. Eredita `currentColor`.
 */
@Component({
  selector: 'ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ui-icon', style: 'display:inline-flex;flex:none;align-items:center;justify-content:center' },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<BuiltinIconName | (string & {})>();
  readonly size = input(20);
  /** Nome accessibile; ometterlo per le icone decorative. */
  readonly label = input<string | undefined>(undefined);

  private readonly registry: Record<string, IconPaths> = Object.assign(
    {},
    BUILTIN_ICONS,
    ...(inject(UI_ICONS, { optional: true }) ?? []),
  );

  protected readonly paths = computed<IconPaths>(() => {
    const p = this.registry[this.name()];
    if (!p && isDevMode()) console.warn(`[ui-icon] Icona sconosciuta: "${this.name()}".`);
    return p ?? [];
  });
}
