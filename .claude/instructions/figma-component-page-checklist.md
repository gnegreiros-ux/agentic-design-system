# Checklist — Component page validation audit

> Run against any Figma component page before marking it "Terminé" in GitHub Projects, and
> periodically against `↳ badge`/`↳ button` (the two reference pages) to catch drift between
> them. Pair with `.claude/instructions/figma-component-page-method.md` (how to build/fix) —
> this file is what to verify, that one is how to get there. Section numbers refer to
> `.claude/instructions/figma-components.md`, the full rationale/incident source.
> **Type:** instruction
> **Logical path:** .claude/instructions/figma-component-page-checklist.md
> **Author:** Guilherme Negreiros
> **Relations:** .claude/instructions/figma-component-page-method.md,
> .claude/instructions/figma-components.md, scripts/figma/audit-figma-file.js,
> .claude/rules/figma-library-governance.md

---

## Before starting the audit

- [ ] Re-read this checklist against the **live** Figma file, not from memory of a previous
      audit — the file changes between sessions (§28.7)
- [ ] Note whether the page under audit is one of the 2 Phase-3 pages (`badge`, `button`) or
      one of the 9 still on the pre-Phase-3 flat `page-wrapper` pattern — the 3-frame checks
      (A–H below) don't apply to the latter until they're migrated (§28.6)

---

## A. Page architecture — 3-frame pattern (§28.1)

- [ ] Exactly 3 top-level live frames: `Main frame`, `Main-component frame`, `Spec frame` (plus
      only an off-canvas reference screenshot and/or `_trash`/`_OLD_...` remnants)
- [ ] All 3 at `y = 0` — never stacked vertically
- [ ] `x` follows the fixed 1800 stride: `0`, `1800`, `3600` (previous frame's `x` + `width` +
      `360`)
- [ ] Each frame is `1440px` wide, `layoutMode: VERTICAL`, children in order `doc/frame-header`
      → `body` → `footer`, no extra wrapper

## B. `doc/frame-header` (§28.2)

- [ ] Real instance of `1062:1207`, correct `Where` variant per frame
- [ ] All 6 TEXT properties set explicitly (`Eyebrow`, `Tech ID`, `Title`, `Subtitle`,
      `Heading`, `Description`) — no `"SYS-XXX-00"` / `"Page title"` placeholder leaking through
- [ ] Chrome (dark, teal-glow) unmodified

## C. `doc/section-header` (§28.3)

> **Scope note, added after the 2026-09-01 test run**: exclude anything nested inside a
> `_trash`/`_OLD_*` subtree before evaluating this section — a parked no-delete remnant
> (`figma-library-governance.md` §A) is expected to still carry the old, superseded
> structure and is not a live defect. Filter by ancestry
> (`while (cur) { if (/^_trash|^_OLD_/.test(cur.name)) return true; cur = cur.parent; }`),
> not just by the node's own name.

- [ ] Every **live** section label (excluding `_trash`/`_OLD_*` subtrees) in every frame is a
      real instance of `604:4` — never a raw `typography/mono/detail` text node, never a
      manually-detached copy
- [ ] `n.type === 'INSTANCE'` (not `FRAME`) on every **live** one found via
      `page.findAll(n => n.name === 'doc/section-header')`
