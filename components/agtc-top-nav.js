import { LitElement, html, css, nothing } from 'lit';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// Horizontal main navigation — full-height header visual-tabs pattern.
// Semantics: role=navigation (not role=tablist) + aria-current="page".
//
//   items = [{ label?, labelFr?, labelEn?, href, cta? }]
//     label    — single text (language-neutral)
//     labelFr  — French text (takes priority if data-lang="fr")
//     labelEn  — English text (takes priority if data-lang="en")
//     href     — destination URL
//     cta      — true → adoption button (Get started), breaks out of the tab pattern
//
//   current   — active pathname for automatic detection (default: window.location.pathname)
//   nav-label — aria-label of the <nav> element (required for AT)
//
// Bilingualism: the component observes document.documentElement[data-lang]
//   and automatically re-renders when the language changes.
//
// Mobile: the component manages its own responsive state.
//   Add the .open CSS class (or the open attribute) on the host to open it.
//   The site controls opening via: topNavEl.classList.toggle('open')
//
// CRITICAL DISTINCTION from agtc-tabs:
//   agtc-tabs    → role=tablist, in-page navigation, associated content panel
//   agtc-top-nav → role=navigation, cross-page navigation, aria-current="page"
//
// no-visited-nav rule (ADR-047): :visited neutralized on all links.
// UX reference patterns applied (ADR-060):
//   Main nav = navigation landmark — W3C WAI https://www.w3.org/WAI/ARIA/apg/
//   aria-current="page" on the active link — WCAG 2.4.4 + 4.1.2
//   Full-height border-bottom visual indicator — NN/g horizontal nav
//   CTA button visually distinct from the tabs — IxDF clear primary action
//   Details: guidelines/components/top-nav.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

const SECTIONS = ['tokens', 'components', 'foundations', 'decisions', 'agents', 'guidelines', 'pipelines'];

class AgtcTopNav extends LitElement {
  static properties = {
    items:    { type: Array },
    current:  { type: String },
    navLabel: { type: String, attribute: 'nav-label' },
    _lang:    { type: String, state: true },
  };

