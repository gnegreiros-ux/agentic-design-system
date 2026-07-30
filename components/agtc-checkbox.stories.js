import { html } from 'lit';
import './agtc-checkbox.js';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-checkbox',
  component: 'agtc-checkbox',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Checkbox for an independent binary selection (check/uncheck, mark a task done). **Square** shape by convention.',
          '',
          'UX reference patterns applied (ADR-036/037, all approved):',
          '',
          '- **Checkbox rather than toggle** for an independent item — [NN/g — checkbox vs toggle](https://www.nngroup.com/articles/toggle-switch-guidelines/)',
          '- **Square shape** (a circle signals a radio) + **clickable label** (Fitts) + **positive wording** — [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/)',
          '- **Touch target ≥ 24px**, visible states, **no deceptive pre-checking** — [IxDF — UI patterns](https://ixdf.org/literature/topics/ui-design-patterns)',
          '',
          'Details: `guidelines/components/checkbox.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Clickable label (positive wording)' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean', description: 'Partial state — `aria-checked="mixed"`' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Accept the terms',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
  },
  render: (args) => html`
    <agtc-checkbox
      label="${args.label}"
      ?checked="${args.checked}"
      ?indeterminate="${args.indeterminate}"
      ?disabled="${args.disabled}"
      ?required="${args.required}"
    ></agtc-checkbox>
  `,
};

// ── States ───────────────────────────────────────────────────────────────────

export const Default = {
  name: 'Default — unchecked',
  render: () => html`<agtc-checkbox label="Receive the newsletter"></agtc-checkbox>`,
};

export const Checked = {
  name: 'Checked',
  render: () => html`<agtc-checkbox label="Receive the newsletter" checked></agtc-checkbox>`,
};

export const Indeterminate = {
  name: 'Indeterminate — partial selection',
  render: () => html`<agtc-checkbox label="Select all" indeterminate></agtc-checkbox>`,
};

export const Disabled = {
  name: 'Disabled — unchecked and checked',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-checkbox label="Unavailable option" disabled></agtc-checkbox>
      <agtc-checkbox label="Locked option (checked)" checked disabled></agtc-checkbox>
    </div>
  `,
};

export const States = {
  name: 'All states',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-md);">
      <agtc-checkbox label="Default (unchecked)"></agtc-checkbox>
      <agtc-checkbox label="Checked" checked></agtc-checkbox>
      <agtc-checkbox label="Indeterminate (partial)" indeterminate></agtc-checkbox>
      <agtc-checkbox label="Disabled" disabled></agtc-checkbox>
      <agtc-checkbox label="Disabled + checked" checked disabled></agtc-checkbox>
    </div>
  `,
};

// ── Composition: task list (ToDo reference) ──────────────────────────────────

export const TaskList = {
  name: 'Composition — task list',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);max-width:340px;">
      <agtc-checkbox label="Learn Web Components" checked></agtc-checkbox>
      <agtc-checkbox label="Build the design system tokens" checked></agtc-checkbox>
      <agtc-checkbox label="Ship the checkbox component"></agtc-checkbox>
    </div>
  `,
};

// ── Group with indeterminate parent ──────────────────────────────────────────

export const SelectAllGroup = {
  name: 'Group — indeterminate parent',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);max-width:340px;">
      <agtc-checkbox label="Select all" indeterminate></agtc-checkbox>
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);padding-inline-start:28px;">
        <agtc-checkbox label="Email notifications" checked></agtc-checkbox>
        <agtc-checkbox label="Push notifications"></agtc-checkbox>
      </div>
    </div>
  `,
};
