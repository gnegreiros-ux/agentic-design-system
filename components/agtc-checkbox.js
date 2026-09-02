import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Independent binary selection: check / uncheck an option, mark a task done.
// For a setting with immediate effect (on/off), prefer a toggle
// (cf. NN/g — checkbox vs toggle).
//
// Shape: SQUARE only — NN/g convention (a circle conventionally signals
// a radio button). Approved decision, see ADR-037.
//
// States: default · hover · focus-visible · checked · indeterminate · disabled
//
// Clickable label: clicking the box OR the text toggles the state (Fitts's law).
// Interactive target ≥ 24px tall (WCAG 2.5.8).
//
// The accessible element is a native <input type="checkbox"> (role, checked
// state, keyboard handling, name via the implicit <label>). The styled box is
// decorative.
//
// Events:
//   agtc-change → { checked, name, value } on every toggle
//
// UX reference patterns applied (ADR-036/037, all approved):
//   Checkbox (not toggle) for an independent item — NN/g:
//     https://www.nngroup.com/articles/toggle-switch-guidelines/
//   Square shape, clickable label (Fitts), positive wording — NN/g:
//     https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/
//   Touch target ≥ 24px, visible states, no deceptive pre-checking — IxDF:
//     https://ixdf.org/literature/topics/ui-design-patterns
//   Details: guidelines/components/checkbox.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

let _uid = 0;

class AgtcCheckbox extends LitElement {
  static properties = {
    checked:       { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    disabled:      { type: Boolean, reflect: true },
    required:      { type: Boolean, reflect: true },
    name:          { type: String },
    value:         { type: String },
    label:         { type: String },
  };

  constructor() {
    super();
    this.checked       = false;
    this.indeterminate = false;
    this.disabled      = false;
    this.required      = false;
    this.value         = 'on';
    this._id           = `agtc-checkbox-${++_uid}`;
  }

  updated() {
    // indeterminate is only expressed via the DOM property, never via an HTML attribute
    const input = this.shadowRoot?.querySelector('input');
    if (input) input.indeterminate = this.indeterminate;

    if (!this.label && !this.textContent.trim()) {
      console.warn('[agtc-checkbox] missing label — provide label="…" or slotted text (WCAG 4.1.2).');
    }
  }

  _handleChange(e) {
    this.checked = e.target.checked;
    this.indeterminate = false; // checking/unchecking clears the indeterminate state
    this.dispatchEvent(new CustomEvent('agtc-change', {
      bubbles: true,
      composed: true,
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

    /* Native input: accessible (keyboard, AT) but visually hidden */
    .native {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: 0;
      padding: 0;
      opacity: 0;
      pointer-events: none;
    }

    /* Styled box — decorative (aria-hidden) */
    .box {
      position: relative;
      flex-shrink: 0;
      inline-size: var(--agtc-semantic-icon-size-control);
      block-size: var(--agtc-semantic-icon-size-control);
      border: 1.5px solid var(--agtc-component-checkbox-default-border);
      border-radius: var(--agtc-component-checkbox-default-radius);
      background: var(--agtc-component-checkbox-default-background);
      transition: background-color 0.12s, border-color 0.12s;
    }

    .root:hover .box {
      border-color: var(--agtc-component-checkbox-default-border-hover);
    }

    /* Keyboard focus → visible ring on the box */
    .native:focus-visible + .box {
      outline: 2.5px solid var(--agtc-component-checkbox-default-border-focus);
      outline-offset: 2px;
    }

    /* Checked or indeterminate → primary fill */
    :host([checked]) .box,
    :host([indeterminate]) .box {
      background: var(--agtc-component-checkbox-default-fill);
      border-color: var(--agtc-component-checkbox-default-fill);
    }
    :host([checked]) .root:hover .box,
    :host([indeterminate]) .root:hover .box {
      background: var(--agtc-component-checkbox-default-fill-hover);
      border-color: var(--agtc-component-checkbox-default-fill-hover);
    }

    /* Glyphs — check mark and dash (indeterminate), via the shared agtc-icon/Lucide set */
    .check,
    .dash {
      position: absolute;
      inset: 0;
      margin: auto;
      --agtc-icon-size: calc(var(--agtc-semantic-icon-size-control) * 0.78);
      color: var(--agtc-component-checkbox-default-check);
      opacity: 0;
      pointer-events: none;
    }
    :host([checked]:not([indeterminate])) .check { opacity: 1; }
    :host([indeterminate]) .dash { opacity: 1; }

    .label-text {
      font-size: var(--agtc-semantic-typography-body-size);
      line-height: var(--agtc-semantic-typography-body-line-height);
      color: var(--agtc-component-checkbox-default-label);
    }
    .label-text:empty { display: none; }

    /* Disabled */
    :host([disabled]) .box {
      background: var(--agtc-semantic-color-background-subtle);
      border-color: var(--agtc-semantic-color-border-default);
    }
    :host([disabled][checked]) .box,
    :host([disabled][indeterminate]) .box {
      background: var(--agtc-semantic-color-action-primary-disabled);
      border-color: var(--agtc-semantic-color-action-primary-disabled);
    }
    :host([disabled]) .label-text {
      color: var(--agtc-semantic-color-text-disabled);
    }

    @media (prefers-reduced-motion: reduce) {
      .box { transition: none; }
    }
  `;

  render() {
    return html`
      <label class="root">
        <input
          class="native"
          id="${this._id}"
          type="checkbox"
          name="${ifDefined(this.name)}"
          value="${ifDefined(this.value)}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required ? 'true' : 'false'}"
          @change="${this._handleChange}"
        />
        <span class="box" aria-hidden="true">
          <agtc-icon class="check" name="check" decorative></agtc-icon>
          <agtc-icon class="dash" name="minus" decorative></agtc-icon>
        </span>
        <span class="label-text"><slot>${this.label ?? ''}</slot></span>
      </label>
    `;
  }
}

customElements.define('agtc-checkbox', AgtcCheckbox);
export { AgtcCheckbox };
