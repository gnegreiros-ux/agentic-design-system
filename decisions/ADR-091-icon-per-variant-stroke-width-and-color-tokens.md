# ADR-091 — Per-variant stroke-width and default-color tokens for `agtc-icon`

> **Date:** 2026-07-30
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
| Icon legibility at small render sizes (optical stroke correction) | [NN/g — icons & indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ — `strokeWidth.inline`/`.control` thicker than the native Lucide weight |

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
the stroke. A stroke-width defined in viewBox units that looks correct at `nav` (24px, i.e. 1:1
with the source viewBox) becomes visually thinner at `control` (20px) and thinner still at
`inline` (16px), where icons are smallest and most often paired with body text — exactly where
legibility matters most.

## Decision

1. **New primitive tokens** `primitive.strokeWidth.{sm,md,lg}` = `2 / 1.75 / 1.5` (unitless,
   `$type: number`, matching the SVG `stroke-width` attribute's own unit-less viewBox space).
2. **New semantic tokens** `semantic.icon.strokeWidth.{inline,control,nav}`, aliasing the
   primitives above 1:1 with `semantic.icon.size.*` (same `inline`/`control`/`nav` vocabulary).
   `nav` keeps the original `1.5` (no correction needed — it renders at native viewBox size);
   `control` and `inline` step up to `1.75` and `2` to compensate optically for the smaller
   render size.
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
| Add a `feature` stroke-width/color variant alongside `inline`/`control`/`nav` | `feature` isn't an `agtc-icon` `size` attribute value — it's a raw CSS override used only for marketing card icons outside the component's declared variant surface (see `site/build.js`); out of scope here |

## Consequences

- `tokens/primitives.json`: +1 group (`strokeWidth`, 3 tokens).
- `tokens/semantic.json`: +2 groups (`icon.strokeWidth`, `color.icon`), 6 tokens total.
- `components/agtc-icon.js`: `stroke-width` no longer hardcoded; varies by `size`.
- `guidelines/components/icon.md`: sizes/tokens table extended, UX pattern row added.
- Figma: matching variables to be created on the main design system file and bound on the
  `agtc-icon` master ComponentSet's `Inline`/`Control`/`Nav` variants (tracked separately in this
  session, not part of this ADR's code-side scope).
- No component token (`tokens/component.json`) touched — no Principal Designer approval gate
  triggered.
