import './agtc-feature-card.js';

export default {
  title: 'Components/Feature Card',
  component: 'agtc-feature-card',
  parameters: {
    docs: {
      description: {
        component: `
**V2 editorial card** — functional icon + title + body text with an interactivity affordance (animated border-bottom).

Designed for narrative marketing sections ("Value by role", editorial blocks). Two variants:
- \`default\` — primary-color border-bottom (SaaS pages)
- \`marketing\` — primary→accent gradient border-bottom (\`data-context="marketing"\` pages)

**UX patterns applied** (approved ADR-063, 2026-06-25):
- [NN/g — Icon + title as a duo](https://www.nngroup.com/articles/design-pattern-guidelines/): functional icon, not decorative
- [IxDF — Controlled affordance](https://ixdf.org/literature/topics/ui-design-patterns): animation only on hover/focus
- [IxDF — prefers-reduced-motion](https://ixdf.org/literature/topics/ui-design-patterns): border permanently visible when motion is reduced
- [Dashboard — Contextual variant](https://dashboarddesignpatterns.github.io/patterns.html): default vs marketing

**Attributes:** \`heading\` · \`heading-level\` (1-6, default 3) · \`variant\` (default | marketing)

**Slots:** \`icon\` (SVG 20×20) · *(default)* body text
        `,
      },
    },
  },
  argTypes: {
    heading:      { control: 'text', description: 'Card title' },
    headingLevel: { control: { type: 'number', min: 1, max: 6 }, description: 'HTML heading level (1-6)' },
    variant:      { control: { type: 'select', options: ['default', 'marketing'] } },
  },
};

const iconSvg = `<svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
</svg>`;

export const Default = {
  render: (args) => `
    <agtc-feature-card heading="${args.heading}" heading-level="${args.headingLevel}" variant="${args.variant}">
      ${iconSvg}
      Semantic tokens, component contracts and documented decisions — readable by humans and AI agents.
    </agtc-feature-card>
  `,
  args: { heading: 'Designers', headingLevel: 3, variant: 'default' },
};

export const Marketing = {
  render: (args) => `
    <div style="background:var(--agtc-semantic-color-background-inverse);padding:2rem;">
      <agtc-feature-card heading="${args.heading}" heading-level="${args.headingLevel}" variant="${args.variant}">
        ${iconSvg}
        Semantic tokens, component contracts and documented decisions — readable by humans and AI agents.
      </agtc-feature-card>
    </div>
  `,
  args: { heading: 'Designers', headingLevel: 3, variant: 'marketing' },
};

export const Grid = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--agtc-semantic-color-background-inverse-raised);max-width:900px;"> <!-- audit-ignore: 1px hairline grid-divider technique, not a spacing decision -->
      ${['Organization', 'Managers', 'Designers', 'Developers', 'AI'].map(name => `
        <agtc-feature-card heading="${name}" heading-level="3" variant="marketing">
          ${iconSvg}
          Specific value for this role in the agentic design system.
        </agtc-feature-card>
      `).join('')}
    </div>
  `,
  parameters: { docs: { description: { story: 'Grid of 5 cards — typical usage in the "Value by role" section.' } } },
};

export const ReducedMotion = {
  render: () => `
    <p style="font-size:.85rem;margin-bottom:1rem;color:var(--agtc-semantic-color-text-secondary);">
      Simulate with: OS → Accessibility → Reduce motion.
      The border-bottom is visible at full width from the start.
    </p>
    <agtc-feature-card heading="Accessibility" heading-level="3">
      ${iconSvg}
      The border-bottom stays visible even without animation — prefers-reduced-motion respected.
    </agtc-feature-card>
  `,
};