- [ ] No `Rectangle` child present (old hand-built underline — a live instance never has one)
- [ ] Title text set via the child `TEXT` node's `.characters`, no font-size/color override
      (the master's own `Bold 40px` / `text/secondary` default is correct everywhere)

## D. `Main frame` body (§28.4)

- [ ] `section-presentation`: `doc/section-header` + real instances covering every variant
- [ ] `section-dos-donts`: real `doc/dos-donts-card` instances (`616:254`), never hand-built
      `do-column`/`dont-column` frames
- [ ] Each DO/DON'T card's `scenario-title`/`caption` set to `layoutSizingHorizontal = 'FILL'`
      after populating (not left at the master's narrow `FIXED` inherited width)
- [ ] `footer` present (see section G below)

## E. `Main-component frame` body (§28.4)

- [ ] Body contains a **real header-row/row-label/cell table** — never a raw `ComponentSet`
      dump with a `Variant=.../State=...` text legend
- [ ] Confirmed which `ComponentSet` the table's cells derive from when more than one node
      shares the component's name (`page.findAll(n => n.type === 'COMPONENT_SET' && ...)`)
- [ ] Row and column axis labels: `weight: Regular`, color `semantic/color/text/secondary` —
      never `Bold` or an accent/brand color on a plain axis label
- [ ] Checked in **all 4 places** independently: Light source (`section-presentation`), Dark
      source, Light clone (Main-component frame), Dark clone — a fix on one does not propagate
      to the others (clones, not instances)
- [ ] Any superseded raw-`ComponentSet` copy renamed `_OLD_...` and moved off-canvas, not
      deleted (no-delete rule)
- [ ] `footer` present

## F. `Spec frame` body — Specs 2 content (§27, §28.4, §28.6)

- [ ] All 6 sections present, in order: Anatomy, Props, Variant, State (or the adapted axis
      name, e.g. `-size`, with an explanatory note), Additional variants, Layout and spacing
- [ ] Each `section-*`: `VERTICAL`, `itemSpacing: 32`, padding `60/60/80/80`, `fills: []`
- [ ] Each section's `exhibit-stack` is `VERTICAL` (never `HORIZONTAL`/`WRAP` — exhibits stack,
      not sit side by side)
- [ ] Anatomy: numbered pin diagram (`doc/annotation-badge` + `_connector` lines) + legend
      (`doc/spec-group` stack, badge prepended to each `header`) — proportional to the
      component's real layer count, not a fixed count of 4
- [ ] Props: 4-column table (Name/Type/Default/Options), one row per variant/property axis
- [ ] Variant / State / Additional variants: only properties that actually diff from the
      baseline are listed — no repeated unchanged properties; Additional variants skips any
      combo with no visible delta over the single-axis exhibits
- [ ] Layout and spacing: diagram present (measurement badges/ticks/overlays for padding, or a
      `doc/selection-outline` for an alignment-only change with nothing to dimension) — not
      just the property list with no visual diagram
- [ ] Every property line with a token equivalent reads `Label: token.path (rawValue)` — raw
      value always in parentheses, never distinguished by color alone
- [ ] No invented token path — every one traced to `tokens/semantic.json` or
      `tokens/component.json`
- [ ] `Direction`/`Alignment`/`*-resizing` values read directly off the live node
      (`layoutMode`, `primaryAxis*`, `counterAxis*`) **and** cross-checked against the real
      CSS/JS — not copied from a reference screenshot or assumed from how the component looks
- [ ] No Data/JSON export section built (deliberately out of scope — `tokens/*.json` is that
      export already)
- [ ] `footer` present
- [ ] **Gate**: this section is what makes a page "done" — a page with a partial or
      placeholder Spec frame fails this checklist regardless of how complete the other frames
      are

## G. `doc/footer` (§28.4bis)

- [ ] Real, undetached instance of `1221:3907` on all 3 frames —
      `getMainComponentAsync()` returns `1221:3907` on every one, not `_OLD_doc/footer` or a
      plain `FRAME`
- [ ] Link labels set via `setProperties()` (property keys re-verified against
      `master.componentPropertyDefinitions`, not assumed to still be `1296:0`…`1296:5`)
- [ ] Every visible link pill's `TEXT` child has a real `.hyperlink` set (not just the label
      text) — a pill can look correct and still not be clickable
- [ ] Every URL traced to a real precedent — the component's own `guidelines/components/*.md`
      file (`blob/`, not the generic `tree/` folder), the specific line inside
      `tokens/component.json` (line anchor), a topic-specific NN/g/W3C article already cited
      elsewhere — never a generic hub page reused verbatim across unrelated components, never
      an invented URL
