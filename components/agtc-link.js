import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Textual NAVIGATION link (a link navigates; for an action, use agtc-button).
// Text via <slot>.
//
//   href="…"                        — destination (required)
//   external                        — forces "external link" treatment
//                                     (auto-detected for http(s) to another origin)
//   underline="always|hover|none"   — underline (default always, WCAG 1.4.1)
//
// External link ⇒ target="_blank" + rel="noopener noreferrer" + icon +
//   hidden text "(opens in a new tab)" (the icon alone is not enough — WCAG H83).
//
// UX reference patterns applied (ADR-036/043, all approved LK1–LK8):
//   Underline in running text (distinguishable beyond color) — NN/g:
//     https://www.nngroup.com/articles/guidelines-for-visualizing-links/
//   New-tab warning (icon + AT text) — WCAG H83:
//     https://www.w3.org/WAI/WCAG21/Techniques/html/H83
//   Descriptive text (never "click here") — NN/g (same)
//   Details: guidelines/components/link.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

const GENERIC_TEXT = ['cliquez ici', 'cliquer ici', 'ici', 'click here', 'here', 'lien', 'link', 'en savoir plus', 'read more'];

class AgtcLink extends LitElement {
  static properties = {
    href:      { type: String },
    external:  { type: Boolean, reflect: true },
    underline: { type: String, reflect: true },
  };

  constructor() {
    super();
    this.href = '#';
    this.external = false;
    this.underline = 'always';
  }

  // External if explicitly requested, or if http(s) to another origin.
  get _isExternal() {
    if (this.external) return true;
    if (!/^https?:\/\//i.test(this.href || '')) return false;
    try { return new URL(this.href).origin !== globalThis.location?.origin; }
    catch { return false; }
  }

  updated() {
    const text = (this.textContent || '').trim().toLowerCase();
    if (text && GENERIC_TEXT.includes(text)) {
      console.warn(`[agtc-link] generic link text ("${text}") — prefer a descriptive label readable out of context (NN/g, WCAG 2.4.4).`);
    }
  }

  static styles = css`
    :host { display: inline; }

    a {
      color: var(--agtc-component-link-default-text);
      text-decoration: underline;
      text-underline-offset: 2px;
      border-radius: var(--agtc-semantic-radius-control-tight);
      cursor: pointer;
    }
    :host([underline="hover"]) a,
    :host([underline="none"]) a { text-decoration: none; }
    :host([underline="hover"]) a:hover { text-decoration: underline; }

    a:hover { color: var(--agtc-component-link-default-text-hover); }

    a:focus-visible {
      outline: 2px solid var(--agtc-component-link-default-border-focus);
      outline-offset: 2px;
    }

    .external-icon {
      display: inline-block;
      vertical-align: baseline;
      margin-left: 2px;
      line-height: 0;
    }

    .visually-hidden {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0);
      white-space: nowrap; border: 0;
    }
  `;

  render() {
    const ext = this._isExternal;
    return html`
      <a
        href="${this.href}"
        target="${ifDefined(ext ? '_blank' : undefined)}"
        rel="${ifDefined(ext ? 'noopener noreferrer' : undefined)}"
      ><slot></slot>${ext ? html`<span class="external-icon"><agtc-icon name="arrow-up-right" size="inline" decorative></agtc-icon></span><span class="visually-hidden"> (opens in a new tab)</span>` : ''}</a>
    `;
  }
}

customElements.define('agtc-link', AgtcLink);
export { AgtcLink };
