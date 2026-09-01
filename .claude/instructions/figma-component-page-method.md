# Method — Building or modifying a Figma component page

> Step-by-step method for creating or modifying a component page in the Agentica Figma file.
> Consolidates the rules and criteria already scattered across `figma-components.md`'s 28
> sections into one ordered playbook. **This file is a distilled index — the full rationale,
> incident history, and code patterns for every step live in `figma-components.md`; when a step
> here and that file disagree, re-verify against the live Figma file, never against either
> document from memory (§28.7).**
> **Type:** instruction
> **Logical path:** .claude/instructions/figma-component-page-method.md
> **Author:** Guilherme Negreiros
> **Reference implementations:** `↳ badge` and `↳ button` — as of 2026-09-01 the only two pages
> built to this method. Both must match — every fix this session was applied to both after the
> user caught a divergence twice (fixed on one, forgotten on the other). Diff badge and button
> before copying "the reference" if either might have drifted since.
> **Relations:** `.claude/instructions/figma-components.md` (full detail, §0–§28), `.claude/rules/figma-components.md`
> (stub), `.claude/rules/figma-library-governance.md` (code-is-source-of-truth charter),
> `.claude/instructions/figma-component-page-checklist.md` (the matching audit checklist),
> `scripts/figma/audit-figma-file.js` (automated structural/binding audit)

---

## 0. Before touching anything — mandatory live verification (§28.7)

Do this **every time**, even for a piece this document already describes in prose. Skipping it
is the single most repeated root cause across every incident logged in `figma-components.md`
§26–§28 (stale prose, a page built from memory of an older pattern, a "looks similar enough"
hand-built substitute for a real `doc/*` component).

```
1. SEARCH ↳ design annotations for an existing doc/* component matching the pattern you're
   about to build — findAllWithCriteria({types:['COMPONENT','COMPONENT_SET']}) filtered by name.
2. INSPECT the equivalent piece live on button (or badge) — real node IDs, real
   layoutMode/itemSpacing/padding, real child names — immediately before writing the script.
3. Treat every number/name in figma-components.md as a claim to verify against the live file,
   never a value to copy from the document without checking.
```

---

## 1. Foundational rules that apply to every step below

- **Never a primitive token or a hardcoded hex** — every fill/stroke goes through
  `vFill(semanticToken, fallbackHex)` (§0). The two accepted exceptions (`gradientStops`,
  ellipse decoration opacity) are documented in §0 — don't invent a third.
- **Component token before semantic** — check `tokens/component.json` for a
  `component/<comp>/...` token before binding a `semantic/...` one directly (§18). Semantic is
  correct only when no component token exists for that property.
- **`resize()` before `primaryAxisSizingMode = "AUTO"`**, never the reverse (§2) — the Plugin
  API silently reverts to FIXED otherwise.
- **Run `scripts/figma/audit-figma-file.js` before ending any session that mutated the file**
  (§0bis) — not just before declaring the whole file done. A clean visual screenshot is not
  sufficient evidence; orphaned-variable and hardcoded-padding bugs both render perfectly.

---

## 2. Page architecture — the 3-frame pattern (§28.1)

Every component page is exactly 3 top-level frames, side by side on one row, `y = 0` for all
three, 360px gap between each frame's right edge and the next one's `x`:

| Frame | `x` | `y` | Width | `doc/frame-header` `Where` variant |
|---|---|---|---|---|
| `Main frame` | `0` | `0` | `1440` | `main-frame` |
| `Main-component frame` | `1800` | `0` | `1440` | `main-component-frame` |
| `Spec frame` | `3600` | `0` | `1440` | `specs-frame` |

```
✅ x of the next frame = previous frame's x + width + 360 (fixed 1800 stride at 1440px width)
✅ Set both x AND y explicitly on every frame — never leave one at Figma's default drop position
❌ Never stack the 3 frames vertically — a vertically-stacked page still passes every
   binding/token audit script; this is a pure layout-convention error, invisible to automation
```

Each frame is itself `layoutMode: VERTICAL`, 1440px wide, stacking `doc/frame-header` (header)
→ `body` → `footer` as direct children, no extra wrapper.

---

## 3. Build `doc/frame-header` on all 3 frames (§28.2)

