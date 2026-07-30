import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-input',
  component: 'agtc-input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036, all approved):',
          '',
          '- **Validation on `onBlur`**, then re-validation on typing once the field is in error — [NN/g — How to Report Errors in Forms](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Inline error** below the field + `role="alert"`; persistent **help text** via `aria-describedby` — [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Required marker** `*` + `aria-required` — [NN/g — Forms](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Forgiving format** (`tel`/`number`) — [IxDF](https://ixdf.org/literature/topics/ui-design-patterns)',
          '- **Anti hostile patterns** (no clearing of the field on error) — [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '',
          'Details: `guidelines/components/input.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      table: { defaultValue: { summary: 'text' } },
    },
    label:        { control: 'text' },
    value:        { control: 'text' },
    placeholder:  { control: 'text' },
    helperText:   { control: 'text',    name: 'helper-text' },
    errorMessage: { control: 'text',    name: 'error-message' },
    invalid:      { control: 'boolean' },
    disabled:     { control: 'boolean' },
    readonly:     { control: 'boolean' },
    required:     { control: 'boolean' },
    icon:         { control: 'text' },
    iconSuffix:   { control: 'text',    name: 'icon-suffix' },
  },
  args: {
    type: 'text',
    label: 'Email address',
    placeholder: 'name@example.com',
    invalid: false,
    disabled: false,
    readonly: false,
    required: false,
  },
  render: (args) => html`
    <div style="max-width:360px;">
      <agtc-input
        type="${args.type}"
        label="${args.label}"
        placeholder="${args.placeholder ?? ''}"
        helper-text="${args.helperText ?? ''}"
        error-message="${args.errorMessage ?? ''}"
        ?invalid="${args.invalid}"
        ?disabled="${args.disabled}"
        ?readonly="${args.readonly}"
        ?required="${args.required}"
        icon="${args.icon ?? ''}"
        icon-suffix="${args.iconSuffix ?? ''}"
      ></agtc-input>
    </div>
  `,
};

// ── Base states ──────────────────────────────────────────────────────────────

export const Default = {
  name: 'Default',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input label="Email address" placeholder="name@example.com"></agtc-input>
    </div>
  `,
};

export const WithHelperText = {
  name: 'With helper text',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        placeholder="name@example.com"
        helper-text="We never share your address."
      ></agtc-input>
    </div>
  `,
};

export const Required = {
  name: 'Required',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        placeholder="name@example.com"
        required
        helper-text="Required field."
      ></agtc-input>
    </div>
  `,
};

export const Invalid = {
  name: 'State — Invalid',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        value="not-an-address"
        invalid
        error-message="Invalid email address. Check the format (e.g. name@domain.com)."
      ></agtc-input>
    </div>
  `,
};

export const Disabled = {
  name: 'State — Disabled',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Email address"
        value="user@example.com"
        disabled
        helper-text="This field cannot be edited."
      ></agtc-input>
    </div>
  `,
};

export const Readonly = {
  name: 'State — Readonly',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        label="Identifier"
        value="USR-00142"
        readonly
        helper-text="Automatically generated identifier."
      ></agtc-input>
    </div>
  `,
};

// ── Types ────────────────────────────────────────────────────────────────────

export const Password = {
  name: 'Type — Password (show/hide toggle)',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        type="password"
        label="Password"
        placeholder="8 characters minimum"
        helper-text="Use a combination of letters, numbers and symbols."
      ></agtc-input>
    </div>
  `,
};

export const Search = {
  name: 'Type — Search',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input
        type="search"
        label="Search"
        placeholder="Components, tokens, guidelines…"
        icon="search"
      ></agtc-input>
    </div>
  `,
};

export const Number = {
  name: 'Type — Number (no native spinners)',
  render: () => html`
    <div style="max-width:200px;">
      <agtc-input
        type="number"
        label="Quantity"
        placeholder="0"
        helper-text="Value between 1 and 99."
      ></agtc-input>
    </div>
  `,
};

// ── Icons ────────────────────────────────────────────────────────────────────

export const WithIcons = {
  name: 'Icons — Prefix and suffix',
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:var(--agtc-semantic-space-component-padding-lg);max-width:360px;">
      <agtc-input
        label="Search for a user"
        placeholder="Name or email"
        icon="search"
      ></agtc-input>
      <agtc-input
        label="Amount"
        placeholder="0.00"
        icon="euro"
        icon-suffix="trending-up"
        type="number"
      ></agtc-input>
    </div>
  `,
};

export const WithCustomSlot = {
  name: 'Icons — Free slot composition',
  render: () => html`
    <div style="max-width:360px;">
      <agtc-input label="Profile URL" placeholder="https://">
        <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true"
          style="margin-inline-start:12px;color:var(--agtc-semantic-color-text-secondary);flex-shrink:0;">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </agtc-input>
    </div>
  `,
};

// ── Overview ─────────────────────────────────────────────────────────────────

export const AllStates = {
  name: 'Overview — all states',
  render: () => html`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--agtc-semantic-space-component-padding-2xl);max-width:760px;">
      <agtc-input label="Default" placeholder="Enter a value"></agtc-input>
      <agtc-input label="Required" placeholder="Enter a value" required helper-text="Required field."></agtc-input>
      <agtc-input label="Invalid" value="incorrect value" invalid error-message="This field contains an error."></agtc-input>
      <agtc-input label="Disabled" value="Disabled value" disabled></agtc-input>
      <agtc-input label="Readonly" value="Read-only value" readonly helper-text="Not editable."></agtc-input>
      <agtc-input label="Password" type="password" placeholder="Password"></agtc-input>
      <agtc-input label="With icon" placeholder="Search…" icon="search"></agtc-input>
      <agtc-input label="Invalid + icon" value="error" icon="mail" invalid error-message="Invalid format."></agtc-input>
    </div>
  `,
};
