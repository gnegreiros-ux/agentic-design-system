import { html } from 'lit';
import './agtc-toggle.js';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-toggle',
  component: 'agtc-toggle',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'On/off switch with **immediate effect** (no "Save" button). State is signaled by the **knob position** (non-color indicator, WCAG 1.4.1), reinforced by the track color.',
          '',
          'UX reference patterns applied (ADR-036/039, all approved):',
          '',
          '- **`role="switch"`, immediate effect, state by position** (not color alone), **concise label describing the "on" state** — [NN/g — toggle switch guidelines](https://www.nngroup.com/articles/toggle-switch-guidelines/)',
          '- **Touch target ≥ 24px** — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '',
          'Prefer over a checkbox when the change applies instantly. Details: `guidelines/components/toggle.md`.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Email notifications',
    checked: false,
    disabled: false,
  },
  render: (args) => html`
    <agtc-toggle
      label="${args.label}"
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
    ></agtc-toggle>
  `,
};

// ── States ───────────────────────────────────────────────────────────────────

export const Off = {
  name: 'Off',
  render: () => html`<agtc-toggle label="Dark mode"></agtc-toggle>`,
};

export const On = {
  name: 'On',
  render: () => html`<agtc-toggle label="Dark mode" checked></agtc-toggle>`,
};

export const Disabled = {
  name: 'Disabled — off and on',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-toggle label="Sync (unavailable)" disabled></agtc-toggle>
      <agtc-toggle label="Auto-save (locked)" checked disabled></agtc-toggle>
    </div>
  `,
};

export const States = {
  name: 'All states',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-toggle label="Off"></agtc-toggle>
      <agtc-toggle label="On" checked></agtc-toggle>
      <agtc-toggle label="Disabled (off)" disabled></agtc-toggle>
      <agtc-toggle label="Disabled (on)" checked disabled></agtc-toggle>
    </div>
  `,
};

// ── Composition: settings list ────────────────────────────────────────────────

export const SettingsList = {
  name: 'Composition — settings list',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:320px;">
      <agtc-toggle label="Email notifications" checked></agtc-toggle>
      <agtc-toggle label="Push notifications"></agtc-toggle>
      <agtc-toggle label="Weekly digest" checked></agtc-toggle>
    </div>
  `,
};