ComponentSet id `1062:1207`, `↳ design annotations`, variant `Where` = `main-frame` /
`main-component-frame` / `specs-frame`. Set all 6 TEXT properties explicitly on every instance,
even ones a given variant doesn't visually render — an unset property is how the
`"SYS-XXX-00"` / `"Page title"` placeholder leaks into a shipped page:

```
Eyebrow      — page category, e.g. "COMPONENTS"
Tech ID      — e.g. "· CMP-BDG-01" (3-letter component code, sequential number)
Title        — main-frame only: the page title
Subtitle     — main-frame only: one-sentence purpose
Heading      — main-component-frame + specs-frame: component name
Description  — main-component-frame + specs-frame: component purpose
```

Do not restyle the component's own dark, teal-glow chrome.

---

## 4. Section labels — `doc/section-header`, everywhere, never a raw text node (§28.3)

Instance id `604:4`, `↳ design annotations`. **No exposed component properties** — set the
title by finding the child `TEXT` node and writing `.characters` directly, never
`setProperties()`. The master carries its own bottom-only stroke and a uniform
`Atkinson Hyperlegible Bold 40px` / `semantic/color/text/secondary` default — no per-instance
size override, ever.

```
✅ master.createInstance() → find the TEXT child → set .characters → append, never detach
❌ Never detachInstance() a doc/section-header — a detached copy silently stops inheriting any
   future master fix (found on 6 of button's Spec-frame headers, built before a master
   correction, 2026-08-31)
```

Verify: `n.type === 'INSTANCE'` (never `FRAME`) and no `Rectangle` child — either failing means
a stale detached copy that must be rebuilt, not patched.

---

## 5. `Main frame` body — presentation, best practices, footer (§28.4)

1. **`section-presentation`** — `doc/section-header` ("ALL VARIANTS" or equivalent) + real
   instances showcasing every variant, plus whatever mode-comparison / icon-variant blocks are
   relevant to the component. Component-specific — build what applies.
2. **`section-dos-donts`** — `doc/section-header` ("BEST PRACTICES") + one `dos-row` per pair,
   each row holding 2 real `doc/dos-donts-card` instances (ComponentSet `616:254`, variant
   `State`: `DO`/`DON'T`). **Never** the pre-Phase-3 hand-built `do-column`/`dont-column`
   frames — that was `badge`'s first-pass mistake, corrected 2026-08-29.
   - The card's `header` (icon + label) is fixed; populate `wrapper`'s `scenario-title` TEXT,
     `caption` TEXT, and `example-slot` (append your own `example-visual` wrapper holding a real
     component instance — the slot starts empty, it is not a property slot) per instance.
   - Set `scenario-title`/`caption` to `layoutSizingHorizontal = 'FILL'` after populating — the
     master's inherited `FIXED` width wraps text after 1–2 words otherwise.
3. **`footer`** — a `doc/footer` instance (step 8 below).

---

## 6. `Main-component frame` body — the live master, in a real table (§28.4)

