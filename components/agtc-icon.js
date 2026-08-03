import { LitElement, html, css } from 'lit';
import { icons } from 'lucide';

// ─── UX REFERENCE PATTERNS (ADR-036, all approved) ───────────────────────────
//   Icon + text when the meaning is not universal — NN/g icon usability:
//     https://www.nngroup.com/articles/design-pattern-guidelines/
//   Label required when the icon carries the information; decorative → aria-hidden.
//   Consistent, non-deceptive meaning (IF — transparency):
//     https://catalogue.projectsbyif.com/
//   Details: guidelines/components/icon.md § UX Patterns Reference
// ─────────────────────────────────────────────────────────────────────────────

class AgtcIcon extends LitElement {
  static properties = {
    name:      { type: String },
    size:      { type: String },  // 'inline' | 'control' | 'nav'
    label:     { type: String },
    decorative:{ type: Boolean }
  };

  static styles = css`
    :host { display: inline-flex; align-items: center; justify-content: center; }

    svg {
      width: var(--agtc-icon-size, var(--agtc-semantic-icon-size-control));
      height: var(--agtc-icon-size, var(--agtc-semantic-icon-size-control));
      stroke: currentColor;
      stroke-width: var(--agtc-icon-stroke-width, var(--agtc-semantic-icon-strokeWidth-control));
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    :host([size='inline'])  { --agtc-icon-size: var(--agtc-semantic-icon-size-inline); --agtc-icon-stroke-width: var(--agtc-semantic-icon-strokeWidth-inline); }
    :host([size='control']) { --agtc-icon-size: var(--agtc-semantic-icon-size-control); --agtc-icon-stroke-width: var(--agtc-semantic-icon-strokeWidth-control); }
    :host([size='nav'])     { --agtc-icon-size: var(--agtc-semantic-icon-size-nav); --agtc-icon-stroke-width: var(--agtc-semantic-icon-strokeWidth-nav); }
  `;

  render() {
    if (!this.name) return html``;

    const ariaAttrs = this.decorative
      ? { 'aria-hidden': 'true', role: 'none' }
      : { 'aria-label': this.label || this.name, role: 'img' };

    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden=${ariaAttrs['aria-hidden'] || 'false'}
        aria-label=${ariaAttrs['aria-label'] || ''}
        role=${ariaAttrs.role}
        data-lucide=${this.name}
      ></svg>
    `;
  }

  updated() {
    const svg = this.shadowRoot?.querySelector('svg[data-lucide]');
    if (!svg || !this.name) return;
    const iconName = this.name
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    const iconDef = icons[iconName];
    if (!iconDef) {
      console.warn(`[agtc-icon] Icon "${this.name}" not found in Lucide.`);
      return;
    }
    // Lucide v1.x: iconDef is directly an array of [tag, attrs]
    svg.innerHTML = iconDef
      .map(([tag, a]) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(a).forEach(([k, v]) => el.setAttribute(k, v));
        return el.outerHTML;
      })
      .join('');
  }
}

customElements.define('agtc-icon', AgtcIcon);
export { AgtcIcon };
