import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { Button, Field, FieldInput, GlassCard, Header, Segmented } from 'ui-toolkit';
import { SbIcon } from '../support/icon';

/** Gli stessi blocchi della landing di Torneo (c85.it) ricostruiti con ui-toolkit, per il confronto visivo. */
@Component({
  selector: 'pt-confronto',
  imports: [Header, Segmented, Button, Field, FieldInput, GlassCard, SbIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-header title="C85" tagline="Football tournaments">
      <span uiHeaderLogo style="font-family:var(--ui-font-display);font-weight:700;font-size:.9rem">85</span>
      <div uiHeaderActions style="display:flex;gap:.25rem;align-items:center">
        <ui-segmented [options]="lang" [(value)]="l" ariaLabel="Lingua" />
        <button uiButton variant="ghost" iconOnly aria-label="Tema scuro"><sb-icon name="settings" /></button>
      </div>
    </ui-header>
    <main class="ui-container" style="display:grid;gap:1.5rem">
      <ui-glass-card variant="strong" padding="lg">
        <form style="display:grid;gap:1rem" (submit)="$event.preventDefault()">
          <ui-field label="Email" required><input uiInput type="email" placeholder="name@example.com" /></ui-field>
          <ui-field label="Password" required><input uiInput type="password" /></ui-field>
          <button uiButton variant="primary" size="lg" block type="submit">Sign in</button>
        </form>
      </ui-glass-card>
      <ui-glass-card variant="brand" padding="lg">
        <div style="display:flex;align-items:center;gap:.75rem">
          <span style="display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:var(--ui-radius-tile);background:var(--ui-primary);color:var(--ui-on-primary)"><sb-icon name="check" /></span>
          <h2 class="ui-h2-display" style="margin:0;font-size:1.5rem">Organisers</h2>
        </div>
        <p class="ui-body text-muted">The back office to run the tournament from start to finish.</p>
      </ui-glass-card>
    </main>
  `,
})
class Confronto {
  protected readonly lang = [
    { value: 'it', label: 'IT' },
    { value: 'en', label: 'EN' },
  ];
  protected readonly l = signal('en');
}

const meta: Meta = {
  title: 'Patterns/Confronto Torneo',
  decorators: [moduleMetadata({ imports: [Confronto] })],
  render: () => ({ template: `<pt-confronto />` }),
  parameters: { fullBleed: true, docs: { description: { component: 'Blocchi della landing di Torneo (c85.it) ricostruiti con ui-toolkit per il confronto visivo.' } } },
  tags: ['!autodocs'],
};
export default meta;
export const Mobile: StoryObj = { globals: { viewport: { value: 'mobile', isRotated: false } } };
