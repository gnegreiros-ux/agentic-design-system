# ADR-083 — `agtc-image` implementation

> **Date:** 2026-07-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-083-agtc-image-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/performance.md
> **Relations:** tokens/component.json, guidelines/components/image.md, `.claude/rules/performance.md`, GitHub Projects — Composants-domain `agtc-image` ticket (P2)

---

## Reference UX patterns applied

> Reviewed 2026-07-21 via the `ux-pattern-review` workflow (ADR-036), before any code was written.
> Decision: **all suggested patterns approved**; skeleton/placeholder explicitly requested for v1
> rather than deferred.
> Details and links: `guidelines/components/image.md` § UX Patterns Reference.

| Pattern | Source |
|---------|--------|
| Decorative vs meaningful image distinction (`alt=""` + `aria-hidden`) | WCAG 1.1.1 / NN/g — mirrors the pattern already approved on `agtc-icon` |
| Skeleton screen while loading, opt-in | NN/g — Skeleton Screens 101 |
| Graceful fallback on load failure (icon + visible alt) | General error-handling principle — no dedicated image-specific pattern found in the 5 reference sources |
| `object-fit` configurable (`cover`/`contain`/`fill`) | Design system decision, not a reference-source pattern |

---

## Context

The backlog carried a P2 ticket: build `agtc-image` — a component wrapping `<img>`
with lazy loading, explicit `width`/`height` to prevent layout shift (CLS),
`fetchpriority`, and WebP support. No prior component in this system addressed raster
images specifically (`agtc-icon` covers SVG icons; the `illus-lazy` pattern in
`.claude/rules/performance.md` covers large inline SVG illustrations — neither fits a
photo or a raster asset loaded via `<img src>`).

Two questions guided the decisions:

1. **Loading feedback** — should the component show anything while the image loads,
   or just reserve space via `width`/`height` and let the browser paint when ready?
2. **WebP delivery** — should the component generate/convert WebP itself, or expect
   both formats to already exist?

---

## Decision

1. **Skeleton is opt-in (`skeleton` prop), included in v1.** A pulse-animated
   placeholder (tokenized background, disabled under `prefers-reduced-motion`) can be
   requested per-instance. Default is off — reserving aspect-ratio via `width`/`height`
   already prevents CLS on its own; a skeleton is genuinely useful only for
   heavy/hero images where the load itself is perceptible, and forcing it on every
   small inline image (avatar, thumbnail) would add unnecessary visual noise.
2. **WebP via `<picture>` + consumer-supplied fallback, no conversion.** `src-webp`
   renders a `<picture>` with a WebP `<source>` and `src` as the fallback format; both
   files must already exist. This repository does no build-time image processing
   (`.claude/rules/illustrations-source.md` — `Brand/illustrations/` PNGs are
   hand-authored, not generated), so automatic conversion would be a new, unscoped
   capability rather than a component concern.
3. **`width`/`height` are required, not optional.** Missing either logs a console
   warning — the same escalation pattern used elsewhere in this system (`agtc-badge`
   icon-only without `label`, `agtc-icon` unknown name) — because a missing
   `width`/`height` defeats the component's core anti-CLS purpose rather than being a
   cosmetic gap.
4. **Failed loads render a fallback (icon + visible alt), never a broken-image hole.**
   Consistent with WCAG 1.1.1: the alt text remains available to sighted users too,
   not just assistive technology.
5. **`priority` bundles `loading="eager"` + `fetchpriority="high"`** rather than two
   separate props — in practice they're always set together for the single LCP image
   on a page (`.claude/rules/performance.md` Standard 3), so splitting them would only
   invite an inconsistent combination.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Skeleton always on by default | Unnecessary visual overhead for small inline images; `width`/`height` already solves CLS without it |
| Automatic WebP conversion at build/runtime | No image-processing pipeline exists in this repo today (`illustrations-source.md`); out of scope for a single component |
| `width`/`height` optional, silently falling back to intrinsic size | Silently reintroduces the exact CLS problem this component exists to prevent |
| Separate `loading` and `fetchpriority` props | The two are only ever meaningfully combined for the LCP image; a single `priority` prop prevents an inconsistent combination |

---

## Consequences

- `tokens/component.json` gains an `image` group: `skeleton.background`,
  `skeleton.background-pulse`, `fallback.background`, `fallback.icon`, `fallback.text`
  — all aliasing existing semantic tokens, no new primitives.
- `components/agtc-image.js` + `agtc-image.stories.js` created; registered in
  `components/index.js`.
- `guidelines/components/image.md` — full contract, including the UX Patterns
  Reference table above.
- Site: `agtc-image` gets a documentation page (`site/dist/components/image.html`),
  added to `COMPONENT_PAGES` and the components index catalog.
- GitHub Projects `agtc-image` ticket (P2, Composants) moves to Terminé (the board's Status field is French: Backlog/En cours/Terminé/etc.). <!-- lang-audit-ignore: literal Status field value, French by board convention -->
- Not in scope for this ADR: migrating existing `<img>` usage on the site itself to
  `<agtc-image>` — that's a separate dogfooding decision, not required by the backlog
  ticket, which asked for the component to exist, not for a sitewide migration.