  constructor() {
    super();
    this.items    = [];
    this.current  = '';
    this.navLabel = 'Main navigation';
    this._lang    = 'fr';
    this._observer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.current && typeof window !== 'undefined') {
      this.current = window.location.pathname;
    }
    if (typeof document !== 'undefined') {
      this._lang = document.documentElement.dataset.lang || 'fr';
      this._observer = new MutationObserver(() => {
        this._lang = document.documentElement.dataset.lang || 'fr';
      });
      this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  _label(item) {
    if (this._lang === 'en') return item.labelEn || item.label || '';
    return item.labelFr || item.label || '';
  }

  _isActive(href) {
    const p = this.current;
    const parts = href.replace(/^(\.\.\/)+/, '/').split('/').filter(Boolean);
    const hFile = parts[parts.length - 1] || '';
    const hDir  = parts.length > 1 ? parts[parts.length - 2] : '';
    if (hDir && SECTIONS.includes(hDir)) return p.includes('/' + hDir + '/');
    if (hFile === 'index.html' && !hDir) {
      return p === '/' || (p.endsWith('/index.html') && SECTIONS.every(s => !p.includes('/' + s + '/')));
    }
    if (hFile) return p.endsWith('/' + hFile);
    return false;
  }

  static styles = css`
    :host {
      display: contents;
    }

    nav {
      display: flex;
      align-items: stretch;
      align-self: stretch;
      gap: 0;
      margin-left: auto;
    }

    /* ── Tab links (cross-page links) ── */
    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--agtc-component-top-nav-tab-color);
      font-size: var(--agtc-component-top-nav-tab-font-size);
      font-weight: var(--agtc-component-top-nav-tab-font-weight);
      padding: 0 var(--agtc-component-top-nav-tab-padding-x);
      border-radius: 0;
      border-bottom: var(--agtc-component-top-nav-tab-indicator-width) solid transparent;
      white-space: nowrap;
      transition: background .12s, color .12s, border-color .12s;
      -webkit-font-smoothing: antialiased;
    }

    /* :visited neutralized — ADR-047. Literal value for Safari (ADR-059). */
    a:visited { color: var(--agtc-component-top-nav-tab-color); }

    a:hover {
      background: var(--agtc-component-top-nav-tab-background-hover);
      color: var(--agtc-component-top-nav-tab-color-hover);
    }

    a:active {
      background: var(--agtc-component-top-nav-tab-background-hover);
      color: var(--agtc-component-top-nav-tab-color-hover);
    }

    a:focus-visible {
      outline: 2px solid var(--agtc-component-top-nav-tab-focus-ring);
      outline-offset: 2px;
    }

    /* Active page — border-bottom indicator, no filled background */
    a[aria-current="page"] {
      background: transparent;
      color: var(--agtc-component-top-nav-tab-color-active);
      font-weight: var(--agtc-component-top-nav-tab-font-weight-active);
      border-bottom-color: var(--agtc-component-top-nav-tab-indicator-color);
    }

    /* ── CTA button — breaks out of the tab pattern ── */
    a.cta {
      height: auto;
      align-self: center;
      padding: var(--agtc-component-top-nav-cta-padding-y) var(--agtc-component-top-nav-cta-padding-x);
      border-radius: var(--agtc-component-top-nav-cta-radius);
      border-bottom: none;
      background: var(--agtc-component-top-nav-cta-background);
      color: var(--agtc-component-top-nav-cta-color);
      font-weight: var(--agtc-component-top-nav-tab-font-weight);
      margin-left: var(--agtc-component-top-nav-cta-gap);
    }

    a.cta:visited { color: var(--agtc-component-top-nav-cta-color); }

    a.cta:hover,
    a.cta:active {
      background: var(--agtc-component-top-nav-cta-background-hover);
      color: var(--agtc-component-top-nav-cta-color);
    }

    /* The CTA carries no tab indicator even when it is "active" */
    a.cta[aria-current="page"] {
      background: var(--agtc-component-top-nav-cta-background);
      border-bottom: none;
    }

    /* ── Mobile: vertical drawer ──────────────────────────── */
    @media (max-width: 768px) {
      nav {
        display: none;
        position: fixed;
        top: var(--agtc-header-height, 64px);
        left: 0;
        right: 0;
        flex-direction: column;
        background: var(--agtc-semantic-color-background-surface);
        border-bottom: 1px solid var(--agtc-semantic-color-border-default);
        padding: var(--agtc-semantic-space-component-padding-sm) 0;
        z-index: 99;
        box-shadow: var(--agtc-shadow-md);
        margin-left: 0;
        align-self: auto;
      }

      /* Opened via the .open class on the host */
      :host(.open) nav {
        display: flex;
      }

      a {
        padding: var(--agtc-semantic-space-component-padding-md) 24px;
        border-bottom: none;
        border-radius: 0;
        font-size: var(--agtc-semantic-typography-label-size);
      }

      a[aria-current="page"] {
        border-bottom: none;
        border-left: 3px solid var(--agtc-component-top-nav-tab-indicator-color);
        padding-left: 21px;
        border-bottom-color: transparent;
      }

      a.cta {
        height: auto;
        align-self: unset;
        margin: var(--agtc-semantic-space-component-padding-xs) 16px;
        border-radius: var(--agtc-semantic-radius-control);
        border-bottom: none;
        padding: var(--agtc-semantic-space-component-padding-md) var(--agtc-semantic-space-component-padding-lg);
      }
    }
  `;

  render() {
    return html`
      <nav part="nav" aria-label="${this.navLabel}">
        ${this.items.map(item => {
          const active = this._isActive(item.href);
          return html`<a
            href="${item.href}"
            class="${item.cta ? 'cta' : ''}"
            aria-current="${active ? 'page' : nothing}"
          >${this._label(item)}</a>`;
        })}
      </nav>
    `;
  }
}

customElements.define('agtc-top-nav', AgtcTopNav);
export { AgtcTopNav };
