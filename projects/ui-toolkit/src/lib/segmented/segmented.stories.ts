import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SbIcon } from '../../../stories/support/icon';
import { themeStories } from '../../../stories/support/themes';
import { Segmented, SegmentedIcon, type SegmentedOption } from './segmented';

const OPTIONS: SegmentedOption[] = [
  { value: 'partite', label: 'Partite' },
  { value: 'classifica', label: 'Classifica' },
  { value: 'squadre', label: 'Squadre' },
];
const ICONS: Record<string, string> = { partite: 'calendar', classifica: 'trophy', squadre: 'users' };

type Args = { options: SegmentedOption[]; value: string; block: boolean; ariaLabel: string };

const meta: Meta<Args> = {
  title: 'Components/Segmented',
  component: Segmented,
  subcomponents: { SegmentedIcon },
  decorators: [moduleMetadata({ imports: [Segmented, SegmentedIcon, SbIcon] })],
  args: { options: OPTIONS, value: 'partite', block: false, ariaLabel: 'Vista torneo' },
  render: (args) => ({
    props: { ...args, v: signal(args.value) },
    template: `<ui-segmented [options]="options" [(value)]="v" [block]="block" [ariaLabel]="ariaLabel" />
      <p class="ui-body-sm text-muted">Selezionato: <strong>{{ v() }}</strong></p>`,
  }),
  parameters: {
    docs: {
      description: {
        component: `Tablist WAI-ARIA in un binario glass a pill (padding 0.25rem, gap 0.25rem). Tab min-height 2.75rem, padding 0 1rem, 0.875rem/700, colore muted;
selezionata nav-active bg/fg + shadow-float; icona opzionale 18px tramite \`<ng-template uiSegmentedIcon let-option>\`.

**Accessibilità** — \`role="tablist"\` con \`aria-label\`, tab con \`aria-selected\` e \`aria-controls\` (se fornito il pannello). Roving tabindex:
un solo tab nella sequenza Tab; ←/→ con wrap (salta i disabilitati), Home/End; la selezione segue il focus.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const tabs = c.getAllByRole('tab');
    await userEvent.tab();
    await expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[1]).toHaveFocus();
    await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(tabs[2]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1);
    await userEvent.click(tabs[1]);
    await expect(c.getByText('classifica')).toBeInTheDocument();
  },
};
export const Block: Story = { args: { block: true } };
export const WithDisabled: Story = {
  name: 'Opzione disabilitata',
  args: { options: [...OPTIONS.slice(0, 2), { value: 'squadre', label: 'Squadre', disabled: true }] },
};
export const WithIcons: Story = {
  name: 'Con icone',
  render: (args) => ({
    props: { ...args, v: signal(args.value), icons: ICONS },
    template: `<ui-segmented [options]="options" [(value)]="v" ariaLabel="Vista torneo">
      <ng-template uiSegmentedIcon let-o><sb-icon [name]="icons[o.value]" [size]="18" /></ng-template>
    </ui-segmented>`,
  }),
};
export const FocusVisible: Story = { name: 'Stato: focus-visible', parameters: { pseudo: { focusVisible: true } } };
export const Hover: Story = { name: 'Stato: hover', parameters: { pseudo: { hover: true } } };

const ALL = () => ({
  props: { options: OPTIONS, v: signal('classifica'), icons: ICONS },
  template: `<div style="display:grid;gap:1rem;max-width:28rem">
    <ui-segmented [options]="options" [(value)]="v" ariaLabel="Vista" />
    <ui-segmented [options]="options" [(value)]="v" ariaLabel="Vista con icone" block>
      <ng-template uiSegmentedIcon let-o><sb-icon [name]="icons[o.value]" [size]="18" /></ng-template>
    </ui-segmented>
  </div>`,
});
const themes = themeStories<Args>(ALL);
export const Light: Story = themes.Light;
export const Dark: Story = themes.Dark;
export const Backoffice: Story = themes.Backoffice;
export const BackofficeDark: Story = themes.BackofficeDark;
