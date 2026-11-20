import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { SbIcon } from '../../../stories/support/icon';
import { themeStories } from '../../../stories/support/themes';
import { Button } from '../button/button';
import { GlassCard } from '../glass-card/glass-card';
import { EmptyState } from './empty-state';

const meta: Meta<EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  decorators: [moduleMetadata({ imports: [EmptyState, SbIcon, Button, GlassCard] })],
  args: { title: 'Nessuna partita in programma', description: 'Quando il calendario sarà pubblicato troverai qui orari e campi delle partite.', headingLevel: 2 },
  render: (args) => ({
    props: args,
    template: `<ui-glass-card style="max-width:28rem"><ui-empty-state ${argsToTemplate(args)}>
      <sb-icon uiEmptyIcon name="calendar" [size]="32" [stroke]="1.75" />
      <div uiEmptyActions><button uiButton variant="primary">Crea calendario</button></div>
    </ui-empty-state></ui-glass-card>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Colonna centrata, padding 2.5rem 1.5rem: tile icona 4rem radius 1rem su brand-soft con icona 32px (stroke 1.75) accent-text,
titolo 1.125rem/800, descrizione muted max 24rem, slot azioni \`[uiEmptyActions]\`.

**Accessibilità** — l'icona è decorativa (\`aria-hidden\`); \`headingLevel\` rende il titolo un heading del livello giusto nella pagina.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<EmptyState>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 2 })).toHaveTextContent('Nessuna partita');
  },
};
export const WithoutActions: Story = {
  name: 'Senza azioni',
  render: (args) => ({
    props: args,
    template: `<ui-empty-state ${argsToTemplate(args)}><sb-icon uiEmptyIcon name="inbox" [size]="32" [stroke]="1.75" /></ui-empty-state>`,
  }),
  args: { title: 'Nessun risultato', description: 'Prova a cambiare i filtri o a cercare un altro nome.' },
};
export const Minimal: Story = { name: 'Solo titolo', render: (args) => ({ props: args, template: `<ui-empty-state ${argsToTemplate(args)} />` }), args: { title: 'Ancora niente qui', description: undefined } };

const ALL = () => ({
  template: `<ui-glass-card style="max-width:28rem"><ui-empty-state title="Nessuna squadra iscritta" description="Condividi il link d'iscrizione: le squadre compariranno qui." [headingLevel]="2">
    <sb-icon uiEmptyIcon name="users" [size]="32" [stroke]="1.75" />
    <div uiEmptyActions><button uiButton variant="primary">Copia link</button><button uiButton variant="ghost">Aggiungi a mano</button></div>
  </ui-empty-state></ui-glass-card>`,
});
const themes = themeStories<EmptyState>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
