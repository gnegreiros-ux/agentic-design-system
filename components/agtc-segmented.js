import { LitElement, html, css } from 'lit';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// SINGLE-SELECT segmented control with IMMEDIATE EFFECT (2–5 short options).
//
//   .options = [{ value, label, icon? } | "Label"]
//   value="…"        — selected value (always exactly one, SG1)
//   label="…"        — aria-label of the group (required for accessibility)
//   equal-width      — equal-width segments
//
// Emits `change` (detail: { value }) on every selection.
//
// ARIA PATTERN (SG2, deliberate divergence vs agtc-radio-group): group of
// <button> with aria-current on the active segment, native Tab navigation
// (NO arrow keys), immediate effect — recommended by Primer for an instant
// setting (≠ radiogroup which implies submission, ≠ tablist which switches panels).
//
// UX reference patterns applied (ADR-036/044, all approved SG1–SG8):
//   Button group + aria-current + immediate effect — Primer:
//     https://primer.style/product/components/segmented-control/accessibility/
//   Selected state not by color alone (solid background + weight) — WCAG 1.4.1
//   Details: guidelines/components/segmented.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

class AgtcSegmented extends LitElement {
  static properties = {
    options:    { type: Array },
    value:      { type: String },
    label:      { type: String },
    equalWidth: { type: Boolean, attribute: 'equal-width' },
  };

  constructor() {
    super();
    this.options = [];
    this.value = '';
    this.equalWidth = false;
  }

  updated() {
    if (!this.label) {
      console.warn('[agtc-segmented] no label — the group must be named for AT. Add label="…".');
    }
  }

  _opt(o) {
    if (typeof o === 'string') return { value: o, label: o };
    return { value: o.value, label: o.label ?? o.value, icon: o.icon };
  }

  _select(value) {
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true, composed: true }));
  }

  static styles = css`
    :host { display: inline-block; }

    .track {
      display: inline-flex;
      gap: var(--agtc-semantic-space-component-padding-2xs);
      padding: var(--agtc-semantic-space-component-padding-2xs);
      background: var(--agtc-component-segmented-default-track-background);
      border-radius: var(--agtc-component-segmented-default-radius);
    }
    :host([equal-width]) .track { display: flex; }

    button {
      flex: 1 1 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--agtc-semantic-space-component-padding-xs);
      padding: var(--agtc-semantic-space-component-padding-xs) var(--agtc-semantic-space-component-padding-md);
      border: none;
      border-radius: calc(var(--agtc-component-segmented-default-radius) - 2px);
      background: none;
      color: var(--agtc-component-segmented-default-text);
      font-family: inherit;
      font-size: var(--agtc-semantic-typography-label-size);
      font-weight: var(--agtc-semantic-typography-label-weight);
      line-height: 1.2;
      white-space: nowrap;
      cursor: pointer;
      transition: background .12s, color .12s;
    }
    button:hover { color: var(--agtc-component-segmented-default-text-hover); }

    /* Selected state: solid background + contrasted text (not color alone, SG4) */
    button[aria-current="true"] {
      background: var(--agtc-component-segmented-default-selected-background);
      color: var(--agtc-component-segmented-default-selected-text);
      font-weight: 700;
    }

    button:focus-visible {
      outline: 2px solid var(--agtc-component-segmented-default-border-focus);
      outline-offset: 2px;
    }
  `;

  render() {
    const opts = (this.options || []).map((o) => this._opt(o));
    return html`
      <div class="track" role="group" aria-label="${this.label || ''}">
        ${opts.map((o) => html`
          <button
            type="button"
            aria-current="${this.value === o.value ? 'true' : 'false'}"
            @click="${() => this._select(o.value)}"
          >
            ${o.icon ? html`<agtc-icon name="${o.icon}" size="inline" decorative></agtc-icon>` : ''}
            ${o.label}
          </button>
        `)}
      </div>
    `;
  }
}

customElements.define('agtc-segmented', AgtcSegmented);
export { AgtcSegmented };
