import { html } from 'lit';
import './agtc-radio.js';
import './agtc-radio-group.js';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-radio',
  component: 'agtc-radio-group',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Mutually exclusive selection: a single choice within a set. **Round** shape. Always inside an `<agtc-radio-group>`, which handles exclusivity, roving focus and keyboard navigation (`<input radio>` elements in separate shadow DOMs do not group natively).',
          '',
          'UX reference patterns applied (ADR-036/038, all approved):',
          '',
          '- **Round shape** (square = checkbox), **exclusive selection**, **clickable label** — [NN/g — checkboxes vs radio](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/)',
          '- **Pre-select a sensible default** (except ethical/legal exceptions) — [NN/g — radio default selection](https://www.nngroup.com/articles/radio-buttons-default-selection/)',
          '- **Touch target ≥ 24px** — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '',
          'Details: `guidelines/components/radio.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
};

// ── Group with a selected default ────────────────────────────────────────────

export const Default = {
  name: 'Group — selected default',
  render: () => html`
    <agtc-radio-group name="plan" value="pro" label="Plan">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="free">Free</agtc-radio>
        <agtc-radio value="pro">Pro</agtc-radio>
        <agtc-radio value="team">Team</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};

export const NoDefault = {
  name: 'Group — no pre-selection',
  render: () => html`
    <agtc-radio-group name="ship" label="Shipping">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="standard">Standard (3–5 days)</agtc-radio>
        <agtc-radio value="express">Express (24h)</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};

export const WithDisabled = {
  name: 'Group — disabled option',
  render: () => html`
    <agtc-radio-group name="seat" value="window" label="Seat">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="window">Window</agtc-radio>
        <agtc-radio value="aisle">Aisle</agtc-radio>
        <agtc-radio value="middle" disabled>Middle (full)</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};

// ── States of a standalone radio (presentation) ──────────────────────────────

export const States = {
  name: 'States (presentation)',
  render: () => html`
    <agtc-radio-group name="states" value="selected">
      <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-control-gap);">
        <agtc-radio value="default">Unselected</agtc-radio>
        <agtc-radio value="selected">Selected</agtc-radio>
        <agtc-radio value="disabled" disabled>Disabled</agtc-radio>
      </div>
    </agtc-radio-group>
  `,
};
