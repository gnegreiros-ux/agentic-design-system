# ADR-084 — Home page illustrations migrated to `agtc-image` directly, no `agtc-illustration` wrapper

> **Date:** 2026-07-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-084-illustrations-migrated-to-agtc-image-no-wrapper.md
> **Read before:** AGENTS.md, DESIGN.md, decisions/ADR-083-agtc-image-implementation.md
> **Relations:** ADR-083 (`agtc-image` implementation), GitHub Projects — Composants-domain `agtc-illustration` ticket (P2, closed as Abandoned by this ADR) and Site-domain "Migrer les balises `<img>` existantes vers agtc-image" ticket (P3, resolved by this ADR) <!-- lang-audit-ignore: literal ticket title, French by board convention -->

---

## Reference UX patterns applied

> Reviewed 2026-07-21 via the `ux-pattern-review` workflow (ADR-036), before any code was written —
> for the `agtc-illustration` component that was ultimately **not** built (see Decision below).
> The patterns approved during that review were instead applied directly to the site's
> `<agtc-image>` usage, since that's where the actual work ended up.

| Pattern | Source | Applied |
|---------|--------|---------|
| Decorative by default (`aria-hidden`, no `alt`) | Mirrors `agtc-icon`/`agtc-image` | ✅ — `decorative` prop on every migrated instance |
| `prefers-reduced-motion` on the `ambient` float animation | WCAG 2.3.3 | ✅ — added to `site/build.js`'s existing reduced-motion block |
| Composition via `agtc-image` rather than a new wrapper | Design system decision | ✅ — this IS the decision below |

---

## Context

The backlog carried a P2 ticket, `agtc-illustration`, proposing a new component to
"encapsulate the `illus`, `illus-hero`, `illus-feature`, `illus-ambient`, `illus-brand`
classes" duplicated across the home page's hand-written HTML — 9 occurrences of
`<figure class="illus illus-X" aria-hidden="true"><img src=… alt="" width height
loading …></figure>`.

Two things emerged while scoping the work, both **after** `agtc-image` (ADR-083) had
already landed:

1. **The `.illus-*` classes are not self-contained.** `.illus-hero` is
   `position:absolute` relative to `.hero-grid`; `.illus-feature`/`.illus-brand`
   inherit bleed/width behavior from parent-scoped selectors like
   `.overlap > figure:last-child` and `.split > figure:first-child`, which match on
   the literal `figure` tag and its position among siblings. Replacing that `<figure>`
   with a custom element would either break those selectors outright, or require
   rewriting five site-layout CSS rules to target `agtc-illustration` instead —
   a materially larger and riskier change than "encapsulate the img", touching the
   live marketing home page's layout system.
2. **Once the figure/positioning stays in the site's hand-written markup (the safer
   option, confirmed by the Design System Lead), there is nothing left for
   `agtc-illustration` to do.** Every attribute duplicated inside the `<img>`
   (`alt=""`, `width`, `height`, `loading`, `fetchpriority`) is already exactly what
   `agtc-image` (`decorative` + `fit="contain"`) handles. A second component that only
   forwards props to `agtc-image` would be a near-empty wrapper — unnecessary
   abstraction with no behavior of its own.

A separate, unrelated discovery made during this investigation: the `width`/`height`
attributes hand-written on the 9 existing `<img>` tags (e.g. `720×540`, `740×560`,
`680×520`) did not match the true intrinsic ratio of the source PNGs (all `1536×1024`,
a 3:2 ratio) — a latent, minor CLS bug, since `height:auto` recomputes to the image's
real ratio once loaded, momentarily disagreeing with the reserved placeholder space.

## Decision

1. **No `agtc-illustration` component is built.** The `agtc-illustration` P2 ticket is
   closed as Abandoned — not deferred, not renamed, actually superseded by direct
   `agtc-image` usage.
2. **All 9 home page illustrations now use `<agtc-image decorative fit="contain">`**
   directly inside their existing, unchanged `<figure class="illus illus-X"
   aria-hidden="true">` wrapper. The figure keeps full ownership of
   position/bleed/sizing via the site's existing layout CSS; `agtc-image` owns
   loading/anti-CLS/fallback for the image itself. This resolves the separate
   Site-domain "Migrer les balises <img> existantes vers agtc-image" ticket at the same time — same underlying change. <!-- lang-audit-ignore: literal ticket title, French by board convention -->
3. **`width`/`height` corrected to `768×512`** (true 3:2 ratio) on all 9 instances,
   fixing the latent CLS mismatch described above.
4. **`prefers-reduced-motion` added for `.illus-ambient`'s `float-illus` animation**,
   in `site/build.js`'s existing `/* REDUCED MOTION */` block — closes a pre-existing
   WCAG 2.3.3 gap surfaced while reviewing this pattern, unrelated to the
   component-vs-no-component question but caught in the same pass.
5. **Dead CSS removed:** `.illus img` and `.illus-hero img` descendant rules, which
   no longer match anything now that no bare `<img>` exists inside `.illus` (the real
   `<img>` now lives inside `agtc-image`'s shadow DOM, unreachable by outer selectors
   regardless).

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Build `agtc-illustration` as originally scoped, replacing the `<figure>` entirely | Would require rewriting 5 position/bleed CSS selectors that match on the literal `figure` tag and sibling position — real risk to the live marketing home page's layout for no behavioral gain over direct `agtc-image` usage |
| Build `agtc-illustration` as a thin pass-through wrapper around `agtc-image`, keeping the figure external | Confirmed with the Design System Lead: once the figure stays external, the wrapper would do nothing `agtc-image` doesn't already do — unnecessary abstraction |
| Leave the `agtc-illustration` ticket open/deferred rather than closing it | It isn't waiting on anything — the reasoning that would resolve it already exists in this ADR; leaving it open would misrepresent it as still-actionable future work |

## Consequences

- `site/build.js`: 9 `<img>` → `<agtc-image>` migrations, corrected `width`/`height`,
  reduced-motion fix, 2 dead CSS rules removed.
- GitHub Projects: `agtc-illustration` (P2) → Abandoned, reason recorded on the item; "Migrer les balises <img>" (P3) → Terminé (the board's Status field is French: Backlog/En cours/Terminé/etc.). <!-- lang-audit-ignore: literal ticket title + literal Status field value, both French by board convention -->
- No new component, no new tokens, no new ADR-036 propagation surfaces beyond this ADR
  itself (there's no `guidelines/components/illustration.md` to write, since there's no
  such component).
- Any *future* illustration added to the home page should follow the same pattern:
  hand-written `<figure class="illus illus-X" aria-hidden="true">` wrapper +
  `<agtc-image decorative fit="contain" width="768" height="512" src="…">` inside it —
  not a reintroduction of raw `<img>`.
