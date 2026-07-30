import { LitElement, html, css } from 'lit';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Radio button — one choice within a mutually exclusive set. Always used
// inside an <agtc-radio-group>, which handles exclusivity, roving focus and
// keyboard navigation (<input radio> elements in separate shadow DOMs do not
// form a native group — see ADR-038).
//
// Shape: ROUND — NN/g convention (a square signals a checkbox).
//
// States: default · hover · focus-visible · selected · disabled
//
// Accessibility: host `role="radio"` + `aria-checked`; the group carries
// `role="radiogroup"`. Roving tabindex driven by the group.
//
// UX reference patterns applied (ADR-036/038, all approved):
//   Round shape, exclusive selection, clickable label (Fitts) — NN/g:
//     https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/
//   Pre-selecting a sensible default (usage guidance) — NN/g:
//     https://www.nngroup.com/articles/radio-buttons-default-selection/
//   Touch target ≥ 24px — IxDF: https://ixdf.org/literature/topics/ui-design-patterns
//   Details: guidelines/components/radio.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

class AgtcRadio extends LitElement {
  static properties = {
    checked:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    value:    { type: String },
    label:    { type: String },
  };

  constructor() {
    super();
    this.checked  = false;
    this.disabled = false;
    this.value    = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'radio');
    this._onClick = () => {
      if (this.disabled) return;
      // The parent group decides exclusivity — we just signal the intent
      this.dispatchEvent(new CustomEvent('agtc-radio-select', {
        bubbles: true, composed: true, detail: { value: this.value },
      }));
    };
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    super.disconnectedCallback();
  }

  updated() {
    this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    // Safety net when the radio is used outside a group: stays focusable
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', this.checked ? '0' : '-1');
    }
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--agtc-semantic-space-control-gap);
      min-height: 24px;            /* touch target ≥ 24px (WCAG 2.5.8) */
      cursor: pointer;
      font-family: inherit;
      outline: none;
    }
    :host([disabled]) { cursor: not-allowed; }

    .control {
      position: relative;
      flex-shrink: 0;
      box-sizing: border-box;
      inline-size: var(--agtc-semantic-icon-size-control);
      block-size: var(--agtc-semantic-icon-size-control);
      border: 1.5px solid var(--agtc-component-radio-default-border);
      border-radius: var(--agtc-semantic-radius-pill);       /* round — radio convention */
      background: var(--agtc-component-radio-default-background);
      transition: border-color 0.12s;
    }
    :host(:hover:not([disabled])) .control {
      border-color: var(--agtc-component-radio-default-border-hover);
    }
    :host(:focus-visible) .control {
      outline: 2.5px solid var(--agtc-component-radio-default-border-focus);
      outline-offset: 2px;
    }
    :host([checked]) .control {
      border-color: var(--agtc-component-radio-default-fill);
    }
    :host([checked]:hover:not([disabled])) .control {
      border-color: var(--agtc-component-radio-default-fill-hover);
    }

    .dot {
      position: absolute;
      inset: 0;
      margin: auto;
      width: 50%;
      height: 50%;
      border-radius: var(--agtc-semantic-radius-pill);
      background: var(--agtc-component-radio-default-fill);
      transform: scale(0);
      transition: transform 0.12s;
    }
    :host([checked]) .dot { transform: scale(1); }
    :host([checked]:hover:not([disabled])) .dot {
      background: var(--agtc-component-radio-default-fill-hover);
    }

    .label-text {
      font-size: var(--agtc-semantic-typography-body-size);
      line-height: var(--agtc-semantic-typography-body-line-height);
      color: var(--agtc-component-radio-default-label);
    }
    .label-text:empty { display: none; }

    /* Disabled */
    :host([disabled]) .control {
      background: var(--agtc-semantic-color-background-subtle);
      border-color: var(--agtc-semantic-color-border-default);
    }
    :host([disabled][checked]) .control,
    :host([disabled][checked]) .dot {
      border-color: var(--agtc-semantic-color-action-primary-disabled);
      background: var(--agtc-semantic-color-action-primary-disabled);
    }
    :host([disabled]) .label-text {
      color: var(--agtc-semantic-color-text-disabled);
    }

    @media (prefers-reduced-motion: reduce) {
      .control, .dot { transition: none; }
    }
  `;

  render() {
    return html`
      <span class="control" aria-hidden="true"><span class="dot"></span></span>
      <span class="label-text"><slot>${this.label ?? ''}</slot></span>
    `;
  }
}

customElements.define('agtc-radio', AgtcRadio);
export { AgtcRadio };
