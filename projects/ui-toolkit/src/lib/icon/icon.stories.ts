import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { BUILTIN_ICONS } from './icons.generated';
import { Icon, provideIcons } from './icon';

const NAMES = Object.keys(BUILTIN_ICONS);

const meta: Meta<Icon> = {
  title: 'Components/Icon',
  component: Icon,
  decorators: [moduleMetadata({ imports: [Icon] })],
  args: { name: 'trophy', size: 20 },
  argTypes: { name: { control: 'select', options: NAMES } },
  parameters: {
    docs: {
      description: {
        component: `Icone Phosphor (regular, MIT) su griglia 256, \`fill: currentColor\`. Set incluso con nomi semantici, rigenerato da \`npm run icons\`;
le icone di dominio dell'app si aggiungono con \`provideIcons({ nome: ['M…'] })\` (possono anche sostituire quelle incluse).

**Accessibilità** — decorativa di default (\`aria-hidden\`); con \`label\` diventa \`role="img"\` con nome accessibile.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Icon>;

export const Default: Story = {};

export const Set: Story = {
  name: 'Set incluso',
  render: () => ({
    props: { names: NAMES },
    template: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:1rem">
      @for (n of names; track n) {
        <div style="display:flex;flex-direction:column;align-items:center;gap:.25rem;font-size:.75rem"><ui-icon [name]="n" [size]="24" />{{ n }}</div>
      }
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('ui-icon svg').length).toBe(NAMES.length);
  },
};

export const Registered: Story = {
  name: 'Icona registrata',
  decorators: [moduleMetadata({ providers: [provideIcons({ 'yellow-card': ['M91,32h74a16,16,0,0,1,16,16V208a16,16,0,0,1-16,16H91a16,16,0,0,1-16-16V48A16,16,0,0,1,91,32Z'] })] })],
  render: () => ({ template: `<ui-icon name="yellow-card" [size]="32" label="Cartellino giallo" />` }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Cartellino giallo' })).toBeTruthy();
  },
};
