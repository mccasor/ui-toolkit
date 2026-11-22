import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { SWATCHES } from 'ui-toolkit/tokens';
import { themeStories } from '../../../stories/support/themes';
import { Avatar, TeamLogo } from './avatar';

/** Logo di esempio (SVG inline come data URI: nessuna richiesta esterna). */
const LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4l24 8v18c0 15-10 26-24 30C18 56 8 45 8 30V12z" fill="#1565C0"/><path d="M32 14l14 5v11c0 9-6 16-14 19-8-3-14-10-14-19V19z" fill="#FFB936"/></svg>`,
  );

const meta: Meta<Avatar> = {
  title: 'Components/Avatar e TeamLogo',
  component: Avatar,
  subcomponents: { TeamLogo },
  decorators: [moduleMetadata({ imports: [Avatar, TeamLogo] })],
  args: { name: 'Mario Rossi', size: 'md', color: null, src: null, decorative: false },
  argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] }, color: { control: 'color' } },
  render: (args) => ({ props: args, template: `<ui-avatar ${argsToTemplate(args)} />` }),
  parameters: {
    docs: {
      description: {
        component: `Immagine con fallback a iniziali (max 2, font display 700, size × 0.38). Size xs 1.5, sm 2, md 2.5, lg 3.5, xl 5rem.
\`ui-avatar\` = cerchio; \`ui-team-logo\` = quadrato radius 28% su tile glass, \`object-fit: contain\`. Colore del fallback: colore scelto con on
calcolato (\`onColor\`), altrimenti palette fallback via hash del nome (orange/ink, ink/orange, #23704A/bianco, #CE2828/bianco).

**Accessibilità** — \`role="img"\` con \`aria-label\` = nome; \`decorative\` lo nasconde quando il nome è già scritto accanto.
Se l'immagine non carica, si torna alle iniziali.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Avatar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Mario Rossi' })).toHaveTextContent('MR');
  },
};
export const Sizes: Story = {
  name: 'Size',
  render: () => ({
    template: `<div style="display:flex;gap:.75rem;align-items:center">
      @for (s of ['xs','sm','md','lg','xl']; track s) { <ui-avatar name="Giulia Bianchi" [size]="$any(s)" /> }
    </div>`,
  }),
};
export const FallbackPalette: Story = {
  name: 'Fallback da hash del nome',
  render: () => ({
    props: { names: ['Mario Rossi', 'Giulia Bianchi', 'Luca Verdi', 'Sara Neri', 'Paolo Gialli', 'Anna Blu', 'Marco Viola', 'Elena Grigi'] },
    template: `<div style="display:flex;gap:.5rem;flex-wrap:wrap">@for (n of names; track n) { <ui-avatar [name]="n" size="lg" /> }</div>`,
  }),
};
export const ChosenColors: Story = {
  name: 'Colore scelto (on calcolato)',
  render: () => ({
    props: { sw: SWATCHES },
    template: `<div style="display:flex;gap:.5rem;flex-wrap:wrap">@for (s of sw; track s.id) { <ui-team-logo [name]="s.label + ' FC'" [color]="s.fill" size="lg" /> }</div>`,
  }),
};
export const Logos: Story = {
  name: 'TeamLogo',
  render: () => ({
    props: { logo: LOGO },
    template: `<div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
      @for (s of ['xs','sm','md','lg','xl']; track s) { <ui-team-logo name="Leoni di Quartiere" [src]="logo" [size]="$any(s)" /> }
      <ui-team-logo name="Falchi" size="xl" />
      <ui-team-logo name="Immagine rotta" src="/non-esiste.png" size="xl" />
    </div>`,
  }),
};

const ALL = () => ({
  props: { logo: LOGO },
  template: `<div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
    <ui-avatar name="Mario Rossi" size="lg" /><ui-avatar name="Giulia Bianchi" size="lg" /><ui-avatar name="Luca" color="#6A1B9A" size="lg" />
    <ui-team-logo name="Leoni" [src]="logo" size="lg" /><ui-team-logo name="Falchi" size="lg" /><ui-team-logo name="Aquile" color="#4FC3F7" size="lg" />
  </div>`,
});
const themes = themeStories<Avatar>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
