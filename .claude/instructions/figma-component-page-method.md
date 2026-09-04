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
  API silently reverts to FIXED otherwise. Recurring failure mode: a small helper function
  (e.g. `makeCellFrame(w)` building one table cell) that sets sizing mode then calls
  `resize(w, someArbitraryHeight)` for the width — the height argument silently pins the frame
  at that placeholder height forever, even though only the width was meant to be fixed. Hit 3
  times in one session (segmented page, 2026-09-03: `anatomy-legend`, `props-table`, and all 20
  Main-component-frame table cells) despite this rule already existing — when writing any cell/
  row-builder helper, set sizing modes and resize in the SAME order every time, or better,
  finish appending real children first and set `primaryAxisSizingMode = 'AUTO'` last with no
  `resize()` call afterward.
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
   - **Never set the card itself (`detached.layoutSizingHorizontal = 'FILL'`) when its `dos-row`
     parent is left `primaryAxisSizingMode: 'AUTO'` (HUG)** — FILL only means something when the
     parent has a determinate size along that same axis. Keep the card at `FIXED` 480px (the
     master's authored width) and let the row HUG to `2 × 480 + itemSpacing`, or explicitly set
     the row itself to `counterAxisSizingMode`/`primaryAxisSizingMode: 'FIXED'` first if you
     genuinely want the cards to stretch. Incident (icon page, 2026-09-02): `FILL` under a HUG
     parent did **not** throw (unlike the equivalent case caught on `mode-comparison`, §Spec
     frame below, which did throw) — it silently left the card in a broken auto-layout state
     that only renders visibly wrong (a blue dashed border with resize handles) when the human
     inspects/selects that node in their own Figma tab; a server-rendered `get_screenshot` of
     the same node looked completely clean, which is what made this easy to misdiagnose as "just
     the human's local selection UI" the first time. **Don't trust a clean `get_screenshot` alone
     to rule this out** — check `layoutSizingHorizontal` vs the parent's `primaryAxisSizingMode`
     on the actual axis in question whenever a human reports a persistent visual artifact a
     screenshot doesn't reproduce.
3. **`footer`** — a `doc/footer` instance (step 8 below).

---

## 5bis. `Spec frame` body structure — verified exact shape (§28.4, corrects earlier ambiguity)

`Spec frame` → `body` (`VERTICAL`, padding `40/80/40/80`, width `1440`, FIXED) → **one** child named
`"Spec content (copy for display)"` (`VERTICAL`, width `1280`, `FIXED`, zero padding) → the
`section-[name]` frames as direct children (each `1280` wide, padding `60/80/60/80`, itemSpacing
`32`). Verified live against `button`, `badge`, `checkbox`, `feature-card`. `Main-component frame`
follows the identical `body` (`40/80/40/80`) → `"[component] (copy for display)"` shape. `Main
frame` is the one exception: sections are direct children with **no** `body` wrapper at all —
don't copy the Spec/Main-component pattern onto it. (Incident: `icon`'s Spec frame was built with
sections as direct children of the top-level frame, skipping both wrapper levels — clean audit,
no visible defect, but inconsistent with every other built page; left as a documented low-risk
follow-up rather than reconstructed in the same session it was caught.)

## 5ter. Reflowing a `COMPONENT_SET`'s own editor-canvas grid to fit ≤1280px width

