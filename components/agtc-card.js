import { LitElement, html, css } from 'lit';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Variants : default (border) | elevated (shadow) | flat (subtle background)
// Padding  : none | sm | md (default) | lg
//
// Slots:
//   slot[name="header"] → automatic bottom separator when content is present
//   slot (default)      → card body
//   slot[name="footer"] → automatic top separator when content is present
//
// Non-interactive by default.
//
// UX reference patterns applied (ADR-036; C1/C3/C4 approved, C2 revised):
//   Clustering of related content — Dashboard: https://dashboarddesignpatterns.github.io/patterns.html
//   Clickable card (C2 revised): 1 destination → wrapping link; distinct actions →
//     primary link as ::after overlay + buttons above, OR non-interactive container.
//     Never nested interactive elements — Smashing: https://www.smashingmagazine.com/category/design-patterns/
//   Hierarchy via elevation, not color alone (Dashboard).
//   Detail-on-demand: the card summarizes, details open elsewhere (Dashboard).
//   Details: guidelines/components/card.md § UX Patterns Reference
// For a clickable card, place an <a> or <agtc-button> inside.
// ────────────────────────────────────────────────────────────────────────────

class AgtcCard extends LitElement {
  static properties = {
    variant:     { type: String },
    padding:     { type: String },
    _hasHeader:  { type: Boolean, state: true },
    _hasFooter:  { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.variant    = 'default';
    this.padding    = 'md';
    this._hasHeader = false;
    this._hasFooter = false;
  }

  _onHeaderSlotChange(e) {
    this._hasHeader = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onFooterSlotChange(e) {
    this._hasFooter = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  static styles = css`
    :host {
      display: block;
      /* Typography exposed via CSS custom properties — override via component tokens.
         Defaults match the Product SaaS context (14px/14px/12px).
         In Marketing context (data-context="marketing" on <body>), the site overrides
         these tokens via --agtc-component-card-typography-marketing-* in siteCSS(). */
      --card-title-size:       var(--agtc-component-card-typography-title-size,        var(--agtc-semantic-typography-label-size));
      --card-title-weight:     var(--agtc-component-card-typography-title-weight,      var(--agtc-semantic-fontWeight-bold));
      --card-title-line-height:var(--agtc-component-card-typography-title-line-height, var(--agtc-semantic-typography-label-bold-line-height));
      --card-body-size:        var(--agtc-component-card-typography-body-size,         var(--agtc-semantic-typography-label-size));
      --card-body-weight:      var(--agtc-component-card-typography-body-weight,       var(--agtc-semantic-typography-label-weight));
      --card-body-line-height: var(--agtc-component-card-typography-body-line-height,  var(--agtc-semantic-typography-body-line-height));
      --card-meta-size:        var(--agtc-component-card-typography-meta-size,         var(--agtc-semantic-typography-detail-size));
      --card-meta-weight:      var(--agtc-component-card-typography-meta-weight,       var(--agtc-semantic-typography-detail-weight));
    }

    /* ── Typography of direct slotted elements ─────────────────────────────── */
    ::slotted(h1),::slotted(h2),::slotted(h3),::slotted(h4),::slotted(h5),::slotted(h6){
      font-size: var(--card-title-size);
      font-weight: var(--card-title-weight);
      line-height: var(--card-title-line-height);
    }
    ::slotted(p){
      font-size: var(--card-body-size);
      font-weight: var(--card-body-weight);
      line-height: var(--card-body-line-height);
    }
    /* Meta / secondary label — <small> is the semantic HTML tag for side notes */
    ::slotted(small){
      font-size: var(--card-meta-size);
      font-weight: var(--card-meta-weight);
    }

    /* ── Base ──────────────────────────────────────────────────────────────── */
    .card {
      border-radius: var(--agtc-component-card-default-radius);
      overflow: hidden;
    }

    /* ── Variant default ───────────────────────────────────────────────────── */
    .card.default {
      background: var(--agtc-component-card-default-background);
      border: 1px solid var(--agtc-component-card-default-border);
    }

    /* ── Variant elevated ──────────────────────────────────────────────────── */
    .card.elevated {
      background: var(--agtc-component-card-elevated-background);
      border: 1px solid var(--agtc-component-card-elevated-border);
      box-shadow: var(--agtc-component-card-elevated-shadow);
    }

    /* ── Variant flat ──────────────────────────────────────────────────────── */
    .card.flat {
      background: var(--agtc-component-card-flat-background);
      border: 1px solid var(--agtc-component-card-flat-border);
    }

    /* ── Padding ───────────────────────────────────────────────────────────── */
    .card.padding-none .header,
    .card.padding-none .body,
    .card.padding-none .footer {
      padding: var(--agtc-component-card-padding-none);
    }
    .card.padding-sm .header,
    .card.padding-sm .body,
    .card.padding-sm .footer {
      padding: var(--agtc-component-card-padding-sm);
    }
    .card.padding-md .header,
    .card.padding-md .body,
    .card.padding-md .footer {
      padding: var(--agtc-component-card-default-padding);
    }
    .card.padding-lg .header,
    .card.padding-lg .body,
    .card.padding-lg .footer {
      padding: var(--agtc-component-card-padding-lg);
    }

    /* ── Sections ──────────────────────────────────────────────────────────── */
    .header {
      border-bottom: 1px solid var(--agtc-component-card-default-border);
    }
    .footer {
      border-top: 1px solid var(--agtc-component-card-default-border);
    }

    /* No separator on flat and elevated */
    .card.elevated .header,
    .card.flat     .header {
      border-bottom-color: var(--agtc-semantic-color-border-default);
    }
    .card.elevated .footer,
    .card.flat     .footer {
      border-top-color: var(--agtc-semantic-color-border-default);
    }

    .header[hidden],
    .footer[hidden] {
      display: none;
    }

    /* Removes the body's padding-bottom when a footer is present, and padding-top
       when a header is present. Avoids double spacing at the separators. */
    .has-header .body { padding-top: 0; }
    .has-footer .body { padding-bottom: 0; }
  `;

  render() {
    const paddingCls = `padding-${this.padding || 'md'}`;
    const cls = [
      'card',
      this.variant || 'default',
      paddingCls,
      this._hasHeader ? 'has-header' : '',
      this._hasFooter ? 'has-footer' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${cls}">
        <div
          class="header"
          ?hidden="${!this._hasHeader}"
        >
          <slot
            name="header"
            @slotchange="${this._onHeaderSlotChange}"
          ></slot>
        </div>

        <div class="body">
          <slot></slot>
        </div>

        <div
          class="footer"
          ?hidden="${!this._hasFooter}"
        >
          <slot
            name="footer"
            @slotchange="${this._onFooterSlotChange}"
          ></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('agtc-card', AgtcCard);
export { AgtcCard };
