import { LitElement, html, css } from 'lit';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// V2 editorial card with icon, title and body text.
// Used in the "Value by role" sections and marketing editorial blocks.
//
// WHY — UX patterns applied (approved ADR-070, review 2026-06-25):
//   P1 Icon + title as a duo — NN/g Icons & Indicators — functional signal, not decorative
//   P2 Controlled interactivity affordance — IxDF Hover Controls — animation on hover only
//   P3 Non-interactive by default — Smashing Card patterns — the action goes inside
//   P4 Touch targets ≥ 24×24px — IxDF Touch Targets — 36px icon, non-interactive
//   P5 Flexible heading level — NN/g Visual Hierarchy — heading-level attribute (default 3)
//   P6 Contextual variant — Dashboard Design Patterns — SaaS (color) vs marketing (gradient)
//   P7 prefers-reduced-motion — IxDF Accessibility — visible border, transition disabled
//   P8 Accessible markup — IF Transparency — heading + slot suffice without extra aria-label
//
// Attributes:
//   heading       — card title (short, max 2-3 words)
//   heading-level — HTML heading level, 1-6 (default: 3)
//   variant       — "default" | "marketing"
//
// Slots:
//   slot[name="icon"] → SVG icon (20×20px recommended)
//   slot (default)    → short description
//
// Token contract:
//   border-bottom    → --agtc-semantic-color-action-primary
//   gradient (mktg)  → --agtc-semantic-color-action-primary + --agtc-semantic-color-brand-accent
//   card background  → --agtc-semantic-color-background-overlay-dark
//   card border      → --agtc-semantic-color-border-overlay-dark
// ────────────────────────────────────────────────────────────────────────────

class AgtcFeatureCard extends LitElement {
  static properties = {
    heading:      { type: String },
    headingLevel: { type: Number, attribute: 'heading-level' },
    variant:      { type: String },
  };

  constructor() {
    super();
    this.heading      = '';
    this.headingLevel = 3;
    this.variant      = 'default';
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
      padding: 1.5rem;
      background: var(--agtc-semantic-color-background-overlay-dark, rgba(12, 15, 25, .78));
      backdrop-filter: blur(18px);
      border: 1px solid var(--agtc-semantic-color-border-overlay-dark, rgba(255,255,255,.06));
      overflow: hidden;
      min-height: 200px;
    }

    :host::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 3px;
      background: var(--agtc-semantic-color-action-primary, #12a594);
      transform: scaleX(0.16);
      transform-origin: left;
      transition: transform .28s ease;
    }

    :host([variant="marketing"])::after {
      background: linear-gradient(
        90deg,
        var(--agtc-semantic-color-action-primary, #12a594),
        var(--agtc-semantic-color-brand-accent, #e35d6a)
      );
    }

    :host(:hover)::after,
    :host(:focus-within)::after {
      transform: scaleX(1);
    }

    /* P7 — prefers-reduced-motion: border always visible, transition disabled */
    @media (prefers-reduced-motion: reduce) {
      :host::after {
        transform: scaleX(1);
        transition: none;
      }
    }

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      color: var(--agtc-semantic-color-action-primary, #12a594);
      margin-bottom: var(--agtc-semantic-space-component-padding-lg, 16px);
      flex-shrink: 0;
    }

    ::slotted([slot="icon"]) {
      width: 1.25rem;
      height: 1.25rem;
    }

    .heading {
      font-size: .95rem;
      font-weight: 700;
      color: var(--agtc-semantic-color-text-on-dark, rgba(255,255,255,1.00));
      margin: 0 0 .5rem;
      line-height: 1.3;
    }

    .body {
      font-size: .875rem;
      color: var(--agtc-semantic-color-text-on-dark-secondary, rgba(255,255,255,0.75));
      line-height: 1.6;
      flex: 1;
    }
  `;

  _renderHeading() {
    const level = Math.min(Math.max(this.headingLevel, 1), 6);
    return html`<div class="heading" role="heading" aria-level="${level}">${this.heading}</div>`;
  }

  render() {
    const hasIcon = this.querySelector('[slot="icon"]') !== null;
    return html`
      ${hasIcon ? html`<div class="icon-wrap"><slot name="icon"></slot></div>` : ''}
      ${this._renderHeading()}
      <div class="body"><slot></slot></div>
    `;
  }
}

customElements.define('agtc-feature-card', AgtcFeatureCard);