When the real master's default variant arrangement (`layoutMode: 'NONE'`, absolute per-variant
`x`/`y`) is wider than 1280px once moved into `Main-component frame` (common past ~4 columns),
transpose or re-tile it — e.g. swap which property drives columns vs. rows — computing each
variant's new `x`/`y` from a column-stride/row-height table, not by guessing. **After
repositioning children, call `set.resize(maxRight, maxBottom)` on the `COMPONENT_SET` itself** —
its own `width`/`height` do not auto-shrink to the new tighter bounds just because the children
moved; skipping this leaves the set's reported size at its old (wide) value even though every
child now sits well inside 1280px, which cascades into a real, non-cosmetic overflow one level up
the tree (caught on `input`, 2026-09-02: `Input` ComponentSet stayed `1600×284` after a transpose
to `784×607`, overflowing its `displayFrame` by 410px until explicitly resized). When one axis has
a **ragged** set of combinations (e.g. `Type=Search` only defines 3 of 6 `State` options — no
`Error`/`Disabled`/`ReadOnly` variant exists for it), leave those grid cells empty rather than
inventing a variant that doesn't exist in the master. Add row/column axis labels via absolute
positioning matching each row/column's real center (not a fixed guessed offset) — same technique
as `icon`'s size-labels fix, generalized to a 2-axis grid.

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
   - **The established dark-mode location is `section-presentation`'s `mode-comparison`
     block in the `Main frame` — confirmed present on `badge`, `button`, and `checkbox`, each
     as two `doc/mode-frame` instances (detached, "Light"/"Dark" labels) whose `instance-slot`
     holds a real `variant-grid` (header-row + data rows, the same structure as the
     Main-component-frame table), not just 1-2 loose instances.** The `Main-component frame`
     itself has **no** Dark clone on any of those 3 reference pages — don't add one there; it
     was tried and reverted on `segmented`/`tabs` (2026-09-04) after the user pointed out it
     matched no existing page.
   - **Detecting whether a page actually has this already is easy to get wrong.** A `doc/mode-
     frame` in Dark mode is a detached `FRAME` literally named `"doc/mode-frame"` with a child
     `TEXT` node named `label` whose `.characters` is `"Dark"` — the word "dark" never appears
     in any node's own `.name`. A first attempt at this rule used
     `page.findAll(n => /dark/i.test(n.name))` and got an empty result on `badge`/`button`/
     `checkbox`, wrongly concluding none of them had dark-mode content at all (they did — the
     search just couldn't find it). **Detect by structure, not by name**: search for `FRAME`
     nodes named `mode-comparison`, or for `doc/mode-frame`-named children and check their
     `label` child's `.characters`.
   - **Concrete technique for building the Dark half once you're in the right place**: create
     the `Light`/`Dark` `doc/mode-frame` instances (or reuse the page's own already-correct
     `variant-grid`/`states-row` via `.clone()` into each `instance-slot`), then call
     `darkModeFrameInstance.setExplicitVariableModeForCollection(semanticCollection,
     darkModeId)` on the **detached Dark instance's own root** — every bound variable in that
     subtree (including `component/*` tokens that merely alias a `semantic/*` one) re-resolves
     to its Dark value automatically, no manual re-binding needed. Get the collection/mode via
     `(await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name ===
     'semantic')` and `.modes.find(m => m.name === 'Dark').modeId`.
   - **Building the Dark half from reused/legacy content can surface real, previously-invisible
     defects — always screenshot the Dark result, don't assume a clean Light render means the
     underlying nodes are compliant.** Caught on `tabs` (2026-09-04): reused `states-row` cell
     frames had a hardcoded white `fills` (invisible against the light page, a glaring white
     box against the Dark wrapper's background) and hardcoded-black (unbound) caption text
     (invisible-ish in light, illegible near-black-on-black in dark) — both pre-existing,
     neither caught by any prior audit because nobody had rendered that content on a dark
     background before. Fix by binding to a real token (`semantic.color.text.secondary`, etc.),
     never by deleting/hiding the element.
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

**`section-layout-spacing` has a specific, already-established recipe — do not improvise a
simpler substitute.** Established on `button` (its reference implementation), and the recipe
this method file described in one vague line ("auto-layout diagrams") led to two components
(`segmented`, `tabs`) shipping a materially simpler substitute (one plain rectangle + 2
`doc/measurement-badge` + a hand-drawn connector, no property list) before a human caught the
gap by pointing at `button`'s real output side by side (2026-09-04) — that entire first
attempt on both pages had to be rebuilt. The real structure, same `doc/variant-exhibit` shell
as State/Variant (`heading` + `content-row` → `canvas-box` + `spec-group-list`), but the
`canvas-box` this time is a full annotation diagram:

```
canvas-box (clipsContent: false, size instX+instW+17 wide × 130 tall, instX=instY=72 fixed):
  instance-slot's real component instance, at (instX, instY)
  doc/selection-outline   — sized instW+2 × instH+2, at (instX-1, instY-1): dashed/highlight
                             outline marking exactly which element is being measured
  doc/measurement-overlay ×4 — translucent bands INSIDE the instance's own edges marking the
                             padding regions themselves (not gaps outside it):
                             top:    (instX, instY, instW, padY)
                             bottom: (instX, instY+instH-padY, instW, padY)
                             left:   (instX, instY+padY, padX, instH-2*padY)
                             right:  (instX+instW-padX, instY+padY, padX, instH-2*padY)
  doc/measurement-tick ×8  — 4 horizontal (at y = instY, instY+padY-1, instY+instH-padY,
                             instY+instH-1; each spanning x: instX-16 to instX+instW+16) +
                             4 vertical (at x = instX, instX+padX-1, instX+instW-padX,
                             instX+instW-1; each spanning y: instY-16 to instY+instH+16)
  doc/measurement-badge ×4 — the padY value at (instX-33, instY+padY-9) and
                             (instX-33, instY+instH-padY-9); the padX value at
                             (instX+padX/2-12, instY-29) and (instX+instW-padX/2-12, instY-29)
  doc/auto-layout-icon     — one `Property 2=<alignment>` variant (e.g. `middle-center`),
                             fixed at (4, 4) regardless of instance size
  doc/hug-indicator ×1-2   — `Direction=horiz-to-center` sized (instW-20, 24) at (instX+8, 4)
                             when horizontal resizing is Hug; `Direction=vert-to-center` sized
                             (24, instH+20) at (4, instY-8) when vertical resizing is Hug (swap
                             for `Direction=left`/`right`/`top`/`down` if the real axis is FILL
                             or a fixed size instead — check the real node, don't assume Hug)
spec-group-list:
  doc/spec-group, header layer-name = "root" (or "<wrapper-name> (root)"), property-list rows:
    Direction               — "Horizontal" or "Vertical" (raw, no token)
    Alignment               — e.g. "Middle center" (raw, no token)
    Horizontal resizing     — "Hug" / "Fill" / "Fixed" (raw, no token)
    Vertical resizing       — "Hug" / "Fill" / "Fixed" (raw, no token)
    Item spacing            — only if the real node has ≥2 children with a gap; token + (Npx)
    Padding top / bottom    — token + (Npx) — split into 2 rows only if top/bottom ≠ left/right;
    Padding left / right      otherwise one "Padding (all sides)" row (segmented's track: 2px
                              uniform, one row; button/tabs: 8/16 split, two rows)
```

Remove the master `doc/variant-exhibit`'s own default placeholder `canvas-box` child before
inserting the real one (`contentRow.children.filter(c => c.name === 'canvas-box').forEach(c =>
c.remove())`) — otherwise the untouched 164×164 default stays parked as a visible empty gray
box next to the real diagram (hit on `tabs`, caught only by screenshot, not by
`findOverflows()`). Direction/Alignment/resizing values must be read off the real node's
`layoutMode`/`primaryAxisAlignItems`/`counterAxisAlignItems`/`layoutSizingHorizontal`/
`layoutSizingVertical` — never assumed from how similar components looked on other pages (§10's
existing rule on this applies here too, and every exhibit built this way so far — `button`,
`segmented`, `tabs` — has in fact been Hug/Hug/Middle-center/Horizontal, but that is a pattern
observed 3 times, not a rule to stop verifying against).

**`doc/props-row`'s own default width is `1280`, not `1120`.** Every `props-table` in this
method is built at `1120` wide (1280 section content − some inset), so a freshly
`createInstance()`d row overflows the table's right edge by 160px until you explicitly set
`layoutSizingHorizontal = 'FILL'` on it — the same silent-overflow shape as the `doc/section-header`
FILL issue in step 3, but on a different component. Hit on 2 consecutive pages in the same
session (`segmented`, then `tabs` again despite just having fixed it) — set FILL on every
`doc/props-row` instance immediately after `createInstance()`, before populating its
properties, not as an afterthought once `findOverflows()` catches it.

Universal formatting rule for every property line in every subsection:
`Label: token.path.dotted (rawValue)` — the raw value always in parentheses (never color alone
to distinguish token from raw value — WCAG 1.4.1). No token exists → show the raw
value/enum/content string unchanged. Never invent a token path; check `tokens/semantic.json` /
`tokens/component.json` first.

**This is two `TEXT` nodes, never one concatenated string** (incident: icon page, 2026-09-02).
`doc/property-row`'s master already carries this split — `token-name` (teal,
`Atkinson Hyperlegible Mono`) for the token path, `resolved-value` (gray/`text.secondary`,
`Atkinson Hyperlegible` non-mono) for the `(rawValue)` part. Populate both; never cram
`"token.path (rawValue)"` into `token-name` alone and hide `resolved-value` — that reads as an
unreadable wall of teal mono text with no raw-value contrast, exactly the defect a human
caught and asked to fix. When a row genuinely has no separate raw value (e.g. a bare CSS
declaration with nothing to parenthesize), leave `resolved-value` with empty `.characters`
— **do not set `.visible = false` on it**: a freshly `createInstance()`d `doc/property-row`
has been observed to silently drop an invisible `resolved-value` child entirely on a later
`use_figma` call (same defect class as `feedback_figma_createinstance_drops_invisible_children`
in memory, triggered here by toggling visibility instead of by an invisible master state).
If it does go missing, `detachInstance()` the row and manually recreate `resolved-value`
(`Atkinson Hyperlegible` Regular 12px, `semantic.color.text.secondary`) rather than fighting
the picker — same detach-and-rebuild pattern as `doc/dos-donts-card`/`doc/mode-frame`.

**The opposite mistake is just as easy and was hit the very next page (`input`, same session):**
a freshly `createInstance()`d row usually DOES still have its `resolved-value` child (defaulted
to the master's placeholder, e.g. `"(#000000)"`) — `detachInstance()` it and **reuse that same
node** (`detached.findOne(n => n.name === 'resolved-value')`, set `.characters` directly). Don't
blindly `figma.createText()` a brand-new `resolved-value` and `appendChild` it without checking —
that leaves the master's placeholder AND your new text both rendering stacked in the same row
(`"component.input.default.border (#000000) (#E8E8E8)"`). Concretely: for every row, either the
child already exists (reuse it, most common) or it was dropped by the create-then-hide bug above
(recreate it) — never assume one case without checking `findOne` first.

**Connector rotation math — Figma pivots a rectangle around its `(x, y)` corner, never its
center.** Setting `rect.rotation` after `resize()`/`x`/`y` does NOT rotate around the shape's
visual center — it keeps the pre-rotation `(x, y)` point fixed and sweeps the far end around
it. A naive "center the unrotated rect at the line's midpoint, then rotate" approach (centering
math assuming a center-pivot) produces a connector whose visible segment lands nowhere near
either intended endpoint — confirmed via `absoluteRenderBounds` inspection, not just a visual
guess (segmented page, 2026-09-03: a vertical connector meant to span 61px instead rendered a
~30px segment starting at the wrong point). **Correct construction**, given real endpoints
`(x1,y1)` [the anchor] and `(x2,y2)` [the far end]:
```js
const dx = x2 - x1, dy = y2 - y1;
const length = Math.hypot(dx, dy);
const rotationDeg = -Math.atan2(dy, dx) * 180 / Math.PI; // note the leading minus
rect.resize(length, 1.5);
rect.x = x1;
rect.y = y1 - 0.75; // half the thickness, so the line's vertical center sits on y1
rect.rotation = rotationDeg;
```
Verify with `(rect.absoluteRenderBounds || rect.absoluteBoundingBox)` relative to the
illustration frame after creation — the bounding box must span both real endpoints, not just
"look plausible" in the returned `x`/`y`/`width`/`rotation` numbers.

**Never `resize()` or reassign `.x`/`.y` on an already-rotated `_connector` rectangle to move
its endpoint.** A rotated rectangle (any diagonal or reversed-direction connector,
`rotation !== 0`) corrupts its visual bounding box when resized/repositioned in place — it can
render stretched far outside the illustration, well past where the raw property values would
suggest, even though `x`/`width`/`rotation` each look individually plausible in a metadata
dump. Always `.remove()` it and build a fresh one from the real `(x1,y1,x2,y2)` endpoints via
the same connector-drawing helper — never patch a rotated one's geometry after the fact.

**Anatomy connector rectangles must be computed from real node bounds, never eyeballed.** A
`_connector` line runs from the annotated element's actual edge to the badge's actual edge —
read both nodes' live `x`/`y`/`width`/`height` and compute the exact span (e.g. badge bottom
`y` → target top `y`) before setting the rectangle's position/size. A guessed fixed height
(e.g. always `14`) will visibly disconnect the line from one end the moment the icon/badge
aren't at the exact coordinates assumed — caught the same session via a human screenshot.

**Anatomy connector color: `color/accent` (#ED3AA5) from the `design-annotations` variable
collection — never a `semantic.*` token.** This is the SAME variable already bound to
`doc/annotation-badge`'s own pink fill (`VariableID:956:3` in this file) — connectors and the
badges they connect share one color family, which is the whole point of §27.5's "measurement
chrome must stay visually distinct from product color" rule. **Do not use any `semantic.color.*`
token for a connector, ever** — not `action.primary` (teal), not `text.secondary` (gray), not
`feedback.warning`. All three were tried and corrected on `icon`/`input` in the same session
before landing on the right answer via explicit human correction; every reference page (`badge`,
`button`, `checkbox`, `feature-card`) was also swept and fixed to `color/accent` at the same
time — none of them were actually right before this fix, including the ones that looked
internally consistent with each other. If a future page's connectors are ever gray, teal, or
any other non-`design-annotations` color, that is a bug, full stop — there is no "it depends on
the reference page" judgment call left to make here.

**Anatomy illustration frame needs real top/bottom margin, not `y=0` edge-to-edge.** A badge
positioned so its circle extends above `y=0` (e.g. `cy - radius < 0`) gets cropped — not by the
illustration frame itself (keep `clipsContent = false` on it per §9), but by an ANCESTOR
further up (`anatomy-row` has `clipsContent: true` and no top margin of its own). Give the
first pin's badge center a `cy` of at least its radius (`11`) plus a few px of breathing room
(e.g. `cy: 20`, not `cy: 8`) so its top edge never goes negative. Verify by screenshotting the
illustration in isolation at 2–3× zoom, not just the whole section at 0.6–0.8× — cropping this
small is easy to miss at low zoom (caught on `input`, 2026-09-02, after shipping it undetected
on a first pass).

**A pin annotating a layer genuinely INSIDE another element (e.g. the native `<input>` text,
sitting under the control's opaque face) must visually read as reaching inside, not just
poking the same outer edge as the layer that IS the boundary (e.g. the control's border).**
Draw that connector as a **visible line that crosses the boundary**, extending 20–40px past it
into the shape, near the actual content it annotates — not a line hidden behind the instance
(tried first; too subtle, a human reported it still read as "pointing at the same level" as the
boundary pin right next to it, even though the underlying z-order trick was technically
correct). **No terminal dot/circle marker at the inner end** — tried as a second attempt,
explicitly rejected by the human ("pas de rond au bout du trait"); the crossing line by itself
is enough. Full-opacity `color/accent` `_connector` rectangle, rendered ON TOP (normal append
order, not before the instance) — same color as every other connector on the page (see the
connector-color rule above), just longer. A pin for a layer that genuinely IS the outer boundary
(e.g. the control's own border) stays exactly as before, terminating right at that edge — only
apply the crossing treatment to pins annotating a layer with real depth behind another opaque
one. Finalized on `input`'s "input (native text)" pin, 2026-09-02, after three rounds of human
feedback on this one detail — see [[feedback_figma_anatomy_connector_bugs]] for the full
back-and-forth; don't re-litigate any of the three rejected intermediate versions.

**Every interior connector's target point must come from the real instance's own child layers
— never a shared/guessed offset applied uniformly across multiple pins.** Read the actual
example instance's children (`inst.findAll` / walk `.children`) and use each target layer's
real `x`/`y`/`width`/`height` (converted to the illustration's coordinate space) to compute
where that specific pin should end. Applying the same computed depth to two or more pins
"because they're probably about the same" produces a diagram that a human immediately reads as
mechanical/wrong, even when the underlying semantics happen to be correct (e.g. `checkbox`'s
`box` and `check/dash glyph` pins legitimately share almost the same center — verified from the
real nested-icon position, not assumed). **When no real layer exists to sample** (e.g. `button`
has no Figma property for `icon-prefix`/`icon-suffix` at all — confirmed via
`componentPropertyDefinitions`, same class of gap as `input`'s missing `icon` property), don't
fabricate a target with the same false precision as a verified one — stop that connector
noticeably shorter, just past the boundary, so it reads as "approximately here" rather than
claiming a specific point you don't actually have data for.

**Every "root"/boundary-style pin is ONE straight line — never a multi-segment shape.** A
pre-existing two-segment L-shaped connector (found on `feature-card`'s "card (root)" pin, built
before this method file's conventions existed) reads as confusing clutter, not as pointing at
anything specific — a human asked "c'est quoi ces deux traits, je ne comprends pas." <!-- lang-audit-ignore: verbatim quote of what the human said --> Fix:
delete both segments, reposition the badge with clear separation from any neighboring pin's
badge (check real distance against every other badge on the page — repositioning one badge
without rechecking the others caused a visible overlap the first time this was attempted), and
draw one straight (diagonal is fine) line from the badge to a single recognizable point on the
boundary (a corner works well for a whole-frame "root" pin).

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

**The `clipsContent=false` sweep for a focus-ring-bearing component is per-page, not
per-file — doing it once on the first component page does not carry over to the next one.**
Confirmed on `tabs` (2026-09-04): the exact same sweep had already been done on `segmented`
earlier the same session, but `tabs` still shipped with every `states-row`/`mode-comparison`/
`canvas-box`/`exhibit-stack` ancestor at the Figma default `clipsContent: true`, silently
clipping the `Tab` focus-ring down to nothing in the `Main frame` while the `Main-component
frame`'s table cells (built with `clipsContent = false` explicitly in that one script) rendered
it correctly — a human reported this as "the Focus state looks inconsistent between Main frame
and Main-component frame" before it was caught. It reads exactly like a stale/wrong component
reference at first glance (check `getMainComponentAsync()` on both instances first — if both
already resolve to the same, current, correctly-fixed master, the divergence is almost always
a clipping difference between the two locations' ancestor chains, not a data problem). Re-run
the full sweep (every ancestor of every instance of the ComponentSet, up to but excluding the
3 top-level frames) on **every page that reuses that component's focus-ring construction**,
not just the page it was first built on.

---

## 11. Accessibility (§11, §21.B)

**Two-`DROP_SHADOW` focus ring — array order is reversed from intuition.** When building the
C40 two-band ring as two stacked `effects` entries with `showShadowBehindNode: true`, Figma
renders the shadow listed **second** in the array on top, completely overwriting the first
one's color in the overlapping region — regardless of which has the larger `spread`. Putting
the small light band first and the large dark band second (the "obvious" order, and what a
straight copy of an existing `Button`-style focus effect looks like) makes the light band
invisible everywhere it overlaps the dark one, leaving only a single-color ring — exactly the
"single-color ring" defect this section already warns against, just introduced through effect
ordering rather than through token choice. Confirmed via isolated-rectangle pixel sampling
(segmented page, 2026-09-03): a `[white spread 10, magenta spread 25]` array rendered **pure
magenta with zero white pixels**; swapping to `[magenta spread 25, white spread 10]` rendered
the correct two bands (magenta 0–15px, white 15–25px). **Required order: largest spread
(outer/dark band) first, smallest spread (inner/light band) second.** Before trusting any
two-shadow focus ring, pixel-sample a screenshot (not just eyeball it — the defect can be
invisible at small render sizes even when broken, and correct construction can look subtle at
small sizes even when right) to confirm both band colors actually appear. **`Button`'s own
existing Focus-Primary effect array uses the wrong order** (verified same file, 2026-09-03,
not yet fixed — flag to the human before assuming any pre-existing focus-ring effect in this
file is a safe pattern to copy).

**Prefer the stroke-sibling technique over double-`DROP_SHADOW` whenever the real code's own
CSS is a single-color `outline` + `outline-offset`** (true for most components audited so
far — check `components/agtc-<comp>.js` before assuming C40's two-tone band is required; C40
lists a single solid outline with a real offset gap as a valid technique too, not only the
two-band version). Confirmed on `Checkbox` (pre-existing, validated) and rebuilt this way on
`Tabs`/`Segmented` (2026-09-03): add a plain sibling shape named `focus-ring`, sized to the
focused element's own box **+4** in each dimension (2px offset gap on every side),
`layoutPositioning: 'ABSOLUTE'`, positioned at the target's `(x-2, y-2)`, `strokeAlign:
'CENTER'`, `strokeWeight: 2`, stroked (not shadowed) with `border-focus`, corner radius
matching the target's own radius token. Requires `clipsContent = false` on the focused
variant/component itself AND on every ancestor wrapper (table cell, exhibit canvas-box,
instances-row cell, mode-frame slot …) that directly contains an instance of it anywhere in
the file — sweep the whole page for existing instances of the ComponentSet and disable
clipping on their immediate parent chain up to (but not including) the 3 top-level frames,
which must keep `clipsContent = true`. This technique rendered crisply and unambiguously at
every scale tested; the double-shadow technique did not, even after fixing the ordering bug
above and increasing spread — reserve double-`DROP_SHADOW` for a genuinely two-color ring the
code itself implements, not as a default C40 template.

**The `focus-ring` sibling MUST use `constraints: {horizontal:'STRETCH', vertical:'STRETCH'}`,
never a one-time fixed size — this is the concrete fix for the "additive indicator must not be
a statically-sized sibling" rule in §12, not just a theoretical concern.** Any component whose
focused element's box depends on override-able content (a `Label`/`Option * Label` text
property, i.e. almost every text-bearing component) will silently break the ring the moment
someone sets a longer label on an instance — confirmed on `Tabs` (`State=Focus`, box grows
109→239px for a long label) and `Segmented` (`State=Focused`, `tab-1` grows for a long
`Option A Label`): with plain default constraints the ring stayed at its original build-time
size while the box grew past it, cutting through the label text. Fix: set `STRETCH` on both
axes **after** positioning the ring at its initial `(target.x − 2, target.y − 2)` /
`(target.width + 4, target.height + 4)` — STRETCH preserves the current margins from each
parent edge as the parent's auto-layout-driven size changes, which is exactly the 2px offset
gap on every side, and this recomputes correctly even for a ring that wraps only ONE child of
a multi-child auto-layout row (`Segmented`'s `tab-1`), not just a ring wrapping its entire
immediate parent (`Tabs`' whole box) — verified empirically on both shapes via a temporary
test instance with an overridden long label, not assumed from the constraint semantics alone.
Test every new focus-ring this way (override the label to something long, screenshot, delete
the test instance) before considering the component's Focus variant done.

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
