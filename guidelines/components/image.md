# Component: Image — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-07-21
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/image.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/performance.md
> **Relations:** tokens/component.json, .claude/rules/performance.md, DESIGN.md

---

## Intent

**Why this component exists:**
Render a raster image with the performance and accessibility guarantees a plain
`<img>` doesn't enforce by default: reserved layout space (no CLS), lazy loading,
WebP support with a fallback format, and graceful loading/error states.

**This component is not:**
- An SVG illustration loader (use the `illus-lazy` pattern, `.claude/rules/performance.md`)
- A background/decorative image applied via CSS (use `background-image` directly)
- An icon (use `<agtc-icon>`)

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|---------|-------------|
| `src` | String | — | Image source (fallback format if `src-webp` is set) |
| `src-webp` | String | — | Optional WebP source. When set, renders a `<picture>` with a WebP `<source>` and `src` as the fallback. No automatic conversion — both files must already exist |
| `alt` | String | — | **Required unless `decorative`** — WCAG 1.1.1 |
| `decorative` | Boolean | `false` | Purely decorative image → `alt=""` + `aria-hidden` |
| `width` | Number | — | **Required** — intrinsic pixel width, reserves aspect-ratio (anti-CLS) |
| `height` | Number | — | **Required** — intrinsic pixel height, reserves aspect-ratio (anti-CLS) |
| `fit` | String | `cover` | `cover` \| `contain` \| `fill` — cropping behavior within the reserved box |
| `priority` | Boolean | `false` | LCP / above-the-fold image — sets `loading="eager"` + `fetchpriority="high"`. Use on at most one image per page |
| `skeleton` | Boolean | `false` | Opt-in pulse placeholder shown while loading. Reserved for heavy/hero images — unnecessary overhead for small inline images |

---

## Tokens used

| Property | Token |
|-----------|-------|
| Skeleton background | `component.image.skeleton.background` |
| Skeleton pulse tone | `component.image.skeleton.background-pulse` |
| Fallback background | `component.image.fallback.background` |
| Fallback icon color | `component.image.fallback.icon` |
| Fallback text color | `component.image.fallback.text` |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| `alt` required | Unless `decorative` — console warning if neither is set (WCAG 1.1.1) |
| Decorative image | `alt=""` + `aria-hidden="true"` |
| Fallback state | `role="img"` + `aria-label` carrying the same alt text (or omitted if decorative) |
| Skeleton | Purely visual — no ARIA live region; a loading image is not an interactive busy state |
| Reduced motion | The skeleton pulse animation is disabled under `prefers-reduced-motion: reduce` — a static subtle background is shown instead |

---

## Behaviors

- `width`/`height` reserve the aspect-ratio via CSS `aspect-ratio` on the wrapping frame — missing either logs a console warning (defeats the component's core anti-CLS purpose).
- `loading="lazy"` by default; `priority` switches to `loading="eager"` + `fetchpriority="high"` for the single LCP image on a page.
- On load failure (`error` event): the image is replaced by a fallback (generic icon + visible alt text if present), never a broken-image hole.
- `src-webp` wraps the image in a `<picture>` with a WebP `<source>`; the browser picks WebP where supported, falling back to `src` otherwise. The component does no image processing or conversion.

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Omitting `width`/`height` | Defeats the component's purpose — layout shift (CLS) still occurs |
| `alt` on a purely decorative image | Redundant noise for screen reader users — use `decorative` instead |
| `decorative` on a meaningful image | Hides real content from assistive technology — WCAG 1.1.1 violation |
| `skeleton` on every small/inline image | Unnecessary visual noise and overhead — reserve for heavy/hero images |
| `priority` on more than one image per page | Defeats its purpose — only the true LCP image should preempt bandwidth |
| Hardcoded color for the skeleton/fallback | Bypasses semantic tokens |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036). Decision: **all approved**, skeleton explicitly requested for v1.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Decorative vs meaningful image distinction | [WCAG 1.1.1](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html) / [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Mirrors the pattern already approved on `agtc-icon` — `decorative` prop → `alt=""` + `aria-hidden` |
| Skeleton screen while loading (opt-in) | [NN/g — Skeleton Screens 101](https://www.nngroup.com/articles/skeleton-screens/) | ✅ | Included in v1 per explicit human decision (2026-07-21) — opt-in via `skeleton`, not on by default, since it's overkill for small inline images |
| Graceful fallback on load failure | General error-handling principle (no dedicated reference-source article found for images specifically) | ✅ | Icon + visible alt text instead of a broken-image hole |
| `object-fit` configurable | Design system decision (not a reference-source pattern) | ✅ | `fit` prop, default `cover` — consistent cropping across avatar/illustration usages |

---

## Implementation

### Web Component (Lit)
```html
<!-- Basic — width/height required -->
<agtc-image src="photo.jpg" alt="A description of the photo" width="800" height="450"></agtc-image>

<!-- WebP with fallback -->
<agtc-image src="photo.jpg" src-webp="photo.webp" alt="A description of the photo" width="800" height="450"></agtc-image>

<!-- Opt-in skeleton (heavy/hero images) -->
<agtc-image src="hero.jpg" alt="Hero image" width="1200" height="630" skeleton></agtc-image>

<!-- LCP / above-the-fold image -->
<agtc-image src="hero.jpg" alt="Hero image" width="1200" height="630" priority></agtc-image>

<!-- Decorative -->
<agtc-image src="pattern.jpg" decorative width="600" height="300"></agtc-image>

<!-- object-fit -->
<agtc-image src="wide-photo.jpg" alt="A description" width="220" height="220" fit="contain"></agtc-image>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a `fit` value | Design system team |
| Modifying a token | Principal Designer |
| Accessibility bug fix | Design system team review |
