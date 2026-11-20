import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Button,
  ColorSwatches,
  DialogActions,
  DialogRef,
  DialogService,
  DialogShell,
  EmptyState,
  Field,
  FieldInput,
  GlassCard,
  ImageInput,
  Segmented,
  Select,
  StickyBar,
  TabCarousel,
  TabPanel,
  Table,
  TableCell,
  TeamLogo,
  ToastRegion,
  ToastService,
} from 'ui-toolkit';
import { SbIcon } from '../support/icon';
import { MatchCard, PatternShell } from './shell';
import { CLASSIFICA, COLONNE_CLASSIFICA, GIRONI, PARTITE } from './data';

/* ---------------------------------------------- Pagina con card e segmented sticky */

@Component({
  selector: 'pt-partite',
  imports: [PatternShell, MatchCard, StickyBar, Segmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pt-shell active="partite">
      <h1 class="ui-h1" style="margin:0 0 1rem">Partite</h1>
      <ui-sticky-bar surface style="margin-bottom:1rem;justify-self:start;width:fit-content">
        <ui-segmented [options]="gironi" [(value)]="girone" ariaLabel="Girone" />
      </ui-sticky-bar>
      <div class="list">
        @for (m of lista(); track m.id) { <pt-match-card [m]="m" /> }
      </div>
    </pt-shell>
  `,
  styles: `.list { display: grid; gap: 0.75rem; } @media (min-width: 1024px) { .list { grid-template-columns: repeat(2, 1fr); } }`,
})
class PartitePage {
  protected readonly gironi = [{ value: 'tutti', label: 'Tutti' }, ...['A', 'B', 'C'].map((g) => ({ value: g, label: `Girone ${g}` }))];
  protected readonly girone = signal('tutti');
  /** lista lunga per mostrare la barra che si ferma sotto l'header */
  protected readonly lista = computed(() => {
    const all = [...PARTITE, ...PARTITE.map((p) => ({ ...p, id: p.id + 'b' })), ...PARTITE.map((p) => ({ ...p, id: p.id + 'c' }))];
    return this.girone() === 'tutti' ? all : all.filter((p) => p.girone === this.girone());
  });
}

/* ----------------------------------------------------------- Tabella responsive */

@Component({
  selector: 'pt-classifica',
  imports: [PatternShell, GlassCard, Table, TableCell, TeamLogo, TabCarousel, TabPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pt-shell active="classifica">
      <h1 class="ui-h1" style="margin:0 0 1rem">Classifica</h1>
      <ui-tab-carousel label="Gironi">
        @for (g of gironi; track g) {
          <ui-tab-panel [value]="g" [label]="'Girone ' + g">
            <ui-glass-card padding="sm">
              <ui-table [caption]="'Classifica girone ' + g" [columns]="cols" [rows]="data[g]" rowKey="id" stack [rowLink]="link">
                <ng-template uiCell="squadra" let-row>
                  <span style="display:inline-flex;align-items:center;gap:.5rem">
                    <ui-team-logo [name]="row.squadra" [color]="row.colore" size="xs" decorative />{{ row.squadra }}
                  </span>
                </ng-template>
              </ui-table>
            </ui-glass-card>
          </ui-tab-panel>
        }
      </ui-tab-carousel>
    </pt-shell>
  `,
})
class ClassificaPage {
  protected readonly gironi = ['A', 'B'];
  protected readonly data = CLASSIFICA;
  protected readonly cols = COLONNE_CLASSIFICA;
  protected readonly link = (r: { id: string }) => `#squadra-${r.id}`;
}

/* ----------------------------------------------------------------- Form in dialog */

@Component({
  selector: 'pt-team-dialog',
  imports: [DialogShell, DialogActions, Button, Field, FieldInput, Select, ColorSwatches, ImageInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-dialog title="Nuova squadra" description="Compare in classifica e nel calendario del girone scelto.">
      <form id="team" class="form" (submit)="$event.preventDefault(); salva()" novalidate>
        <ui-field label="Nome squadra" required [error]="tentato() && !nome() ? 'Inserisci il nome della squadra' : null">
          <input uiInput autocomplete="off" [value]="nome()" (input)="nome.set($any($event.target).value)" />
        </ui-field>
        <ui-field label="Girone"><ui-select [options]="gironi" [(value)]="girone" /></ui-field>
        <ui-color-swatches label="Colore" [(value)]="colore" />
        <ui-image-input label="Logo" shape="square" [name]="nome() || 'Nuova squadra'" />
      </form>
      <div uiDialogActions>
        <button uiButton variant="secondary" (click)="ref.close()">Annulla</button>
        <button uiButton variant="primary" type="submit" form="team">Crea squadra</button>
      </div>
    </ui-dialog>
  `,
  styles: `.form { display: grid; gap: 1rem; }`,
})
class TeamDialog {
  protected readonly ref = inject<DialogRef<string>>(DialogRef);
  protected readonly gironi = GIRONI;
  protected readonly nome = signal('');
  protected readonly girone = signal<string | null>('A');
  protected readonly colore = signal<string | null>(null);
  protected readonly tentato = signal(false);
  protected salva() {
    this.tentato.set(true);
    if (this.nome().trim()) this.ref.close(this.nome().trim());
  }
}

@Component({
  selector: 'pt-squadre',
  imports: [PatternShell, GlassCard, EmptyState, Button, SbIcon, ToastRegion, TeamLogo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-toast-region />
    <pt-shell active="squadre">
      <div class="head">
        <h1 class="ui-h1" style="margin:0">Squadre</h1>
        @if (squadre().length) {
          <button uiButton variant="primary" (click)="nuova()"><sb-icon name="plus" /> Nuova</button>
        }
      </div>
      @if (squadre().length) {
        <ul class="list">
          @for (s of squadre(); track s) {
            <li><ui-glass-card padding="sm"><span class="row"><ui-team-logo [name]="s" size="md" decorative /><strong>{{ s }}</strong></span></ui-glass-card></li>
          }
        </ul>
      } @else {
        <ui-glass-card>
          <ui-empty-state title="Nessuna squadra iscritta" description="Crea la prima squadra o condividi il link d'iscrizione: le squadre compariranno qui." [headingLevel]="2">
            <sb-icon uiEmptyIcon name="users" [size]="32" [stroke]="1.75" />
            <div uiEmptyActions>
              <button uiButton variant="primary" (click)="nuova()"><sb-icon name="plus" /> Crea squadra</button>
              <button uiButton variant="ghost">Copia link d'iscrizione</button>
            </div>
          </ui-empty-state>
        </ui-glass-card>
      }
    </pt-shell>
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
    .row { display: flex; align-items: center; gap: 0.75rem; }
  `,
})
class SquadrePage {
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);
  protected readonly squadre = signal<string[]>([]);
  nuova() {
    this.dialog.open<string>(TeamDialog).closed.subscribe((nome) => {
      if (!nome) return;
      this.squadre.update((l) => [...l, nome]);
      this.toast.success('Squadra creata', `${nome} è stata aggiunta al torneo`);
    });
  }
  ngOnDestroy() {
    this.toast.clear();
  }
}

const meta: Meta = {
  title: 'Patterns/Pagine',
  decorators: [moduleMetadata({ imports: [PartitePage, ClassificaPage, SquadrePage] })],
  parameters: { fullBleed: true },
  tags: ['!autodocs'],
};
export default meta;
type Story = StoryObj;

export const CardESegmentedSticky: Story = {
  name: 'Pagina con card e segmented sticky',
  render: () => ({ template: `<pt-partite />` }),
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('tab', { name: 'Girone B' }));
    await expect(canvasElement.querySelectorAll('pt-match-card')).toHaveLength(6);
    window.scrollTo(0, 600);
    await waitFor(() => {
      const bar = canvasElement.querySelector('ui-sticky-bar')!.getBoundingClientRect();
      const header = canvasElement.querySelector('ui-header')!.getBoundingClientRect();
      return expect(Math.round(bar.top)).toBe(Math.round(header.bottom + 8));
    });
    window.scrollTo(0, 0);
  },
};

export const TabellaResponsive: Story = {
  name: 'Tabella responsive',
  render: () => ({ template: `<pt-classifica />` }),
  globals: { viewport: { value: 'mobile', isRotated: false } },
};
export const TabellaResponsiveDesktop: Story = {
  name: 'Tabella responsive (desktop)',
  render: () => ({ template: `<pt-classifica />` }),
};

export const EmptyStateConCta: Story = {
  name: 'Empty state con CTA',
  render: () => ({ template: `<pt-squadre />` }),
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

export const FormInDialog: Story = {
  name: 'Form in dialog',
  render: () => ({ template: `<pt-squadre />` }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(c.getByRole('button', { name: 'Crea squadra' }));
    const dialog = await body.findByRole('dialog', { name: 'Nuova squadra' });
    // invio senza nome → errore nel Field
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crea squadra' }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent('Inserisci il nome');
    await userEvent.type(within(dialog).getByRole('textbox', { name: /Nome squadra/ }), 'Lupi del Borgo');
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Verde' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crea squadra' }));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await expect(await c.findByText('Lupi del Borgo')).toBeInTheDocument();
    await waitFor(() => expect(canvasElement.querySelector('[aria-live=polite]')).toHaveTextContent('Squadra creata'));
  },
};
