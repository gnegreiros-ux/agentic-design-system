# ADR-091 — Per-variant stroke-width and default-color tokens for `agtc-icon`

> **Date:** 2026-07-30 (values revised 2026-07-31 — see Revision note)
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** token
> **Logical path:** decisions/ADR-091-icon-per-variant-stroke-width-and-color-tokens.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, guidelines/components/icon.md
> **Relations:** tokens/primitives.json (`strokeWidth`), tokens/semantic.json (`icon.strokeWidth.*`,
> `color.icon.*`), components/agtc-icon.js, guidelines/components/icon.md,
> .claude/rules/ux-patterns-sources.md, ADR-091 supersedes the hardcoded `stroke-width: 1.5`
> introduced when `agtc-icon` was first built

---

## Reference UX pattern applied

> Reviewed via the `ux-pattern-review` registry (`.claude/rules/ux-patterns-sources.md`) —
> iconography's priority source is NN/g.

| Pattern | Source | Applied |
|---------|--------|---------|
| Icon legibility and visual hierarchy across sizes | [NN/g — icons & indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ — stroke weight scales from lightest (`inline`) to boldest (`feature`) |

---

## Context

`agtc-icon` had exactly one token for size (`semantic.icon.size.{inline,control,nav}`, ADR
pre-existing) but two things were still hardcoded, undocumented, and identical across every
variant:

1. **Stroke width** — `stroke-width: 1.5` was a fixed literal in `components/agtc-icon.js`,
   applied uniformly regardless of the `size` attribute.
2. **Color** — the Figma "Agentica \| Lucide Icons" library file (the separate file holding the
   ~3449 raw Lucide vectors consumed via `INSTANCE_SWAP`) had no per-variant color token to bind
   against; a single ad hoc binding to `semantic.color.text.primary` was applied to every icon in
   that file regardless of context, discovered this same session to be architecturally wrong
   (that token's Figma scope is `TEXT_FILL` only, not `STROKE_COLOR` — see the scope-fix
   immediately preceding this ADR in session history).

Lucide vectors share a fixed 24×24 `viewBox`. `agtc-icon` scales the rendered icon by setting
`width`/`height` in CSS, which scales the *entire* SVG coordinate system uniformly — including
the stroke. With no per-size token, every render size shared the exact same stroke weight,
regardless of how much visual weight/hierarchy that size is meant to carry.

## Decision

1. **New primitive tokens** `primitive.strokeWidth.{sm,md,lg,xl}` = `1 / 1.5 / 1.75 / 2`
   (unitless, `$type: number`, matching the SVG `stroke-width` attribute's own unit-less
   viewBox space). Ascending scale — thinnest at `sm` (smallest render size), boldest at `xl`
   (largest).
2. **New semantic tokens** `semantic.icon.strokeWidth.{inline,control,nav,feature}`, aliasing
   the primitives above 1:1 with `semantic.icon.size.*` (same `inline`/`control`/`nav`/`feature`
   vocabulary). Stroke weight increases with size: `inline` (16px) stays lightest so it doesn't
   compete with adjacent body text; `control` (20px) and `nav` (24px) step up for stronger
   presence in interactive controls and navigation; `feature` (32px, marketing cards) is
   boldest for maximum visual presence. `feature` isn't an `agtc-icon` `size` attribute — it's
   applied via CSS on `data-context="marketing"` card icons (`site/build.js`).
3. **New semantic tokens** `semantic.color.icon.{inline,control,nav}`, aliasing the *primitive*
   grays that `text.primary`/`text.secondary` already use (`gray.12` for `inline`, `gray.11` for
   `control` and `nav`) — not aliasing `text.primary`/`text.secondary` themselves, to keep the
   icon token family self-contained at the primitive layer, consistent with how the rest of
   `semantic.json` aliases primitives directly rather than chaining semantic-to-semantic.
4. **`components/agtc-icon.js` now consumes the stroke-width tokens** via a
   `--agtc-icon-stroke-width` custom property, set per `:host([size=…])` exactly like the
   existing `--agtc-icon-size` pattern. **`stroke: currentColor` is unchanged** — the color
   tokens are not wired into the component's CSS.
5. **The color tokens are documentation/Figma-only, not a code override.** `currentColor` is
   strictly better for a real component: it inherits whatever text color surrounds the icon
   (error message red, dark-mode inverse text, a button's `on-action` white, hover-state teal,
   etc.) automatically, with no extra CSS anywhere. Replacing it with a fixed per-size color
   token would be a regression — an icon inside a red error message would render gray instead of
   inheriting the error color. `semantic.color.icon.*` exists purely to give the Figma "Lucide
   Icons" library file — which has no `currentColor` equivalent — a token-driven default per
   variant, and to document the color each variant typically resolves to in its default context
   (`inline` next to body text → `text.primary`; `control`/`nav` as a muted utility/nav icon →
   `text.secondary`, matching `.sidebar a`'s rest-state color).

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Wire `semantic.color.icon.*` into `agtc-icon.js`, replacing `currentColor` | Regression — breaks automatic color inheritance (error states, dark mode, button text color) for no benefit; `currentColor` already solves this correctly |
| One shared stroke-width token for all sizes (status quo) | Leaves the optical-thinning problem at `inline`/`control` unaddressed — the actual bug reported |
| Alias `semantic.color.icon.*` to `semantic.color.text.*` (semantic-to-semantic) | Inconsistent with `semantic.json`'s existing convention of aliasing primitives directly; semantic-to-semantic aliasing is a `component.json`-only pattern in this codebase |
| Add a `color.icon.feature` token alongside the stroke-width one | Not requested — marketing feature-card icons always render `action.primary` (teal), not a per-variant default like `inline`/`control`/`nav`; no ambiguity to resolve |

## Consequences

- `tokens/primitives.json`: +1 group (`strokeWidth`, 4 tokens).
- `tokens/semantic.json`: +2 groups (`icon.strokeWidth` — 4 tokens, `color.icon` — 3 tokens), 7 tokens total.
- `components/agtc-icon.js`: `stroke-width` no longer hardcoded; varies by `size`.
- `guidelines/components/icon.md`: sizes/tokens table extended, UX pattern row added.
- `site/build.js`: `data-context="marketing"` card-icon CSS rule now also sets
  `stroke-width: var(--agtc-semantic-icon-strokeWidth-feature)` alongside the existing
  width/height override.
- Figma: matching variables created on the main design system file and bound on the
  `agtc-icon` master ComponentSet's `Inline`/`Control`/`Nav` variants, and on all ~3,449 raw
  Lucide icons in the separate library file (bound to `strokeWidth.control`, matching their
  existing `size.control` frame binding) — see `project_figma_lucide_icons_file` session notes.
- No component token (`tokens/component.json`) touched — no Principal Designer approval gate
  triggered.

## Revision — 2026-07-31 (value fix, no new ADR per `adr-triggers.md`)

Initial values shipped 2026-07-30 assumed *decreasing* stroke weight with size (optical
correction for viewBox scaling: `inline=2, control=1.75, nav=1.5`). The Design System Lead
corrected the direction the next day: stroke weight should *increase* with size instead
(`inline=1, control=1.5, nav=1.75`), plus a new `feature=2` step (32px, marketing cards) that
the original version explicitly scoped out. Same architecture (per-variant token family,
`currentColor` unchanged in code, color tokens stay documentation/Figma-only) — only the
numeric scale and its rationale changed, which `pipelines/adr-triggers.md` classifies as an
"application of an existing ADR," not a new architectural decision. Edited in place rather
than superseded since this ADR had not yet been merged to `develop` at the time of the fix.
