import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// On/off switch with IMMEDIATE EFFECT. Prefer over a checkbox when the
// change applies instantly (no "Save" button).
//
// State signaled by the POSITION of the knob (non-color indicator, WCAG 1.4.1),
// reinforced by the track color. Never color alone.
//
// States: off · on · hover · focus-visible · disabled
//
// Accessibility: hidden native <input type="checkbox" role="switch"> (role,
// keyboard via Space, name via the implicit <label>). Track/knob decorative.
//
// Events:
//   agtc-change → { checked, name, value } immediately on toggle
//
// UX reference patterns applied (ADR-036/039, all approved):
//   role=switch, immediate effect, state by position (not color alone),
//   concise label describing the "on" state — NN/g:
//     https://www.nngroup.com/articles/toggle-switch-guidelines/
//   Touch target ≥ 24px — IxDF: https://ixdf.org/literature/topics/ui-design-patterns
//   Details: guidelines/components/toggle.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

let _uid = 0;

class AgtcToggle extends LitElement {
  static properties = {
    checked:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name:     { type: String },
    value:    { type: String },
    label:    { type: String },
  };

  constructor() {
    super();
    this.checked  = false;
    this.disabled = false;
    this.value    = 'on';
    this._id      = `agtc-toggle-${++_uid}`;
  }

  updated() {
    if (!this.label && !this.textContent.trim()) {
      console.warn('[agtc-toggle] missing label — provide label="…" or slotted text (WCAG 4.1.2).');
    }
  }

  _handleChange(e) {
    this.checked = e.target.checked;
    // Immediate effect — the event fires on toggle, without a submit
    this.dispatchEvent(new CustomEvent('agtc-change', {
      bubbles: true, composed: true,
      detail: { checked: this.checked, name: this.name, value: this.value },
    }));
  }

  static styles = css`
    :host { display: inline-block; }
    :host([disabled]) { pointer-events: none; }

    .root {
      display: inline-flex;
      align-items: center;
      gap: var(--agtc-semantic-space-control-gap);
      min-height: 24px;            /* touch target ≥ 24px (WCAG 2.5.8) */
      cursor: pointer;
      font-family: inherit;
    }
    :host([disabled]) .root { cursor: not-allowed; }

    .native {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: 0;
      padding: 0;
      opacity: 0;
      pointer-events: none;
    }

    .track {
      position: relative;
      flex-shrink: 0;
      inline-size: 40px;
      block-size: 24px;
      border-radius: var(--agtc-semantic-radius-pill);
      background: var(--agtc-component-toggle-default-track-off);
      transition: background-color 0.15s;
    }
    .root:hover .track { background: var(--agtc-component-toggle-default-track-off-hover); }

    .knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: var(--agtc-semantic-radius-pill);
      background: var(--agtc-component-toggle-default-knob);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);  /* outlines the knob (WCAG 1.4.11) */
      transition: transform 0.15s;
    }

    :host([checked]) .track { background: var(--agtc-component-toggle-default-track-on); }
    :host([checked]) .root:hover .track { background: var(--agtc-component-toggle-default-track-on-hover); }
    :host([checked]) .knob { transform: translateX(16px); }

    .native:focus-visible + .track {
      outline: 2.5px solid var(--agtc-component-toggle-default-border-focus);
      outline-offset: 2px;
    }

    .label-text {
      font-size: var(--agtc-semantic-typography-body-size);
      line-height: var(--agtc-semantic-typography-body-line-height);
      color: var(--agtc-component-toggle-default-label);
    }
    .label-text:empty { display: none; }

    :host([disabled]) .track { opacity: 0.5; }
    :host([disabled]) .label-text { color: var(--agtc-semantic-color-text-disabled); }

    @media (prefers-reduced-motion: reduce) {
      .track, .knob { transition: none; }
    }
  `;

  render() {
    return html`
      <label class="root">
        <input
          class="native"
          id="${this._id}"
          type="checkbox"
          role="switch"
          name="${ifDefined(this.name)}"
          value="${ifDefined(this.value)}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          @change="${this._handleChange}"
        />
        <span class="track" aria-hidden="true"><span class="knob"></span></span>
        <span class="label-text"><slot>${this.label ?? ''}</slot></span>
      </label>
    `;
  }
}

customElements.define('agtc-toggle', AgtcToggle);
export { AgtcToggle };
