import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

// ─── CONTRACT ───────────────────────────────────────────────────────────────
// width/height are REQUIRED — they reserve the aspect-ratio and prevent CLS.
// alt is REQUIRED unless decorative is set (WCAG 1.1.1).
//
// loading="lazy" by default; priority sets loading="eager" + fetchpriority="high"
// (use on the single LCP image only, e.g. an above-the-fold hero).
//
// src-webp is optional — when set, renders a <picture> with a WebP <source> and
// src as the fallback format. No automatic format conversion happens here; both
// files must already exist (this repo does no build-time image processing).
//
// skeleton is opt-in — reserved for heavy/hero images; unnecessary overhead for
// small inline images (icons, avatars, thumbnails).
//
// UX reference patterns applied (ADR-036, all approved):
//   Decorative vs meaningful image distinction (alt="" + aria-hidden), mirrors
//     the same pattern already approved on agtc-icon — WCAG 1.1.1 / NN/g:
//     https://www.nngroup.com/articles/design-pattern-guidelines/
//   Skeleton screen while loading (opt-in) — NN/g Skeleton Screens 101:
//     https://www.nngroup.com/articles/skeleton-screens/
//   Graceful fallback on load failure (icon + visible alt) instead of a broken-image hole.
//   object-fit configurable (cover/contain/fill) for consistent cropping behavior.
//   Details: guidelines/components/image.md § UX Patterns Reference
// ─────────────────────────────────────────────────────────────────────────────

class AgtcImage extends LitElement {
  static properties = {
    src:        { type: String },
    srcWebp:    { type: String, attribute: 'src-webp' },
    alt:        { type: String },
    decorative: { type: Boolean },
    width:      { type: Number },
    height:     { type: Number },
    fit:        { type: String },
    priority:   { type: Boolean },
    skeleton:   { type: Boolean },
    _loaded:    { type: Boolean, state: true },
    _errored:   { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.decorative = false;
    this.fit        = 'cover';
    this.priority   = false;
    this.skeleton   = false;
    this._loaded    = false;
    this._errored   = false;
  }

  updated(changed) {
    if ((changed.has('alt') || changed.has('decorative') || changed.has('src')) && !this.decorative && !this.alt) {
      console.warn('[agtc-image] Missing alt text — inaccessible (WCAG 1.1.1). Add alt="…" or set decorative.');
    }
    if ((changed.has('width') || changed.has('height')) && (!this.width || !this.height)) {
      console.warn('[agtc-image] Missing width/height — layout shift (CLS) will occur. Set both attributes.');
    }
  }

  static styles = css`
    /* flex: 1 1 auto only takes effect when the immediate parent is a flex
       container — harmless elsewhere. Without it, a host whose only sizing
       comes from percentage-width shadow DOM content collapses to 0×0 as a
       flex item (the frame's width:100% has nothing non-percentage to
       resolve against during the flex-basis/min-content calculation). */
    :host { display: block; flex: 1 1 auto; }

    .frame {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .img, .skeleton, .fallback {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .img { display: block; }
    .img.fit-cover   { object-fit: cover; }
    .img.fit-contain { object-fit: contain; }
    .img.fit-fill    { object-fit: fill; }

    /* ── Skeleton (opt-in) ─────────────────────────────────────────────────── */
    .skeleton {
      background: var(--agtc-component-image-skeleton-background);
      animation: agtc-image-pulse 1.6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton { animation: none; }
    }
    @keyframes agtc-image-pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.6; background: var(--agtc-component-image-skeleton-background-pulse); }
    }

    /* ── Fallback (image failed to load) ──────────────────────────────────── */
    .fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--agtc-semantic-space-component-padding-xs);
      background: var(--agtc-component-image-fallback-background);
      color: var(--agtc-component-image-fallback-icon);
      text-align: center;
      padding: var(--agtc-semantic-space-component-padding-sm);
    }
    .fallback-text {
      font-size: var(--agtc-semantic-typography-detail-size);
      color: var(--agtc-component-image-fallback-text);
    }
  `;

  _handleLoad() {
    this._loaded = true;
  }

  _handleError() {
    this._errored = true;
    console.warn(`[agtc-image] Failed to load "${this.src}".`);
  }

  _renderFallback() {
    return html`
      <div class="fallback" role="img" aria-label="${ifDefined(this.decorative ? undefined : (this.alt || 'Image unavailable'))}">
        <agtc-icon name="image-off" size="control" decorative></agtc-icon>
        ${!this.decorative && this.alt ? html`<span class="fallback-text">${this.alt}</span>` : ''}
      </div>
    `;
  }

  _renderImg() {
    const img = html`
      <img
        class="img fit-${this.fit || 'cover'}"
        src="${ifDefined(this.src)}"
        width="${ifDefined(this.width)}"
        height="${ifDefined(this.height)}"
        loading="${this.priority ? 'eager' : 'lazy'}"
        fetchpriority="${ifDefined(this.priority ? 'high' : undefined)}"
        alt="${this.decorative ? '' : (this.alt || '')}"
        aria-hidden="${this.decorative ? 'true' : 'false'}"
        @load="${this._handleLoad}"
        @error="${this._handleError}"
      >
    `;
    if (this.srcWebp) {
      return html`<picture><source srcset="${this.srcWebp}" type="image/webp">${img}</picture>`;
    }
    return img;
  }

  render() {
    const ratio = (this.width && this.height) ? `${this.width} / ${this.height}` : '';
    const showSkeleton = this.skeleton && !this._loaded && !this._errored;

    return html`
      <div class="frame" style="${ratio ? `aspect-ratio:${ratio}` : ''}">
        ${this._errored ? this._renderFallback() : this._renderImg()}
        ${showSkeleton ? html`<div class="skeleton"></div>` : ''}
      </div>
    `;
  }
}

customElements.define('agtc-image', AgtcImage);
export { AgtcImage };
