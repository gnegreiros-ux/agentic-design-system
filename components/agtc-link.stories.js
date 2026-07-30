import { html } from 'lit';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-link',
  component: 'agtc-link',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036/043, LK1–LK8 all approved):',
          '',
          '- **Underline in running text** (distinguishable beyond color, WCAG 1.4.1) — [NN/g — Visualizing Links](https://www.nngroup.com/articles/guidelines-for-visualizing-links/)',
          '- **External link**: `rel="noopener noreferrer"` + icon + hidden text "opens in a new tab" — [WCAG H83](https://www.w3.org/WAI/WCAG21/Techniques/html/H83)',
          '- **Descriptive text** (never "click here") — [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/)',
          '',
          'A link **navigates** — for an action, use `agtc-button`.',
          '',
          'Details: `guidelines/components/link.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    href:      { control: 'text' },
    external:  { control: 'boolean' },
    underline: { control: 'select', options: ['always', 'hover', 'none'], table: { defaultValue: { summary: 'always' } } },
  },
  args: {
    href: '#',
    external: false,
    underline: 'always',
  },
  render: (args) => html`
    <p style="font-family:var(--agtc-semantic-typography-mono-family,system-ui);color:var(--agtc-semantic-color-text-primary)">
      A paragraph containing
      <agtc-link href="${args.href}" ?external="${args.external}" underline="${args.underline}">${args.slotContent ?? 'a descriptive link'}</agtc-link>
      within the text flow.
    </p>
  `,
};

// ── Inline (default, underlined) ──────────────────────────────────────────────
export const Inline = {
  name: 'Inline — underlined (default)',
  render: () => html`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      See the <agtc-link href="#guideline">component guideline</agtc-link> for details.
    </p>
  `,
};

// ── External (new tab) ────────────────────────────────────────────────────────
export const External = {
  name: 'External — new tab (icon + AT)',
  render: () => html`
    <p style="color:var(--agtc-semantic-color-text-primary)">
      Reference: <agtc-link href="https://www.nngroup.com/articles/guidelines-for-visualizing-links/" external>NN/g — Visualizing Links</agtc-link>.
    </p>
  `,
};

// ── Underline on hover (nav/standalone) ───────────────────────────────────────
export const UnderlineHover = {
  name: 'Underline on hover (nav)',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-layout-component);">
      <agtc-link href="#a" underline="hover">Home</agtc-link>
      <agtc-link href="#b" underline="hover">Components</agtc-link>
      <agtc-link href="#c" underline="hover">Tokens</agtc-link>
    </div>
  `,
};