- [ ] `Show link N` boolean set explicitly (not left at the master's current default) when the
      page needs 4 vs. 5 links

## H. Frame backgrounds (§28.4ter)

- [ ] Only the 3 top-level frames carry a fill (`semantic/color/background/page`)
- [ ] Every section/body/wrapper descendant — including nested 2 levels deep — has `fills: []`
- [ ] The 2 documented exceptions untouched: `doc/frame-header`'s own chrome, `doc/footer`'s
      `wrapper` (`background/subtle`)

---

## I. Tokens and bindings (§0, §5, §18, §26.5, §26.7, §26.8)

- [ ] No hardcoded hex anywhere outside the 2 accepted exceptions (`gradientStops`, ellipse
      opacity) — every fill/stroke via `vFill(semanticToken, fallback)`
- [ ] Component token used wherever one exists in `tokens/component.json`; semantic token used
      only where no component-level token covers that property
- [ ] No fill/stroke with empty `boundVariables.color` (scan sweep, §26.5)
- [ ] No fill/stroke variable that resolves by ID but belongs to an orphaned collection — cross
      -check `variable.variableCollectionId` against `getLocalVariableCollectionsAsync()`, not
      just a non-null `getVariableByIdAsync()` result (§26.7)
- [ ] Padding/gap/corner-radius bound to Variables too, not just paint — check every
      `ComponentSet` variant AND any nested named wrapper child (`pill`, `track`, `field`),
      compared against the real value in `components/agtc-*.js`, not against Figma's current
      (possibly already-drifted) number (§26.8)

## J. Text styles (§19, §24, §26.1)

- [ ] Every `TEXT` node has a non-empty `textStyleId` — never manual fontName/fontSize that
      merely resembles an existing style
- [ ] Every Text Style has all 4 properties (`fontSize`, `fontFamily`, `fontWeight`,
      `lineHeight`) bound to a Variable, not a literal value
- [ ] Every Text Style's `lineHeight` is `{unit:"PERCENT", ...}` — flag any `{unit:"PIXELS",
      value < 10}` as broken (a bare unitless multiplier saved under the wrong unit)
- [ ] Presentation/documentation text (section titles, descriptions, table headers, DO/DON'T
      copy, link pill text) uses the Mono `typography/doc-mono` style — never the component's
      own content font, and never a hand-coded monospace fontName
- [ ] Text **inside a component instance** keeps the component's real font (Atkinson
      Hyperlegible) — Mono never crosses into showcased component content

## K. Layout, sizing, width (§2, §17, §25, §26.2, §26.3, §26.4)

- [ ] `resize()` always called before `primaryAxisSizingMode = "AUTO"`, never after
- [ ] Every variable-item-count row (`states-row`, `instances-row`, variant-grid columns):
      `layoutWrap="WRAP"` AND `layoutSizingHorizontal="FILL"` AND `counterAxisSpacing` set —
      not WRAP alone
- [ ] No content element wider than 1280px in any section (1440 wrapper − 2×80 padding)
- [ ] `findOverflows()` returns an empty array for the whole page-wrapper/frame set, not just
      the specific component touched
- [ ] Any decorative "card" background is a real auto-layout HUG **parent** of its content, not
      a manually-sized sibling frame relying on coincidentally-matching dimensions
- [ ] Any table-like row with a trailing aligned element (bar, badge) uses a `FIXED`-width
      preceding column, never `FILL`/`layoutGrow=1` (which right-aligns instead)
- [ ] Geometry checked via `.absoluteRenderBounds`, not `.height`/`.absoluteBoundingBox`, when
      read immediately after a mutation in the same session
- [ ] Any `FIXED`-width `TEXT` child left overflowing after its parent frame/instance was
      resized: fixed via `layoutSizingHorizontal = 'FILL'` on the child, not `.resize()` —
      `.resize()`/`.resizeWithoutConstraints()` silently no-op on this class of node (§26.12)

## L. Icons (§20)

- [ ] `constraints: {horizontal:'SCALE', vertical:'SCALE'}` set on every child at every nesting
      level down to the leaf vector — not just the first level
- [ ] Resize tested with an at-risk icon shape (path close to the bounds, e.g.
      `layout-dashboard`), not only a symmetric one (`plus`, `x`) that would mask the bug

## M. Accessibility (§11, §21.B, §22.1)

- [ ] Text contrast ≥ 4.5:1 normal, ≥ 3:1 large (≥24px or ≥18.66px Bold) — computed, not
      eyeballed, composited through any semi-transparent ancestor fills
- [ ] Icon/UI graphic contrast ≥ 3:1
- [ ] `disabled` states correctly exempted, not flagged as false positives
- [ ] Focus ring uses the two-color technique (C40): a light band directly against the
      component + a dark band outside, ≥9:1 contrast between the two bands, each ≥2px — never a
      single-color ring, especially not one bound to the same token as the component's own fill

## N. Combination / edge-case coverage (§23)

- [ ] For any component combining a visually additive state (Focus, Selected…) with
      variable-size content (free text, optional icons/slots): at least one instance tests the
      worst-case combination (most additive state + every optional slot on + a realistic long
      label) — not just each dimension tested in isolation
- [ ] Any additive indicator (focus ring, etc.) is either inside a `HUG` auto-layout wrapper
      that tracks its content, or targets an element with a structurally fixed size — never a
      statically-sized sibling frozen at build time

## O. Canvas and file hygiene (§13, §26.9, §28.5)

- [ ] Page canvas background is `#535353` (unless this is the Brand page, `17:4`)
- [ ] No orphaned test node left at the page's root level
- [ ] Any renamed/deleted referenced element checked file-wide for stale plain-text mentions
      and broken internal `NODE`-type hyperlinks (`findStaleNameReferences`, `findBrokenLinks`)
