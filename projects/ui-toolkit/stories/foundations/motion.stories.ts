import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { MOTION } from 'ui-toolkit/tokens';
import { FOUNDATION_STYLES } from './shared';

@Component({
  selector: 'fd-motion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd-page">
      <p class="fd-intro">
        Un'unica curva <span class="fd-code">--ui-ease: {{ m.ease }}</span> e durate brevi. Con reduced motion (toolbar) tutto va a 0.01ms, live dot e skeleton
        sono statici, niente view transition.
      </p>
      <div class="demos">
        <section class="glass fd-card demo" aria-labelledby="d-press">
          <h2 id="d-press" class="ui-card-title">Press bottone · 160ms</h2>
          <p class="ui-body-sm fd-muted">scale(0.97) su :active, colore 160ms</p>
          <button type="button" class="ui-btn ui-btn--primary">Premi</button>
        </section>

        <section class="glass fd-card demo" aria-labelledby="d-card">
          <h2 id="d-card" class="ui-card-title">Card interattiva · 200ms</h2>
          <p class="ui-body-sm fd-muted">hover translateY(-2px) + shadow-float, active scale(0.99)</p>
          <a href="#" class="lift glass" (click)="$event.preventDefault()">Passa sopra</a>
        </section>

        <section class="glass fd-card demo" aria-labelledby="d-dialog">
          <h2 id="d-dialog" class="ui-card-title">Dialog · 220ms</h2>
          <p class="ui-body-sm fd-muted">pop-in da opacity 0, translateY(8px) scale(0.98)</p>
          <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" (click)="replay('dialog')">Riproduci</button>
          <div class="stage">
            @for (k of [keys().dialog]; track k) {
              <div class="glass-strong mini anim-dialog">Dialog</div>
            }
          </div>
        </section>

        <section class="glass fd-card demo" aria-labelledby="d-sheet">
          <h2 id="d-sheet" class="ui-card-title">Bottom sheet · 260ms</h2>
          <p class="ui-body-sm fd-muted">slide-up da translateY(100%)</p>
          <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" (click)="replay('sheet')">Riproduci</button>
          <div class="stage clip">
            @for (k of [keys().sheet]; track k) {
              <div class="glass-strong sheet anim-sheet">Sheet</div>
            }
          </div>
        </section>

        <section class="glass fd-card demo" aria-labelledby="d-toast">
          <h2 id="d-toast" class="ui-card-title">Toast · 260ms</h2>
          <p class="ui-body-sm fd-muted">da opacity 0, translateY(-12px) scale(0.98)</p>
          <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" (click)="replay('toast')">Riproduci</button>
          <div class="stage">
            @for (k of [keys().toast]; track k) {
              <div class="glass-strong mini toast anim-toast">Salvato</div>
            }
          </div>
        </section>

        <section class="glass fd-card demo" aria-labelledby="d-loop">
          <h2 id="d-loop" class="ui-card-title">Loop</h2>
          <p class="ui-body-sm fd-muted">spinner 700ms lineare · live dot 1.4s · skeleton 1.4s</p>
          <div class="loops">
            <span class="ui-spinner" aria-hidden="true"></span>
            <span class="live"><span class="ui-live-dot" aria-hidden="true"></span> Live</span>
            <span class="ui-skeleton sk" aria-hidden="true"></span>
          </div>
        </section>

        <section class="glass fd-card demo" aria-labelledby="d-h">
          <h2 id="d-h" class="ui-card-title">Altezza carousel · 200ms</h2>
          <p class="ui-body-sm fd-muted">si adatta al pannello attivo</p>
          <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" (click)="tall.set(!tall())">Cambia pannello</button>
          <div class="grow" [style.height]="tall() ? '8rem' : '3rem'"></div>
        </section>
      </div>

      <section class="glass fd-card" aria-labelledby="dur-h">
        <h2 id="dur-h" class="ui-card-title fd-h2">Durate</h2>
        <dl class="kv">
          @for (d of durations; track d[0]) {
            <dt class="fd-code">--ui-duration-{{ d[0] }}</dt>
            <dd class="fd-code fd-muted">{{ d[1] }}</dd>
          }
        </dl>
      </section>
    </div>
  `,
  styles: [
    FOUNDATION_STYLES,
    `
      .demos { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); }
      .demo { display: grid; gap: 0.5rem; align-content: start; justify-items: start; }
      .demo h2, .demo p { margin: 0; }
      .stage { height: 5rem; width: 100%; display: grid; place-items: center; }
      .clip { overflow: hidden; align-items: end; border-radius: var(--ui-radius-tile); background: var(--ui-surface-sunken); }
      .mini { padding: 0.75rem 1.25rem; border-radius: var(--ui-radius-card); font-weight: 700; }
      .toast { border-radius: var(--ui-radius-toast); border-left: 4px solid var(--ui-success); box-shadow: var(--ui-shadow-float); }
      .sheet { width: 100%; padding: 1rem; border-radius: var(--ui-radius-card) var(--ui-radius-card) 0 0; font-weight: 700; text-align: center; box-sizing: border-box; }
      .anim-dialog { animation: ui-pop-in var(--ui-duration-dialog) var(--ui-ease) both; }
      .anim-sheet { animation: ui-sheet-up var(--ui-duration-sheet) var(--ui-ease) both; }
      .anim-toast { animation: ui-toast-in var(--ui-duration-toast) var(--ui-ease) both; }
      .lift {
        display: block; padding: 1rem; border-radius: var(--ui-radius-card); color: var(--ui-text); font-weight: 700; text-decoration: none;
        transition: transform var(--ui-duration-card) var(--ui-ease), box-shadow var(--ui-duration-card) var(--ui-ease);
      }
      .lift:hover { transform: translateY(var(--ui-card-lift)); box-shadow: var(--ui-shadow-float); }
      .lift:active { transform: scale(var(--ui-card-active-scale)); }
      .loops { display: flex; gap: 1.25rem; align-items: center; font-size: 1.25rem; }
      .live { display: inline-flex; gap: 0.5rem; align-items: center; font-size: var(--ui-font-size-xs); font-weight: 700; text-transform: uppercase; letter-spacing: var(--ui-tracking-live); color: var(--ui-danger-text); }
      .sk { width: 6rem; height: 1rem; }
      .grow { width: 100%; background: var(--ui-brand-soft); border-radius: var(--ui-radius-tile); transition: height var(--ui-duration-carousel-height) var(--ui-ease); }
      .kv { display: grid; grid-template-columns: max-content 1fr; gap: 0.375rem 1rem; margin: 0; font-size: var(--ui-font-size-sm); }
      .kv dd { margin: 0; }
    `,
  ],
})
class MotionPage {
  protected readonly m = MOTION;
  protected readonly durations = Object.entries(MOTION.duration).map(([k, v]) => [k.replace(/[A-Z]/g, (x) => '-' + x.toLowerCase()), v]);
  protected readonly keys = signal({ dialog: 0, sheet: 0, toast: 0 });
  protected readonly tall = signal(false);
  protected replay(k: 'dialog' | 'sheet' | 'toast') {
    this.keys.update((v) => ({ ...v, [k]: v[k] + 1 }));
  }
}

const meta: Meta = {
  title: 'Foundations/Motion',
  tags: ['!autodocs'],
  render: () => ({ template: `<fd-motion />`, moduleMetadata: { imports: [MotionPage] } }),
};
export default meta;

export const Animazioni: StoryObj = {};

export const ReducedMotion: StoryObj = {
  name: 'Animazioni (reduced motion)',
  globals: { motion: 'reduce' },
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector('.ui-spinner')!;
    const dur = getComputedStyle(spinner).animationDuration;
    await expect(parseFloat(dur)).toBeLessThan(0.001);
    const sk = canvasElement.querySelector('.ui-skeleton')!;
    await expect(getComputedStyle(sk).animationName).toBe('none');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cambia pannello' }));
  },
};