1. `body` → one frame named `"[component] (copy for display)"`: a heading TEXT + a **real
   header-row/row-label/cell table**, never a raw `ComponentSet` dump with a text legend.
   - Check `page.findAll(n => n.type === 'COMPONENT_SET' && n.name === '[Component]')` before
     assuming which ComponentSet a table's cells should derive from — the display copy and the
     real master can share a name.
   - **Build the table by cloning the page's own already-correct `variant-grid`** from
     `section-presentation` (`sourceGrid.clone()`) rather than re-deriving spacing by hand, and
     rather than `ComponentSet.layoutMode = 'GRID'` — the GRID technique's fixed-spacing labels
     can drift out of alignment when per-state cell widths vary a lot.
   - Row/column axis labels: `weight: Regular`, color `semantic/color/text/secondary` — never
     `Bold` + an accent color. Fix independently in **all 4 places** per page (Light source,
     Dark source, and each frame's Main-component-frame clone) — clones are plain duplicates,
     not instances of a shared master, so a fix on one never propagates.
   - Dark mode is a fully separate frame, not a re-skin — check and fix it independently.
2. `footer` → a `doc/footer` instance.

---

## 7. `Spec frame` body — the full Specs 2 content (§27, §28.4)

`body` holds **one `section-[name]` frame per subsection**, each `VERTICAL`, `itemSpacing: 32`,
padding `60/60/80/80`, `fills: []` (the top-level frame's fill shows through — step 9), direct
children `doc/section-header` → optional explanatory TEXT → `exhibit-stack`
(`VERTICAL`, `itemSpacing: 48` — exhibits stack, never side-by-side/`WRAP`).

Fixed section order, adapting the axis name to the component (e.g. `section-size` instead of
`section-state` for a component with no interactive states — add a short note explaining the
adaptation):

```
1. section-anatomy             — numbered pin diagram + doc/spec-group layer-property legend
2. section-props                — 4-column table: Name / Type / Default / Options
3. section-variant               — one doc/variant-exhibit per variant option, default state
4. section-state (or -size, …)   — one exhibit per state option, baseline variant
5. section-additional-variants   — non-baseline Variant×State combos that render differently
                                    (skip a combo with no visible delta over the single-axis ones)
6. section-layout-spacing        — auto-layout diagrams (padding/alignment) per state whose
                                    layout itself differs
```

Universal formatting rule for every property line in every subsection:
`Label: token.path.dotted (rawValue)` — the raw value always in parentheses (never color alone
to distinguish token from raw value — WCAG 1.4.1). No token exists → show the raw
value/enum/content string unchanged. Never invent a token path; check `tokens/semantic.json` /
`tokens/component.json` first.

**Before writing any `Direction`/`Alignment`/`*-resizing` line**: read it directly off the real
node (`layoutMode`, `primaryAxisAlignItems`, `counterAxisAlignItems`,
`primaryAxisSizingMode`/`counterAxisSizingMode`) — never reuse a reference screenshot's example
value. Then **cross-check that value against the real CSS/JS** before writing it — Figma itself
can be the thing that's wrong (confirmed incident: 16 of Button's 20 variants had the wrong
`primaryAxisAlignItems`, a real component bug, not a documentation bug — fixed on the master
after user confirmation, per code-is-source-of-truth governance).

Reusable component palette for this section — all on `↳ design annotations`, all bound to the
dedicated `design-annotations` variable collection (never a product semantic token —
§27.5 — measurement chrome must stay visually distinct from product color, e.g. teal padding
badges are indistinguishable from a teal button fill):

`doc/annotation-badge` · `doc/property-row` · `doc/spec-group` · `doc/variant-exhibit` ·
`doc/props-row` · `doc/measurement-badge` · `doc/measurement-tick` · `doc/measurement-overlay` ·
`doc/selection-outline` · `doc/hug-indicator` · `doc/auto-layout-icon`.

`footer` → a `doc/footer` instance.

**Data/JSON export section: do not build it.** `tokens/*.json` already is that export
canonically — a hand-maintained duplicate would drift.

---

## 8. `doc/footer` — every frame's closing band (§28.4bis)

Instance of `1221:3907` (`↳ design annotations`). **Create a plain instance, never detach it**
— even when link content differs per frame.

Set link labels via `setProperties()` at creation (re-verify property keys against
`master.componentPropertyDefinitions` — they're file-specific generated ids, not guaranteed to
stay `1296:0`…`1296:5`):

```js
inst.setProperties({
  'Link 1 label#1296:0': '↗ Guidelines',
  'Link 2 label#1296:1': '↗ NN/g — <topic>',
  'Link 3 label#1296:2': '↗ WCAG <criterion>',
  'Show link 4#1296:3': true,   // false hides the 5th pill for a 4-link page
  'Link 4 label#1296:4': '↗ <label>',
  'Link 5 label#1296:5': '↗ Tokens',
});
```

**A label is not a link.** Set the real `.hyperlink` on the `TEXT` child of each cell
separately — `setProperties()` never touches it:

```js
cell.children.find(c => c.type === 'TEXT').hyperlink = { type: 'URL', value: url };
```

Never invent a URL. Trace every one to a real precedent — the component's own
`guidelines/components/<comp>.md` file (not the shared folder — `blob/`, not `tree/`), the
exact line inside `tokens/component.json` (a GitHub line anchor — no per-component tokens file
exists), a topic-specific NN/g/W3C article already cited elsewhere in the repo (not a generic
hub page reused everywhere). Search `figma.root findAll TEXT` for an existing `.hyperlink`, and
grep the repo for `nngroup.com`/`w3.org`, before writing anything.

```
✅ setProperties() for labels, real .hyperlink on the TEXT node for the link itself
✅ Toggle a master child's visibility and create every instance that needs it in the SAME
   script call — createInstance() can silently drop a child made visible in an earlier,
   separate use_figma call
❌ Never detach — verify getMainComponentAsync() === 1221:3907 on every footer instance
❌ Never strip wrapper's background/subtle fill — footer is the deliberate exception to step 9
```

---

## 9. Frame backgrounds — one fill, top-level only (§28.4ter)

Only the 3 top-level frames (`Main frame`, `Main-component frame`, `Spec frame`) carry a fill
(`semantic/color/background/page`, `#FCFCFC`). Every section/body/wrapper descendant inside —
including nested 2 levels deep, e.g. a `(copy for display)` wrapper's own `section-*`
children — carries `fills: []`. Two documented exceptions: `doc/frame-header` (own
`background/inverse` chrome) and `doc/footer`'s `wrapper` (own `background/subtle`).

---

## 10. Layout, sizing, and width discipline (§2, §17, §20, §25)

```
✅ Any row whose item count depends on the component (states-row, instances-row, variant-grid
   columns): layoutWrap="WRAP" AND layoutSizingHorizontal="FILL" AND counterAxisSpacing set —
   WRAP alone under HUG is a silent no-op, never wraps
✅ No content element wider than 1280px in a section (1440 wrapper − 2×80 padding) — resize
   proportionally or switch to FILL+WRAP, never widen the wrapper past 1440
✅ Icon instance-swap: constraints {horizontal:'SCALE', vertical:'SCALE'} on EVERY child at
   EVERY nesting level down to the leaf, not just the first level or the final Vector nodes —
   test resize with an at-risk icon shape (edges close to the bounds), not a symmetric one
❌ Never tolerate "a few pixels" of overflow as negligible — apply WRAP+FILL with no threshold
```

---

## 11. Accessibility (§11, §21.B)

```
✅ Focus ring: two-color band (light + dark, ≥9:1 contrast between them, W3C technique C40) —
   never a single-color ring assumed sufficient against every background, especially not one
   bound to the same token as the component's own fill (e.g. action/primary on action/primary)
✅ Text contrast ≥4.5:1 normal / ≥3:1 large (≥24px or ≥18.66px Bold) — compute via relative
   luminance, don't eyeball; composite through any semi-transparent ancestor fills first
✅ Icon/UI graphic contrast ≥3:1
✅ disabled states are exempt from contrast — don't flag these as bugs
❌ Never assume a tinted icon on a tinted background is fine without calculating — a solid
   action-primary icon on a 12% action-primary background can be near 1:1
```

---

## 12. Combination testing — the EightShapes method (§23)

For any component with **both** a visually additive state (Focus, Selected…) **and**
variable-size content (free text, optional icons): build one targeted worst-case instance —
the most "additive" state variant, every optional content property on, the longest realistic
label — and screenshot + `findOverflows()` it. Never rely on testing each dimension in
isolation; the Button/Segmented focus-ring incidents were only visible in combination.

Architecture takeaway: an additive indicator (focus ring, etc.) must never be a statically
sized sibling node — wrap it in a `HUG` auto-layout parent so it tracks the content
automatically, or target an element whose size is structurally independent of the variable
content.

---

## 13. Migrating an existing page from the old pattern (§28.5)

```
✅ Rename the emptied old wrapper "_OLD_[original name] (superseded by [new frame name])"
✅ Move it far off-canvas (e.g. x=6000)
✅ Move (not clone) the real master ComponentSet into the new structure
❌ Never delete the old wrapper, even once its content is fully moved out (no-delete rule,
   figma-library-governance.md §A)
```

---

## 14. Completion criterion — when is a page actually "done"? (§28.6)

A page is complete only once `Spec frame` shows the **full** §27 content (Anatomy, Props,
Variant, State, Additional variants, Layout and spacing) — not a placeholder, not a tokens
table standing in for it. GitHub Projects status follows this bar exactly: don't mark a ticket
"Terminé" for a partial Spec frame or a 3-frame shell with an empty/shortened body. <!-- lang-audit-ignore: literal GitHub Projects Status field value -->

---

## 15. Close the session — mandatory audit (§0bis, §22, §26.10)

Run `scripts/figma/audit-figma-file.js` against every page touched, before ending the session —
not deferred to "when the whole file is done." Use
`.claude/instructions/figma-component-page-checklist.md` to walk the full result set and any
manual (not-yet-automated) checks it still requires.
