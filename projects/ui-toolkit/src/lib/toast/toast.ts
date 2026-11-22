import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injectable, computed, inject, input, signal } from '@angular/core';
import { injectUiLabels } from '../util/labels';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  detail?: string;
  tone?: ToastTone;
  /** ms prima della chiusura automatica; 0 = resta finché non viene chiuso. Default 5000 (danger 8000). */
  duration?: number;
}

export interface Toast extends Required<Pick<ToastOptions, 'title' | 'tone'>> {
  id: number;
  detail?: string;
  duration: number;
}

/**
 * Notifiche. Richiede un `<ui-toast-region>` nel layout dell'app.
 * Il timer si mette in pausa con hover o focus sul toast (WCAG 2.2.1).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly timers = new Map<number, { handle?: ReturnType<typeof setTimeout>; remaining: number; started: number }>();
  private readonly list = signal<Toast[]>([]);
  readonly toasts = this.list.asReadonly();

  show(options: ToastOptions): number {
    const tone = options.tone ?? 'info';
    const toast: Toast = { id: ++this.seq, title: options.title, detail: options.detail, tone, duration: options.duration ?? (tone === 'danger' ? 8000 : 5000) };
    this.list.update((l) => [...l, toast]);
    if (toast.duration > 0) {
      this.timers.set(toast.id, { remaining: toast.duration, started: 0 });
      this.resume(toast.id);
    }
    return toast.id;
  }

  info(title: string, detail?: string) {
    return this.show({ title, detail, tone: 'info' });
  }
  success(title: string, detail?: string) {
    return this.show({ title, detail, tone: 'success' });
  }
  warning(title: string, detail?: string) {
    return this.show({ title, detail, tone: 'warning' });
  }
  error(title: string, detail?: string) {
    return this.show({ title, detail, tone: 'danger' });
  }

  dismiss(id: number) {
    const t = this.timers.get(id);
    if (t?.handle) clearTimeout(t.handle);
    this.timers.delete(id);
    this.list.update((l) => l.filter((x) => x.id !== id));
  }

  clear() {
    for (const t of this.list()) this.dismiss(t.id);
  }

  pause(id: number) {
    const t = this.timers.get(id);
    if (!t?.handle) return;
    clearTimeout(t.handle);
    t.handle = undefined;
    t.remaining -= Date.now() - t.started;
  }

  resume(id: number) {
    const t = this.timers.get(id);
    if (!t || t.handle) return;
    t.started = Date.now();
    t.handle = setTimeout(() => this.dismiss(id), Math.max(0, t.remaining));
  }
}

const ICONS: Record<ToastTone, string> = {
  info: 'M12 11v6M12 7.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  success: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l2.7 2.7L16 9.8',
  warning: 'M12 4l9 16H3zM12 10v4M12 17v.01',
  danger: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16.5v.01',
};

/**
 * Region dei toast: in alto sotto l'header, larghezza min(26rem, 100%), z-index toast.
 * Due live region sempre nel DOM: `assertive` per gli errori, `polite` per il resto.
 */
@Component({
  selector: 'ui-toast-region',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="live" aria-live="assertive" aria-relevant="additions text">
      @for (t of assertive(); track t.id) {
        <ng-container *ngTemplateOutlet="toastTpl; context: { $implicit: t }" />
      }
    </div>
    <div class="live" aria-live="polite" aria-relevant="additions text">
      @for (t of polite(); track t.id) {
        <ng-container *ngTemplateOutlet="toastTpl; context: { $implicit: t }" />
      }
    </div>

    <ng-template #toastTpl let-t>
      <div class="toast glass-strong" [attr.data-tone]="t.tone" (pointerenter)="svc.pause(t.id)" (pointerleave)="svc.resume(t.id)" (focusin)="svc.pause(t.id)" (focusout)="svc.resume(t.id)">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path [attr.d]="iconFor(t)" />
        </svg>
        <div class="text">
          <p class="title">{{ t.title }}</p>
          @if (t.detail) {
            <p class="detail">{{ t.detail }}</p>
          }
        </div>
        <button type="button" class="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm close" [attr.aria-label]="closeLabelText()" (click)="svc.dismiss(t.id)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
  host: { class: 'ui-toast-region', '[style.--ui-toast-top]': 'top() ?? null' },
  styles: `
    :host {
      position: fixed;
      z-index: var(--ui-z-toast);
      top: var(--ui-toast-top, calc(var(--ui-sticky-top) + 0.5rem));
      left: 50%;
      transform: translateX(-50%);
      width: min(26rem, calc(100% - 2rem));
      display: grid;
      gap: 0.5rem;
      pointer-events: none;
    }
    .live { display: grid; gap: 0.5rem; }
    .live:empty { display: none; }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 0.5rem 0.75rem 0.875rem;
      border-radius: var(--ui-radius-toast);
      box-shadow: var(--ui-shadow-float);
      color: var(--ui-text);
      animation: ui-toast-in var(--ui-duration-toast) var(--ui-ease) both;
    }
    .toast[data-tone='info'] { --tone: var(--ui-text); --tone-text: var(--ui-text); }
    .toast[data-tone='success'] { --tone: var(--ui-success); --tone-text: var(--ui-success-text); }
    .toast[data-tone='warning'] { --tone: var(--ui-warning); --tone-text: var(--ui-warning-text); }
    .toast[data-tone='danger'] { --tone: var(--ui-danger); --tone-text: var(--ui-danger-text); }
    .icon { flex: none; margin-top: 0.125rem; color: var(--tone-text); }
    .text { flex: 1; min-width: 0; }
    .title { margin: 0; font-weight: 600; line-height: 1.5rem; }
    .detail { margin: 0; font-size: var(--ui-font-size-sm); line-height: 1.25rem; color: var(--ui-text-muted); }
    .close { margin: -0.25rem 0; }
  `,
})
export class ToastRegion {
  protected readonly svc = inject(ToastService);
  /** override della posizione verticale (default: sotto l'header sticky) */
  readonly top = input<string>();
  protected readonly uiLabels = injectUiLabels();
  readonly closeLabel = input<string>();
  protected readonly closeLabelText = computed(() => this.closeLabel() ?? this.uiLabels().toastClose);
  protected iconFor(t: Toast) {
    return ICONS[t.tone];
  }
  protected readonly assertive = computed(() => this.svc.toasts().filter((t) => t.tone === 'danger'));
  protected readonly polite = computed(() => this.svc.toasts().filter((t) => t.tone !== 'danger'));
}