- [ ] Any superseded old-pattern remnant renamed `_OLD_[name] (superseded by [new])`, moved
      off-canvas — never deleted

## P. Automated audit script (§0bis, §22, §26.10)

Run `scripts/figma/audit-figma-file.js` (`auditPage()`) against the page. Every result array
must be empty, or contain only a documented, verified-benign exception:

- [ ] `orphanedVariables` — empty
- [ ] `unboundComponentProps` — empty
- [ ] `brokenLineHeights` — empty
- [ ] `staleNameReferences` — empty
- [ ] `brokenLinks` — empty
- [ ] `clippedEffects` — empty or verified benign by screenshot (candidates, not automatic fails)
- [ ] `overflows` — empty or only the known decorative header-bleed exception
- [ ] `missingWrapper` — empty (pre-Phase-3 pages only; not applicable once migrated to the
      3-frame pattern, which replaces the single `page-wrapper` convention)
- [ ] `widthMismatches` — empty (secondary signal, not a substitute for `missingWrapper`)

---

## Q. Completion gate — sign-off (§28.6)

- [ ] All of sections A–P above pass (or every exception is explicitly documented and benign)
- [ ] `Spec frame` shows the full 6-section Specs 2 content — this is the hard gate; nothing
      else on this checklist substitutes for it
- [ ] GitHub Projects ticket status matches reality: only move to "Terminé" once this entire
      checklist passes, not on a partial build

---

## After the audit

- [ ] If any finding applies to both `badge` and `button` (the two reference pages), fix both
      in the same session — don't fix one and leave the other to drift, a repeated pattern
      logged across this session's work
- [ ] Log any newly-discovered defect class back into `figma-components.md` (or its `§28.7`
      pre-build-verification note) so it becomes a standing check here, not a one-off fix
