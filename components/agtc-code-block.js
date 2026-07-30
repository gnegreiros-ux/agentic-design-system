import { LitElement, html, css } from 'lit';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// READ-ONLY code block, copyable, on a dark surface.
// The code is provided via <slot> (HTML already escaped by the author).
//
//   language="html|json|css|javascript|…"  — language indicator (CD5)
//   filename="agtc-badge.js"               — optional header (CD8)
//   copy-label / copied-label              — button labels (default EN)
//
// OUT OF SCOPE v1 (door left open — ADR-041):
//   syntax highlighting (CD7) — v1 = high-contrast plain text, no
//     dependency (Prism/Shiki); line numbers (CD9).
//
// UX reference patterns applied (ADR-036/041, all approved CD1–CD9):
//   Semantic <pre><code> + language class — DEV/whitep4nth3r:
//     https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8
//   Copy button + text feedback — roboleary:
//     https://www.roboleary.net/2022/01/13/copy-code-to-clipboard-blog
//   Success announced to AT via role=status / aria-live — Sara Soueidan:
//     https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/
//   Horizontal scroll for long lines — NN/g:
//     https://www.nngroup.com/articles/design-pattern-guidelines/
//   Details: guidelines/components/code-block.md § UX Patterns Reference
// ────────────────────────────────────────────────────────────────────────────

class AgtcCodeBlock extends LitElement {
  static properties = {
    language:    { type: String },
    filename:    { type: String },
    copyLabel:   { type: String, attribute: 'copy-label' },
    copiedLabel: { type: String, attribute: 'copied-label' },
    _copied:     { state: true },
  };

  constructor() {
    super();
    this.copyLabel   = 'Copy';
    this.copiedLabel = 'Copied!';
    this._copied     = false;
  }

  static styles = css`
    :host {
      display: block;
      margin: var(--agtc-semantic-space-layout-component) 0;
    }

    .block {
      background: var(--agtc-component-code-block-default-background);
      border-radius: var(--agtc-component-code-block-default-radius);
      overflow: hidden;
    }

    /* Header: filename / language + copy button ────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--agtc-semantic-space-control-gap);
      padding: var(--agtc-semantic-space-component-padding-sm) var(--agtc-component-code-block-default-padding-x);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .meta {
      display: inline-flex;
      align-items: center;
      gap: var(--agtc-semantic-space-control-gap);
      color: var(--agtc-component-code-block-default-meta-text);
      font-size: var(--agtc-semantic-typography-detail-size);
      min-width: 0;
    }
    .filename {
      font-family: var(--agtc-semantic-typography-mono-family, monospace);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .language {
      text-transform: uppercase;
      letter-spacing: var(--agtc-semantic-typography-letter-spacing-wide, 0.06em);
      font-weight: var(--agtc-semantic-typography-label-weight, 500);
      flex-shrink: 0;
    }

    .copy {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--agtc-semantic-space-component-padding-xs);
      background: var(--agtc-component-code-block-default-copy-background);
      color: var(--agtc-component-code-block-default-copy-text);
      border: none;
      border-radius: var(--agtc-semantic-radius-control);
      padding: var(--agtc-semantic-space-component-padding-xs) 10px;
      font-family: inherit;
      font-size: var(--agtc-semantic-typography-detail-size);
      cursor: pointer;
    }
    .copy:hover {
      background: var(--agtc-component-code-block-default-copy-background-hover);
    }
    .copy:focus-visible {
      outline: 2px solid var(--agtc-component-code-block-default-border-focus);
      outline-offset: 2px;
    }

    pre {
      margin: 0;
      padding: var(--agtc-component-code-block-default-padding-y) var(--agtc-component-code-block-default-padding-x);
      overflow-x: auto;
    }
    ::slotted(code),
    code {
      color: var(--agtc-component-code-block-default-text);
      font-family: var(--agtc-semantic-typography-mono-family, monospace);
      font-size: var(--agtc-component-code-block-default-font-size);
      line-height: var(--agtc-semantic-typography-detail-line-height, 1.6);
      background: none;
      white-space: pre;
    }

    .visually-hidden {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0);
      white-space: nowrap; border: 0;
    }
  `;

  async _copy() {
    const text = (this.textContent || '').replace(/^\n+|\n+$/g, '');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.warn('[agtc-code-block] clipboard unavailable (insecure context?)');
      return;
    }
    this._copied = true;
    setTimeout(() => { this._copied = false; }, 1600);
  }

  render() {
    const ariaLabel = `${this.copyLabel}${this.language ? ` (${this.language})` : ''}`;
    return html`
      <div class="block">
        <div class="header">
          <span class="meta">
            ${this.filename ? html`<span class="filename">${this.filename}</span>` : ''}
            ${this.language ? html`<span class="language">${this.language}</span>` : ''}
          </span>
          <button class="copy" type="button" aria-label="${ariaLabel}" @click="${this._copy}">
            ${this._copied ? this.copiedLabel : this.copyLabel}
          </button>
        </div>
        <pre><code><slot></slot></code></pre>
      </div>
      <span class="visually-hidden" role="status" aria-live="polite">
        ${this._copied ? this.copiedLabel : ''}
      </span>
    `;
  }
}

customElements.define('agtc-code-block', AgtcCodeBlock);
export { AgtcCodeBlock };
