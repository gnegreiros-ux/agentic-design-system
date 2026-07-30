import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Contextual inline message (callout / alert) in the page flow.
// NOT a toast (temporary floating element) nor a modal.
//
//   variant="neutral|brand|info|success|warning|danger"  (default info)
//   heading="…"      — optional title
//   icon="name"      — Lucide icon (overrides the per-variant default)
//   no-icon          — hides the icon
//   dismissible      — close button (emits the "dismiss" event)
//   live="off|polite|assertive"  — live region for DYNAMIC usage
//                       (default off: a static banner is not announced on load)
//
// Content (body) via <slot>. Actions via <slot name="actions">.
//
// UX reference patterns applied (ADR-036/042, all approved N1–N9):
//   Semantic variants + meaning never by color alone (icon + severity
//     prefix hidden for AT) — NN/g:
//     https://www.nngroup.com/articles/indicators-validations-notifications/
//   Static by default, opt-in role=status/alert for dynamic usage — MDN:
//     https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role
//   Accessible close button without focus trap — A11Y Collective:
//     https://www.a11y-collective.com/blog/aria-alert/
//   Details: guidelines/components/banner.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_ICON = {
  neutral: 'info',
  brand:   'sparkles',
  info:    'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger:  'octagon-alert',
};

// Severity prefix announced to screen readers (the icon is decorative).
const SEVERITY_PREFIX = {
  neutral: 'Information: ',
  brand:   'Information: ',
  info:    'Information: ',
  success: 'Success: ',
  warning: 'Warning: ',
  danger:  'Error: ',
};

class AgtcBanner extends LitElement {
  static properties = {
    variant:     { type: String },
    heading:     { type: String },
    icon:        { type: String },
    noIcon:      { type: Boolean, attribute: 'no-icon' },
    dismissible: { type: Boolean },
    live:        { type: String },
  };

  constructor() {
    super();
    this.variant     = 'info';
    this.noIcon      = false;
    this.dismissible = false;
    this.live        = 'off';
  }

  static styles = css`
    :host {
      display: block;
      margin: var(--agtc-semantic-space-layout-component) 0;
    }
    :host([hidden]) { display: none; }

    .banner {
      display: flex;
      align-items: flex-start;
      gap: var(--agtc-semantic-space-component-padding-md);
      padding: var(--agtc-component-banner-padding-y) var(--agtc-component-banner-padding-x);
      border: 1px solid var(--agtc-semantic-color-border-default);
      border-left-width: 3px;
      border-radius: 0 var(--agtc-component-banner-radius) var(--agtc-component-banner-radius) 0;
    }

    /* Variants: background + accent (left border + icon) ───────────────────── */
    .banner.neutral { background: var(--agtc-component-banner-neutral-background); border-left-color: var(--agtc-component-banner-neutral-accent); }
    .banner.brand   { background: var(--agtc-component-banner-brand-background);   border-left-color: var(--agtc-component-banner-brand-accent); }
    .banner.info    { background: var(--agtc-component-banner-info-background);    border-left-color: var(--agtc-component-banner-info-accent); }
    .banner.success { background: var(--agtc-component-banner-success-background); border-left-color: var(--agtc-component-banner-success-accent); }
    .banner.warning { background: var(--agtc-component-banner-warning-background); border-left-color: var(--agtc-component-banner-warning-accent); }
    .banner.danger  { background: var(--agtc-component-banner-danger-background);  border-left-color: var(--agtc-component-banner-danger-accent); }

    .icon { flex-shrink: 0; line-height: 0; padding-top: 1px; }
    .banner.neutral .icon { color: var(--agtc-component-banner-neutral-accent); }
    .banner.brand   .icon { color: var(--agtc-component-banner-brand-accent); }
    .banner.info    .icon { color: var(--agtc-component-banner-info-accent); }
    .banner.success .icon { color: var(--agtc-component-banner-success-accent); }
    .banner.warning .icon { color: var(--agtc-component-banner-warning-accent); }
    .banner.danger  .icon { color: var(--agtc-component-banner-danger-accent); }

    .content { flex: 1; min-width: 0; }
    .heading {
      display: block;
      color: var(--agtc-component-banner-heading-text);
      font-weight: var(--agtc-semantic-typography-label-weight);
      font-size: var(--agtc-semantic-typography-label-size);
      margin-bottom: 3px;
    }
    .body {
      color: var(--agtc-component-banner-body-text);
      font-size: var(--agtc-semantic-typography-label-size);
      line-height: 1.55;
    }
    .actions { margin-top: 10px; }
    .actions:empty { display: none; }

    .close {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px; height: 28px;
      margin: -4px -4px 0 0;
      background: none;
      border: none;
      border-radius: var(--agtc-semantic-radius-control);
      color: var(--agtc-component-banner-close-color);
      cursor: pointer;
      line-height: 0;
    }
    .close:hover { color: var(--agtc-component-banner-close-hover); }
    .close:focus-visible {
      outline: 2px solid var(--agtc-component-banner-border-focus);
      outline-offset: 2px;
    }

    .visually-hidden {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0);
      white-space: nowrap; border: 0;
    }
  `;

  _dismiss() {
    const ev = new CustomEvent('dismiss', { bubbles: true, composed: true, cancelable: true });
    const proceed = this.dispatchEvent(ev);
    if (proceed) this.hidden = true;  // :host([hidden]) → display:none
  }

  render() {
    const variant = this.variant || 'info';
    const iconName = this.icon || DEFAULT_ICON[variant] || 'info';
    // Live region: opt-in for dynamic usage only.
    const role = this.live === 'assertive' ? 'alert' : this.live === 'polite' ? 'status' : undefined;

    return html`
      <div
        class="banner ${variant}"
        role="${ifDefined(role)}"
      >
        <span class="visually-hidden">${SEVERITY_PREFIX[variant] || ''}</span>
        ${!this.noIcon ? html`
          <span class="icon"><agtc-icon name="${iconName}" size="inline" decorative></agtc-icon></span>
        ` : ''}
        <div class="content">
          ${this.heading ? html`<strong class="heading">${this.heading}</strong>` : ''}
          <div class="body"><slot></slot></div>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
        ${this.dismissible ? html`
          <button class="close" type="button" aria-label="Close" @click="${this._dismiss}">
            <agtc-icon name="x" size="inline" decorative></agtc-icon>
          </button>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('agtc-banner', AgtcBanner);
export { AgtcBanner };
