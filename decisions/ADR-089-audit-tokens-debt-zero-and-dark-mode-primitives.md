# ADR-089 — `audit-tokens.js` debt reaches zero critical; real Radix dark primitives added

> **Date:** 2026-07-22
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-089-audit-tokens-debt-zero-and-dark-mode-primitives.md
> **Read before:** AGENTS.md, DESIGN.md, ADR-085 (audit-tokens.js triage — exclusions, escape hatch, 7 promoted tokens)
> **Relations:** tokens/primitives.dark.json (new), tokens/semantic.dark.json, site/build.js, GitHub Projects — Gouvernance-domain "Dette audit-tokens.js" ticket (P2, closed by this ADR)

---

## Context

ADR-085 took `audit-tokens.js`'s reported debt from ~2508 to 247 violations by excluding
generated/historical/plugin paths and adding an `audit-ignore` escape hatch. The remaining
247 fell into two buckets, both addressed here:

1. **`site/build.js`'s `[data-theme="dark"]` block — 39 of the remaining hex-color
   violations**, hand-typed literal hex duplicating `tokens/semantic.dark.json` (an
   already-existing, separately-built Style Dictionary source — `style-dictionary/build.cjs`
   "BUILD 2: dark mode overrides" — that site/build.js never actually consumed). Comparing
   against the real `@radix-ui/colors` package (installed as a dev dependency to check)
   showed this project's palette is **not stock Radix**: `teal.11` was deliberately adjusted
   for WCAG contrast (ADR-048, ADR-050), and the dark values in `semantic.dark.json`
   (`action.primary: #34d3bb`) don't match stock Radix dark-teal either — they're already a
   second, independently-calibrated adjustment, not arbitrary hardcoding.
2. **~208 remaining hex/px violations scattered across `site/build.js`, `components/*.js`,
   `.stories.js`, and a couple of `guidelines/*.md`/test files** — genuine per-line triage,
   roughly three shapes: (a) real component drift fixable by mapping to an existing token,
   (b) reference/example content showing a resolved value on purpose (token tables, `❌`
   anti-pattern examples, a pedagogical "AI Brief" explaining the token hierarchy itself),
   (c) a handful of mathematically-related or hand-tuned values (concentric nested radii,
   a hairline grid-divider `1px`, a documented `52px` layout constant from
   `.claude/rules/layout-pattern.md`) that aren't drift at all.

## Decision

**1. `tokens/primitives.dark.json` created** — stock `@radix-ui/colors` v3.0.0 dark values
for the 9 Radix scales actually referenced in `semantic.json` (gray, mauve, slate, blue,
crimson, green, orange, red, teal), namespaced under `primitive.color-dark.*` (not `color.*`)
specifically to avoid a silent token-path collision if ever added to the same Style
Dictionary source list as `primitives.json`. **Not yet wired into any build target** — it's
a ready, accurate reference for future token additions, deliberately not forced onto the
existing, already-calibrated `semantic.dark.json` values (custom brand scales `accent`/
`secondary` have no Radix equivalent by definition and stay hand-tuned regardless).

**2. `tokens/semantic.dark.json` completed**, not replaced: added the 3 entries it was
missing relative to `site/build.js`'s hand-duplicated block — `brand.accent`, `brand.tertiary`,
`border.strong` — matching the exact values already live in production (`#ff8aa1`, `#6b7280`,
`#363c48`).

**3. `site/build.js` now generates its dark-mode block from `SEM_DARK`**
(`flattenTokens(semanticDarkData.semantic, primitives)`), the same mechanism already used
for the light `:root` block from `SEM` — eliminating the 39-line hand-typed duplicate.
Verified byte-for-byte identical output (Playwright: computed `getPropertyValue` for
`action-primary`, `brand-tertiary`, `brand-accent`, `border-strong`, `text-primary` compared
before/after in both themes).

**4. A second, entirely separate `[data-theme="dark"]` block removed as dead code**
(`site/build.js`, originally commented as keeping the main brand color consistent with the components) — it set
`action-primary`/`button-primary-background`/etc. to raw `var(--agtc-primitive-color-teal-9)`
(`#12a594`), but `:root[data-theme="dark"]` (higher specificity: pseudo-class + attribute
vs. attribute alone) already wins unconditionally. This block never actually applied —
confirmed by the live computed value already being `#34d3bb`, not `#12a594`, before this
change touched it.

**5. Remaining ~208 violations resolved individually**, following the precedent set for
components in ADR-085 §remaining-triage (not re-litigated here in full):
- Real drift → mapped to the nearest existing semantic/primitive token (spacing snapped to
  the 4px-grid component/control/layout scale; radius snapped to `control-tight`(2px)/
  `control`(6px)/`card`(10px)/`pill`; typography snapped to the Minor Third scale).
- Reference/example content → `audit-ignore` (JS/HTML comments are valid and hidden/harmless
  in the code samples and prose contexts they sit in) or, for one specific function
  (`aiBriefContent()`, a markdown brief explaining the token hierarchy to AI readers, table
  rows included — where a trailing comment would visibly break a markdown table row) — a new
  brace-depth-scoped exemption in `audit-tokens.js` (`PEDAGOGICAL_FUNCTIONS`), rather than
  peppering individual lines.
- Mathematically-related values (`.docs-panel` 18px outer / 17px inner = 18 minus its 1px
  border, concentric by design) and the one documented layout constant (`.content`'s
  `52px 64px`, cited verbatim in `.claude/rules/layout-pattern.md`) → `audit-ignore` with a
  comment pointing at the reason, not force-fit onto an unrelated token.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Source a full Radix dark PRIMITIVE scale and force every dark semantic token to alias it | Would risk silently reverting the deliberate WCAG-contrast adjustments already made (ADR-048, ADR-050) — stock Radix dark-teal doesn't match the live, already-correct value |
| Leave `site/build.js`'s dark block as its own hand-maintained copy | The actual "debt" was the duplication itself, not the values (which were already correct) — `tokens/semantic.dark.json` already existed as the real source, just unconsumed |
| Force marketing-page one-off values (16px hero-panel radius, mathematically-derived nested radii) onto the nearest unrelated token | Would visibly change deliberate design choices for the sake of a clean audit number — `audit-ignore` with a documented reason is the honest option ADR-085 already established this escape hatch for |

## Consequences

- `node scripts/audit-tokens.js --ci`: 247 → **0 critical, 1 warning** (`Orphaned:
  button.ghost.border` — a pre-existing, unrelated finding from the audit's *first* check
  category (#1, orphaned tokens), not the hardcoded-value check this whole triage targeted;
  left as-is, `component.json` changes require Principal Designer approval per
  `tokens-system.md` and this is out of scope here).
- `@radix-ui/colors` added as a dev dependency (`package.json`) — build-time reference only,
  not shipped.
- GitHub Projects "Dette audit-tokens.js" ticket (P2, Gouvernance) moves to its board's done status (the board's Status field is French: Backlog/En cours/Terminé/etc.). <!-- lang-audit-ignore: literal Status field value, French by board convention -->
- Verified in-browser (Playwright, light + dark, multiple pages: home, typography foundations
  specimen, changelog, docs mega-menu) — 0 console errors, all spot-checked values render
  correctly, `validateCssVars()` reports 0 phantom variables throughout.
