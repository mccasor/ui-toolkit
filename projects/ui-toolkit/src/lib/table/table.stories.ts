import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { themeStories } from '../../../stories/support/themes';
import { Badge } from '../badge/badge';
import { GlassCard } from '../glass-card/glass-card';
import { Table, TableCell, type TableColumn } from './table';

interface Riga {
  id: string;
  pos: number;
  squadra: string;
  g: number;
  v: number;
  n: number;
  p: number;
  dr: number;
  pt: number;
  forma: string;
}

const RIGHE: Riga[] = [
  { id: 'leoni', pos: 1, squadra: 'Leoni di Quartiere', g: 6, v: 4, n: 0, p: 2, dr: 7, pt: 12, forma: 'VVPV' },
  { id: 'falchi', pos: 2, squadra: 'Falchi', g: 6, v: 3, n: 0, p: 3, dr: 2, pt: 9, forma: 'PVVP' },
  { id: 'aquile', pos: 3, squadra: 'Aquile Città', g: 6, v: 2, n: 1, p: 3, dr: -1, pt: 7, forma: 'NPVP' },
  { id: 'sanmarco', pos: 4, squadra: 'Polisportiva San Marco Vecchio', g: 6, v: 1, n: 1, p: 4, dr: -8, pt: 4, forma: 'PPNP' },
];

const COLONNE: TableColumn<Riga>[] = [
  { key: 'pos', label: '#', numeric: true, align: 'start', width: '3rem', leading: true },
  { key: 'squadra', label: 'Squadra', primary: true },
  { key: 'g', label: 'G', numeric: true },
  { key: 'v', label: 'V', numeric: true },
  { key: 'n', label: 'N', numeric: true },
  { key: 'p', label: 'P', numeric: true },
  { key: 'dr', label: 'DR', numeric: true, value: (r) => (r.dr > 0 ? `+${r.dr}` : r.dr) },
  { key: 'pt', label: 'Punti', numeric: true },
];

type Args = { stack: boolean; captionVisible: boolean; linked: boolean };

const meta: Meta<Args> = {
  title: 'Components/Table',
  component: Table,
  subcomponents: { TableCell },
  decorators: [moduleMetadata({ imports: [Table, TableCell, GlassCard, Badge] })],
  args: { stack: true, captionVisible: true, linked: true },
  render: (args) => ({
    props: { ...args, rows: RIGHE, cols: COLONNE, link: (r: Riga) => `#squadra-${r.id}` },
    template: `<ui-glass-card padding="md">
      <ui-table caption="Classifica girone A" [captionVisible]="captionVisible" [columns]="cols" [rows]="rows" rowKey="id" [stack]="stack" [rowLink]="linked ? link : undefined" />
    </ui-glass-card>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `\`columns\`, \`rows\`, \`caption\` (sr-only di default), \`stack\`, \`rowKey\`, \`rowLink\`, template di cella \`<ng-template uiCell="chiave" let-row let-value="value">\`.

- **≥ 640px**: tabella vera; header 0.75rem UPPERCASE muted (tracking 0.06em), celle padding 0.75rem, divisori border, hover surface-sunken. Numeri in font-numeric.
- **< 640px con \`stack\`**: ogni riga una card a griglia 2 colonne con label da \`data-label\`, cella primaria a tutta larghezza.
- **< 640px senza \`stack\`**: righe compatte su una linea, cella primaria troncata.
- **Backoffice**: header sticky su surface-alt, zebra, hover row-hover, celle dense.

**Accessibilità** — \`caption\` obbligatoria, \`th scope="col"\` e cella primaria \`th scope="row"\`; ruoli espliciti per conservare la semantica quando il
layout cambia sotto 640px. Riga navigabile = un solo link (sulla cella primaria) esteso con \`::after\` a tutta la riga: un solo tab stop per riga.
Il contenitore scorrevole è una region focusabile etichettata dalla caption.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const table = c.getByRole('table', { name: 'Classifica girone A' });
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(8);
    await expect(within(table).getAllByRole('rowheader')[0]).toHaveTextContent('Leoni di Quartiere');
    await expect(within(table).getAllByRole('link')).toHaveLength(4);
  },
};
export const NotLinked: Story = { name: 'Senza link di riga', args: { linked: false } };

export const CustomCells: Story = {
  name: 'Template di cella',
  render: () => ({
    props: { rows: RIGHE, cols: [...COLONNE.slice(0, 2), { key: 'forma', label: 'Forma' }, COLONNE[7]] },
    template: `<ui-glass-card>
      <ui-table caption="Classifica con forma" [columns]="cols" [rows]="rows" rowKey="id" stack>
        <ng-template uiCell="forma" let-value="value">
          <span style="display:inline-flex;gap:.25rem">
            @for (f of $any(value).split(''); track $index) {
              <ui-badge [tone]="f === 'V' ? 'success' : f === 'P' ? 'danger' : 'neutral'">{{ f }}</ui-badge>
            }
          </span>
        </ng-template>
      </ui-table>
    </ui-glass-card>`,
  }),
};

export const MobileStack: Story = { name: 'Mobile: stack', globals: { viewport: { value: 'mobile', isRotated: false } } };
export const MobileCompact: Story = {
  name: 'Mobile: compatta',
  args: { stack: false },
  render: (args) => ({
    props: { ...args, rows: RIGHE, cols: [COLONNE[0], COLONNE[1], COLONNE[2], COLONNE[7]], link: (r: Riga) => `#squadra-${r.id}` },
    template: `<ui-glass-card><ui-table caption="Classifica girone A" captionVisible [columns]="cols" [rows]="rows" rowKey="id" [rowLink]="link" /></ui-glass-card>`,
  }),
  globals: { viewport: { value: 'mobile', isRotated: false } },
};
export const Empty: Story = {
  name: 'Vuota',
  render: () => ({ props: { cols: COLONNE }, template: `<ui-glass-card><ui-table caption="Classifica girone D" captionVisible [columns]="cols" [rows]="[]" emptyText="Nessuna partita giocata" /></ui-glass-card>` }),
};
export const RowHover: Story = { name: 'Stato: hover riga', parameters: { pseudo: { hover: ['tbody tr:first-child'] } } };
export const RowFocus: Story = { name: 'Stato: focus link di riga', parameters: { pseudo: { focusVisible: ['.row-link'] } } };

const BO = () => ({
  props: { rows: [...RIGHE, ...RIGHE.map((r) => ({ ...r, id: r.id + '2', pos: r.pos + 4 }))], cols: COLONNE, link: (r: Riga) => `#squadra-${r.id}` },
  template: `<ui-glass-card padding="none" style="max-height:18rem;overflow:auto">
    <ui-table caption="Classifica generale" [columns]="cols" [rows]="rows" rowKey="id" [rowLink]="link" stack />
  </ui-glass-card>`,
});
const themes = themeStories<Args>(BO);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
