import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-button',
  component: 'agtc-button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036, all approved):',
          '',
          '- **A single primary action** per context — [IxDF — clear primary action](https://ixdf.org/literature/topics/ui-design-patterns)',
          '- **Explicit confirmation** for `critical` — [NN/g — error prevention](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Width preserved** during `loading` — [Smashing](https://www.smashingmagazine.com/category/design-patterns/)',
          '- **Never disable without stating the reason** (motivated `disabled` rather than hiding) — [Smashing — hidden vs disabled](https://www.smashingmagazine.com/category/design-patterns/)',
          '- **Label describing the consequence** (not "OK") — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '',
          'Details: `guidelines/components/button.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'critical'],
      description: 'Visual variant — defines the hierarchy and the intent of the action.',
      table: { defaultValue: { summary: 'primary' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interaction. Visual width is preserved.',
    },
    loading: {
      control: 'boolean',
      description: 'Async state — visible spinner, width preserved, aria-busy=true.',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Square padding. Requires label="" for WCAG 1.1.1.',
      name: 'icon-only',
    },
    icon: {
      control: 'text',
      description: 'Prefix icon name (via <agtc-icon>).',
    },
    iconSuffix: {
      control: 'text',
      description: 'Suffix icon name (via <agtc-icon>).',
      name: 'icon-suffix',
    },
    label: {
      control: 'text',
      description: 'aria-label for icon-only buttons. Required when icon-only=true.',
    },
  },
  args: {
    variant: 'primary',
    disabled: false,
    loading: false,
  },
  render: (args) => html`
    <agtc-button
      variant="${args.variant}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?icon-only="${args.iconOnly}"
      icon="${args.icon || ''}"
      icon-suffix="${args.iconSuffix || ''}"
      label="${args.label || ''}"
    >
      ${args.slotContent ?? 'Submit'}
    </agtc-button>
  `,
};

// ── Base variants ────────────────────────────────────────────────────────────

export const Primary = {
  name: 'Primary — main action',
  args: { variant: 'primary' },
  render: () => html`<agtc-button variant="primary">Submit</agtc-button>`,
};

export const Secondary = {
  name: 'Secondary — alternative action',
  args: { variant: 'secondary' },
  render: () => html`<agtc-button variant="secondary">Cancel</agtc-button>`,
};

export const Ghost = {
  name: 'Ghost — tertiary action',
  args: { variant: 'ghost' },
  render: () => html`<agtc-button variant="ghost">Learn more</agtc-button>`,
};

export const Critical = {
  name: 'Critical — irreversible action',
  args: { variant: 'critical' },
  render: () => html`<agtc-button variant="critical">Permanently delete</agtc-button>`,
};

// ── States ───────────────────────────────────────────────────────────────────

export const Disabled = {
  name: 'States — Disabled (all variants)',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" disabled>Submit</agtc-button>
      <agtc-button variant="secondary" disabled>Cancel</agtc-button>
      <agtc-button variant="ghost" disabled>Learn more</agtc-button>
      <agtc-button variant="critical" disabled>Permanently delete</agtc-button>
    </div>
  `,
};

export const Loading = {
  name: 'States — Loading (all variants)',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" loading>Submit</agtc-button>
      <agtc-button variant="secondary" loading>Cancel</agtc-button>
      <agtc-button variant="ghost" loading>Learn more</agtc-button>
      <agtc-button variant="critical" loading>Permanently delete</agtc-button>
    </div>
  `,
};

// ── Critical behavior ────────────────────────────────────────────────────────

export const CriticalConfirmFlow = {
  name: 'Critical — confirmation flow (2 clicks)',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:400px;">
      <p style="font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);margin:0;">
        1st click → "Confirm?" · 2nd click → action · Escape or blur → reset
      </p>
      <agtc-button variant="critical">Permanently delete the folder</agtc-button>
    </div>
  `,
};

// ── Icons ────────────────────────────────────────────────────────────────────

export const WithIconPrefix = {
  name: 'Icons — Prefix (slot property)',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon="plus">Add</agtc-button>
      <agtc-button variant="secondary" icon="arrow-left">Back</agtc-button>
      <agtc-button variant="ghost" icon="info">Details</agtc-button>
    </div>
  `,
};

export const WithIconSuffix = {
  name: 'Icons — Suffix (slot property)',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
      <agtc-button variant="primary" icon-suffix="arrow-right">Next</agtc-button>
      <agtc-button variant="secondary" icon-suffix="external-link">View</agtc-button>
    </div>
  `,
};

export const WithCustomSlot = {
  name: 'Icons — Free slot composition (custom SVG)',
  render: () => html`
    <agtc-button variant="primary">
      <svg slot="prefix" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3Zm0 2a1 1 0 0 0-1 1v2H5a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0V10h2a1 1 0 0 0 0-2H9V8a1 1 0 0 0-1-1Z"/>
      </svg>
      Create
    </agtc-button>
  `,
};

// ── All variants side by side ────────────────────────────────────────────────

export const AllVariants = {
  name: 'Overview — all variants',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-2xl);">
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Default</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary">Primary</agtc-button>
          <agtc-button variant="secondary">Secondary</agtc-button>
          <agtc-button variant="ghost">Ghost</agtc-button>
          <agtc-button variant="critical">Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Disabled</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" disabled>Primary</agtc-button>
          <agtc-button variant="secondary" disabled>Secondary</agtc-button>
          <agtc-button variant="ghost" disabled>Ghost</agtc-button>
          <agtc-button variant="critical" disabled>Critical</agtc-button>
        </div>
      </div>
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--agtc-semantic-color-text-secondary);margin:0 0 10px;">Loading</p>
        <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-md);flex-wrap:wrap;align-items:center;">
          <agtc-button variant="primary" loading>Primary</agtc-button>
          <agtc-button variant="secondary" loading>Secondary</agtc-button>
          <agtc-button variant="ghost" loading>Ghost</agtc-button>
          <agtc-button variant="critical" loading>Critical</agtc-button>
        </div>
      </div>
    </div>
  `,
};
