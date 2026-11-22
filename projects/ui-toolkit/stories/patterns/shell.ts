import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Avatar, Badge, Button, Footer, GlassCard, Header, TabBar, TabBarItem, TeamLogo } from 'ui-toolkit';
import { SbIcon, iconSvg } from '../support/icon';
import type { Partita } from './data';

/** Shell comune: header (con skip link) + main + footer + tab bar flottante. */
@Component({
  selector: 'pt-shell',
  imports: [Header, TabBar, TabBarItem, Footer, Button, SbIcon, Avatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-header title="Torneo C85" tagline="Calcio a 5, Bergamo" homeHref="#home" skipTo="#main">
      ${iconSvg('trophy', 'fill', 'uiHeaderLogo')}
      <div uiHeaderActions>
        <button uiButton variant="ghost" iconOnly aria-label="Cerca"><sb-icon name="search" /></button>
        <ui-avatar name="Mario Rossi" size="sm" />
      </div>
    </ui-header>
    <main id="main" class="ui-container ui-container--tabbar" tabindex="-1">
      <ng-content />
    </main>
    <ui-footer [links]="links">© 2026 Torneo C85</ui-footer>
    <ui-tab-bar>
      @for (t of tabs; track t.id) {
        <a uiTabBarItem [href]="'#' + t.id" [active]="active() === t.id"><sb-icon uiTabIcon [name]="t.icon" [weight]="active() === t.id ? 'fill' : 'bold'" />{{ t.label }}</a>
      }
    </ui-tab-bar>
  `,
  styles: `main:focus { outline: none; } :host { display: block; min-height: 100dvh; }`,
})
export class PatternShell {
  readonly active = input('home');
  protected readonly tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'partite', label: 'Partite', icon: 'calendar' },
    { id: 'classifica', label: 'Classifica', icon: 'trophy' },
    { id: 'squadre', label: 'Squadre', icon: 'users' },
  ];
  protected readonly links = [
    { label: 'Regolamento', href: '#regolamento' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Contatti', href: '#contatti' },
  ];
}

/** Card partita (riusata dai pattern). */
@Component({
  selector: 'pt-match-card',
  imports: [GlassCard, Badge, TeamLogo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a uiGlassCard interactive [variant]="m().stato === 'live' ? 'brand' : 'default'" [href]="'#' + m().id" class="card">
      <div class="top">
        <span class="ui-meta">{{ m().campo }}, {{ m().ora }}</span>
        @switch (m().stato) {
          @case ('live') { <ui-badge tone="live">Live</ui-badge> }
          @case ('finita') { <ui-badge>Finita</ui-badge> }
          @default { <ui-badge tone="warning">Girone {{ m().girone }}</ui-badge> }
        }
      </div>
      <div class="teams">
        <div class="team"><ui-team-logo [name]="m().casa" [color]="m().coloreCasa" size="sm" decorative /><span>{{ m().casa }}</span></div>
        <span class="score font-numeric" [attr.aria-label]="score()">{{ m().gc ?? '–' }} : {{ m().go ?? '–' }}</span>
        <div class="team away"><span>{{ m().ospiti }}</span><ui-team-logo [name]="m().ospiti" [color]="m().coloreOspiti" size="sm" decorative /></div>
      </div>
    </a>
  `,
  styles: `
    .card { display: grid; gap: 0.75rem; }
    .top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .teams { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.75rem; }
    .team { display: flex; align-items: center; gap: 0.5rem; min-width: 0; font-weight: 700; font-size: var(--ui-font-size-sm); }
    .team span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .away { justify-content: flex-end; text-align: end; }
    .score { font-size: var(--ui-font-size-3xl); line-height: 1; }
  `,
})
export class MatchCard {
  readonly m = input.required<Partita>();
  protected readonly score = computed(() =>
    this.m().gc === null ? 'Non iniziata' : `${this.m().casa} ${this.m().gc}, ${this.m().ospiti} ${this.m().go}`,
  );
}

