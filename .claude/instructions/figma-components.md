# Rule: figma-components

> Construction rules for Figma components in the Agentica library.
> Based on official Figma best practices (2024-2025) + lessons learned from the build session.
> **Type:** rule
> **Logical path:** .claude/instructions/figma-components.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** .claude/rules/tokens-system.md, .claude/rules/development.md

---

## 0. Fundamental rule — Never a primitive token, never a hardcoded hex

> **This rule applies to ALL Figma code: components AND documentation pages.**

```
❌ FORBIDDEN — primitive token in a fill or stroke
   comp.fills = [{type:"SOLID", color:{r:0,g:0.478,b:0.408}}]
   frame.fills = [hexRgb("#007A68")]
   VARS["color/teal/500"]               ← primitive token

✅ REQUIRED — semantic token via vFill() with fallback
   comp.fills = vFill("color/action/primary", "#007A68")
   frame.fills = vFill("color/background/default", "#FFFFFF")
```

### Why

If a semantic token changes value (e.g. `color/action/primary` switches from teal to blue),
every Figma library update picks it up automatically. With hardcoded hex, nothing moves.
Primitives (`color/teal/500`) expose the implementation, not the intent — see `tokens-system.md`.

### Accepted exceptions

| Case | Reason | Required pattern |
|-----|--------|----------------|
| `gradientStops` | The Figma API doesn't support `setBoundVariableForPaint` on stops | Use the **semantic token's fallback hex** + comment `// token: color/...` |
| Opacity on decorative ellipse | Figma applies opacity on the node, not on the variable | `opacity:` on the node, `vFill()` for the color |

---

## 0bis. Mandatory audit — run `scripts/figma/audit-figma-file.js` before ending ANY session that touched this file

> **Rule adopted 2026-07-23 (ADR-090)**, after a single verification request uncovered five
> regression classes (§26) that had been shipping silently for weeks — including ~1600 color
> bindings pointed at an orphaned variable collection, and hardcoded padding/radius drifted from
> the real code on `Button`'s 20 variants. `findOverflows()` alone (§21.A/§25) does not catch any
> of these — they need their own dedicated checks, and prose checklists get skipped under time
> pressure. A script does not get skipped the same way.

```
✅ Any session that calls use_figma with a mutation (fills, strokes, padding, radius, text,
   layout, new/moved/deleted nodes — anything that isn't a pure read) MUST run
   scripts/figma/audit-figma-file.js against every page it touched before the session ends —
   not just before declaring the whole file "done"
✅ Fan out one use_figma call per touched page in a single message (skill's multi-page rule),
   paste the script's function bodies + a call to auditPage(page) in each
✅ If the audit returns anything in orphanedVariables, unboundComponentProps,
   brokenLineHeights, staleNameReferences, or brokenLinks, treat it as a blocking regression —
   fix it in the same session, don't defer
✅ clippedEffects and overflows entries are candidates to verify visually (§26.10 caveat), not
   automatic failures — check with a screenshot before deciding
❌ Never end a Figma session on "it looks right in the screenshot" alone — the orphaned-variable
   and hardcoded-padding bugs from 2026-07-23 both rendered PERFECTLY normally; only the audit
   script (or a human reading the properties panel) caught them
```

See §26 for the full incident writeups behind each check and §26.10 for what a clean result
looks like. See §26.9 specifically for renames/deletions — maintain `KNOWN_RENAMES` in
`scripts/figma/audit-figma-file.js` the moment anything canonically named changes.

---

## 1. Component properties — when to use what

| Property | Figma type | When to use it |
|-----------|-----------|-----------------|
| Interactive state | **Variant** `State=` | Default, Hover, Focus, Disabled, Loading, Error, ReadOnly |
| Size | **Variant** `Size=` | sm / md / lg when dimensions actually change |
| Visual style | **Variant** `Variant=` | Primary / Secondary / Critical / Ghost |
| Optional sub-element | **Boolean** `HasIconLeft` | Show/hide icon, label, helper text, badge |
| Text content | **Text** `Label=` | Button label, placeholder, card title |
| Icon / avatar slot | **Instance Swap** `Icon=` | Swap an icon or avatar for another instance |

### Absolute rules

```
✅ Use Variant for anything that changes the visual structure (states, sizes)
✅ Use Boolean to toggle a sub-layer on/off (never a Variant for this)
✅ Name text layers identically across variants (e.g. "label")
   → Preserves text overrides when switching variants
✅ Document every component with a description in the properties panel
❌ Never create a Variant just to hide/show a layer → Boolean
❌ Never exceed 10 variants in a single ComponentSet (performance)
❌ Never nest more than 3 levels of components
```

---

## 2. Auto-layout — sizing rules

### Size modes

| Mode | When to use it | Example |
|------|-----------------|---------|
| **HUG** (`AUTO`) | Component that grows with its content | Button, tag, badge |
| **FIXED** | Defined width/height (doc, grid, field) | Input 280 px, doc column |
| **FILL** (`layoutGrow=1`) | Child that fills available space | Text inside an input, flexible column |
| **Min/Max width** | Responsive component with constraints | Input min 120 px / max 480 px |

### Critical rule — resize() before primaryAxisSizingMode

```javascript
// ✅ CORRECT — always in this order
frame.resize(width, 40);          // 1. resize FIRST
frame.primaryAxisSizingMode = "AUTO"; // 2. AUTO after resize

// ❌ INCORRECT — figma silently reverts to FIXED (API bug)
frame.primaryAxisSizingMode = "AUTO";
frame.resize(width, 40);
```

### Padding and gap

```
✅ Bind paddingLeft/paddingRight to space/control/padding-x
✅ Bind paddingTop/paddingBottom to space/control/padding-y
✅ Bind itemSpacing to space/control/gap (controls) or space/layout/component (sections)
✅ Use counterAxisAlignItems = "CENTER" for buttons and inline controls
❌ Never hardcode numeric values — always via bindV()
```

### Nested auto-layout

- A component can contain nested auto-layout frames (e.g. VERTICAL wrapper → HORIZONTAL field)
- Frames without auto-layout (`layoutMode = "NONE"`) allow absolute positioning of children
  → Use for internal controls: Toggle thumb, checkmark, radio dot

---

## 3. Component architecture

### Recommended model (atomic)

```
Level 0 — Primitives
  Icon/16  Icon/24  Avatar/xs  Avatar/md

Level 1 — Simple controls
  Toggle   Checkbox   Radio   Badge

Level 2 — Components
  Button (uses Icon/16)
  Input  (uses Icon/16)
  Select (uses Icon/16 + Badge)

Level 3 — Patterns
  FormField (uses Input + Label + HelperText)
  Toolbar   (uses Button + Toggle + Input)
```

```
✅ Create reusable base components before building composite components
✅ Nest instances (not copied frames) to preserve connections
✅ ONE logical component = ONE ComponentSet, with a Variant property for its
   style variations (Primary/Secondary/Critical/Ghost…) — never a separate
   ComponentSet per variation
❌ Never copy-paste a component's structure instead of nesting its instance
❌ Never duplicate variants to create "a slightly different version"
❌ Never create a separate ComponentSet per style variation (Button/Primary,
   Button/Secondary… as distinct sets) — see the incident below
```

### Structure of an Agentica ComponentSet — corrected rule (ADR 2026-07-06)

> **Incident.** This document's previous rule recommended "one ComponentSet per
> style variation" (`Button / Primary`, `Button / Secondary`… as 4 separate
> ComponentSets) to stay under 10 variants per set. That was a mistake: in Figma,
> each variation then became a **distinct component** — a designer building a
> mockup had to swap the entire instance to go from Primary to Secondary,
> instead of changing a single property. That is not how designers expect to
> work with a variant component (Material, Polaris, etc. all have just one
> Button component). Fixed on 2026-07-06: the 4 Button ComponentSets were
> merged into one with two properties (`Variant`, `State`).

**Correct pattern — ONE ComponentSet, two property axes:**

```
ComponentSet "Button"
  Variant=Primary,   State=Default/Hover/Focus/Disabled/Loading
  Variant=Secondary, State=Default/Hover/Focus/Disabled/Loading
  Variant=Critical,  State=Default/Hover/Focus/Disabled/Loading
  Variant=Ghost,     State=Default/Hover/Focus/Disabled        (Loading not applicable)
```

An incomplete grid (Ghost without Loading) is acceptable — not every combination
has to exist.

**Variant ceiling** — aligned with the `figma-generate-library` skill, not an
arbitrary cap of 10: the real cap is **30 combinations** (`Variant × State`, or
more if other axes are added) before splitting into a sub-component. Button at
19-20 variants stays well within this limit — there was never a reason to
split it.

**There is no "different structure" exception.** An earlier version of this
rule tolerated a separate ComponentSet if the families were "structurally
distinct" (e.g. Input `Search` with a built-in icon that `Text` doesn't have).
Fixed on 2026-07-06: in practice, `Input/Text` and `Input/Search` had been
built as 2 ComponentSets even though `Search` didn't even have a different
structure (just a different placeholder) — and even if the structure had
genuinely differed, the right solution is an **internal slot** (Boolean
`HasIcon` or Instance Swap `Icon=`) inside a single ComponentSet, not a
separate ComponentSet. One logical component = one ComponentSet, always —
structural variation is handled via a property (Boolean/Instance Swap), never
by duplicating the ComponentSet.

### ⚠️ API pitfall — merging components already attached to a ComponentSet

`figma.combineAsVariants()` on components that each belonged to a **distinct**
former ComponentSet produces a broken ComponentSet ("Component set has existing
errors" — `componentPropertyDefinitions` and `variantProperties` become
unreadable), even if the renaming appears to have worked. Each component keeps
an internal reference to its ex-ComponentSet's old property set, and Figma does
not silently reconcile them.

```
❌ FORBIDDEN
const old = [...setA.children, ...setB.children]; // components from DIFFERENT former sets
figma.combineAsVariants(old, page); // → broken, unreadable ComponentSet

✅ CORRECT — rebuild fresh components before merging
// 1. Read fills/strokes/text/layout from each old component (still readable)
// 2. figma.createComponent() for EACH variant, reproduce the visual, name it
//    correctly "Variant=X, State=Y" (fresh components = no leftover property history)
// 3. figma.combineAsVariants(newComponents, page) → clean ComponentSet
// 4. instance.swapComponent(newComponent) on every existing instance
//    BEFORE deleting the old components/ComponentSets
```

See the Button and Input incidents from 2026-07-06 — full recovery documented
in the GitHub Projects history (ADR-069). Same fix applied to both: Button (4
`Variant` ComponentSets → 1, 19 variants) and Input (2 `Type` ComponentSets →
1, 9 variants).

---

## 4. Naming

### Components and ComponentSets

| Element | Convention | Example |
|---------|-----------|---------|
| ComponentSet | `Name / Variant` | `Button / Primary` |
| Variant property | `State=Value` | `State=Default` |
| Boolean property | PascalCase | `HasIconLeft`, `ShowHelper` |
| Text property | PascalCase | `Label`, `Placeholder` |

### Internal layers

```
✅ Name layers semantically and stably: "label", "field", "icon-left", "track", "thumb"
✅ Keep the SAME layer name across every variant of a ComponentSet
   → Preserves text overrides when switching state
✅ Prefix invisible layers with "_": "_focus-ring" (optional convention)
❌ Leave default names (Frame 47, Rectangle 2, Group 12)
```

### Figma pages

```
🎯 Brand          ← brand assets, never touch
🎨 Foundations    ← cover + sub-pages
  Foundations / Colors
  Foundations / Typography
  Foundations / Spacing
  Foundations / Logos
  Foundations / Icons
🧩 Components     ← catalog cover + sub-pages
  Components / Button
  Components / Input
  ...
📐 Patterns       ← flows, compositions, in-context examples
```

---

## 5. Binding Variables and Styles

### Mapping table — semantic token → fallback hex

> Every color used in components AND in documentation pages must come from
> this table. **Never a hex value outside this table.**

#### Action and brand colors

| Semantic token | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/action/primary` | `#007A68` | teal.11 | Main fill — button, link |
| `color/action/primary-hover` | `#0d3d38` | teal.12 | Hover / pressed state |
| `color/action/primary-subtle` | `#F0FAF8` | teal.2 | Description text on teal background (Header approach B) |

#### Text

| Semantic token | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/text/primary` | `#202020` | gray.12 | Body text, headings |
| `color/text/secondary` | `#646464` | gray.11 | Description, labels, helper text |
| `color/text/disabled` | `#767676` | neutral.500 | Placeholder, Disabled text |
| `color/text/on-action` | `#FFFFFF` | neutral.0 | Text on an action/primary background |

#### Backgrounds

| Semantic token | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/background/surface` | `#FFFFFF` | neutral.0 | Field background (Input), cards, white sections |
| `color/background/subtle` | `#f0f0f0` | gray.3 | Alternation, state cells, showcase background |
| `color/background/page` | `#fcfcfc` | gray.1 | page-wrapper background |
| `color/background/hover` | `#fafafa` | neutral.50 | Table row hover |

#### Feedback (DO / DON'T / error states)

| Semantic token | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/feedback/success` | `#18794e` | green.11 | DO badge, DO-column left border |
| `color/feedback/danger` | `#ce2c31` | red.11 | DON'T badge, error message, Error border |

#### Borders

| Semantic token | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/border/default` | `#e8e8e8` | gray.4 | Card stroke, table, Default field |
| `color/border/focus` | `#007A68` | teal.11 | 2px OUTSIDE focus ring — strokes |
| `color/border/danger` | `#ce2c31` | red.11 | Error field border |

---

### Fills and strokes

```javascript
// ✅ CORRECT — semantic token + fallback (values from primitives.json)
comp.fills  = vFill("color/action/primary",      "#007A68"); // teal.11
frame.fills = vFill("color/background/surface",  "#FFFFFF"); // neutral.0
text.fills  = vFill("color/text/secondary",      "#646464"); // gray.11

// Strokes via setBoundVariableForPaint
comp.strokes = [figma.variables.setBoundVariableForPaint(
  {type:"SOLID", color:hex("#006B5C")},
  "color",
  VARS["color/border/focus"]
)];

// ❌ FORBIDDEN
comp.fills = [{type:"SOLID", color:{r:0,g:0.478,b:0.408}}]; // raw hex
comp.fills = [{type:"SOLID", color:hexRgb("#007A68")}];      // raw hex
VARS["color/teal/500"]                                        // primitive token
```

### Float properties

```javascript
// ✅ Fallback value first, then bindV()
comp.paddingLeft = 16;
bindV(comp, 'paddingLeft', 'space/control/padding-x');
```

### Text

```javascript
// ✅ Required order to avoid Figma API errors
t.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")}; // 1. font loaded
t.fontSize = 14;                                 // 2. default size
t.characters = "Label";                          // 3. content
t.textStyleId = TX["typography/label"].id;       // 4. style (overrides font)
t.fills = vFill("color/text/primary","#202020"); // 5. semantic token (gray.12)
```

### Exception — gradientStops (binding not supported by the API)

```javascript
// The only case where hex can appear directly
// → Use the semantic token's fallback + comment its name
{
  type: "GRADIENT_LINEAR",
  gradientTransform: [[1, 0, 0], [0, 1, 0.5]],
  gradientStops: [
    {position: 0, color: {r:1,   g:1,    b:1,    a:0}},  // color/background/default transparent
    {position: 1, color: {r:0,   g:0.478,b:0.408,a:0.14}}, // color/action/primary @ 14%
  ]
}
// ✅ The hex matches the semantic token's fallback — token referenced in a comment
```

### Variable scoping

- Define variables with the narrowest scope possible:
  - `color/text/*` → TEXT FILL scope
  - `color/background/*` → FRAME FILL scope
  - `color/border/*` → STROKE scope
  - `space/*` → GAP, PADDING scope
  - `radius/*` → CORNER RADIUS scope
- This keeps color/text variables from showing up in the frame background picker

---

## 6. Performance and scalability

```
✅ Maximum 10 variants per ComponentSet
✅ Maximum 3 levels of component nesting
✅ Split the library into files if > 200 components (Foundation lib / Component lib / Pattern lib)
✅ Use Shared Libraries to distribute components to other files
❌ Don't put every component in a single frame/page → lag
❌ Don't use a Group where an auto-layout Frame would be appropriate
❌ Don't create a "preview ComponentSet" with 100 instances → use dedicated doc pages
```

---

## 7. Checklist before publishing a component

**Component**
- [ ] All fills/strokes via `vFill(semanticToken, fallback)` — never direct `hexRgb()`, never a primitive token
- [ ] Gradient stops: `// token: color/...` comment present on every stop
- [ ] All text bound to a Text Style + color via Variable
- [ ] Padding, gap, cornerRadius bound to Float Variables
- [ ] All interactive states covered (Default, Hover, Focus, Disabled minimum)
- [ ] Layers named semantically and stably across variants
- [ ] Component description filled in (Figma properties panel)

**Documentation page**
- [ ] `page-wrapper` VERTICAL auto-layout — no manually positioned element
- [ ] `section-header` with title, description, and `links-row` (≥ 3 links)
- [ ] `section-showcase` with every ComponentSet visible
- [ ] `section-states` or `section-tokens` with a descriptive table
- [ ] `section-dos-donts` with at least 1 DO/DON'T pair
- [ ] No visible overlap — clean vertical scroll
- [ ] section-header: gradient decoration (approach A or B, never text on an unverified background)
- [ ] Decorative elements prefixed `_` and `layoutPositioning = "ABSOLUTE"`

**Distribution**
- [ ] Tested at different widths (if the component is responsive)
- [ ] `Components` catalog (35:7) updated (✅ badge)

---

## 8. Component page layout

### Co-location rule — documentation on the same page as the component

> **Documentation (states, tokens, DO/DON'T, links) lives on the SAME Figma page as the component.**
> No separate "doc" page — a single `page-wrapper` holds everything.

```
Page "Components / Button"
  └── page-wrapper (VERTICAL auto-layout)
        ├── section-header      ← title, description, links
        ├── section-showcase    ← ComponentSets (the component itself)
        ├── section-states      ← state documentation
        ├── section-tokens      ← tokens used
        ├── section-dos-donts   ← best practices
        └── section-links       ← external references

Page "Patterns / Form"
  └── page-wrapper (same structure)
        ├── section-header
        ├── section-showcase    ← pattern in a real situation
        ├── section-anatomy     ← annotations
        ├── section-dos-donts
        └── section-links
```

Same for patterns. The `Components` catalog (35:7) only holds a **summary**;
the full documentation always lives on the dedicated page.

---

### Problem to avoid — overlap

Nodes created without explicit positioning all stack up at `x=0, y=0`.
**Solution: a VERTICAL auto-layout `page-wrapper` that holds everything.**

```javascript
// ✅ REQUIRED PATTERN — start of every component / pattern page
// All fills via vFill() — never hexRgb() directly (see section 0)
const wrapper = figma.createFrame();
wrapper.name = "page-wrapper";
wrapper.fills = vFill("color/background/page", "#F4F4F5");
wrapper.layoutMode = "VERTICAL";
wrapper.primaryAxisSizingMode = "AUTO";       // height = content
wrapper.counterAxisSizingMode = "FIXED";
wrapper.resize(1440, 800);                    // fixed width, height adjusted after
wrapper.itemSpacing = 0;                      // gap handled by sections
wrapper.paddingTop = 0; wrapper.paddingBottom = 0;
wrapper.paddingLeft = 0; wrapper.paddingRight = 0;
wrapper.clipsContent = false;
// All elements are appended to wrapper, not to figma.currentPage
```

### Section backgrounds — tokens and alternation

| Section | Semantic token | Hex fallback | Main text ratio |
|---------|-----------------|-------------|----------------------|
| section-header | `color/background/default` | `#FFFFFF` | 16.4:1 ✅ |
| section-showcase | `color/background/subtle` | `#F4F4F5` | 14.9:1 ✅ |
| section-states | `color/background/default` | `#FFFFFF` | 16.4:1 ✅ |
| section-tokens | `color/background/subtle` | `#F4F4F5` | 14.9:1 ✅ |
| section-dos-donts | `color/background/default` | `#FFFFFF` | 16.4:1 ✅ |
| section-links | `color/background/subtle` | `#F4F4F5` | 14.9:1 ✅ |

```javascript
// Helper — always vFill() for the section background
function mkSection(name, bgToken, bgFallback) {
  const s = figma.createFrame();
  s.name = name;
  s.fills = vFill(bgToken, bgFallback);
  s.layoutMode = "VERTICAL";
  s.primaryAxisSizingMode = "AUTO";
  s.counterAxisSizingMode = "FIXED";
  s.resize(1440, 40);
  s.itemSpacing = 24;
  s.paddingTop = 60; s.paddingBottom = 60;
  s.paddingLeft = 80; s.paddingRight = 80;
  s.clipsContent = false;
  return s;
}

// Standard calls
const sHeader   = mkSection("section-header",    "color/background/default", "#FFFFFF");
const sShowcase = mkSection("section-showcase",  "color/background/subtle",  "#F4F4F5");
const sStates   = mkSection("section-states",    "color/background/default", "#FFFFFF");
const sTokens   = mkSection("section-tokens",    "color/background/subtle",  "#F4F4F5");
const sDos      = mkSection("section-dos-donts", "color/background/default", "#FFFFFF");
const sLinks    = mkSection("section-links",     "color/background/subtle",  "#F4F4F5");
```

### Wrapper positioning

```javascript
wrapper.x = 0;
wrapper.y = 0;
// Do NOT call figma.currentPage.appendChild(wrapper) — it attaches automatically
```

---

## 9. DO / DON'T template

**Rule: always include a DOs/DON'Ts section on every component page.**

The columns use a **white** background with a **colored left border** (4px) as the visual
signal. This choice guarantees minimum contrast on secondary text (description), which was
failing on a tinted background (4.48:1 < 4.5:1 required by WCAG AA). On a white background,
every text passes ≥ 6.4:1.

### Verified DO/DON'T palette

| Role | Hex | Background | WCAG ratio |
|------|-----|------|-----------|
| DO — left border | `#1B6E1B` | — | — |
| DO — badge text | `#1B6E1B` | `#FFFFFF` | **6.4:1** ✅ AA |
| DON'T — left border | `#B91C1C` | — | — |
| DON'T — badge text | `#B91C1C` | `#FFFFFF` | **6.5:1** ✅ AA |
| Example text | `#1C2024` | `#FFFFFF` | **16.4:1** ✅ AAA |
| Description text | `#4A5568` | `#FFFFFF` | **7.5:1** ✅ AA |

### Code pattern

```javascript
function mkDosSection(doExample, dontExample) {
  // Horizontal container with no fill of its own (background = parent section #FFFFFF)
  const row = figma.createFrame();
  row.name = "dos-row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 32;
  row.fills = [];

  function mkColumn(type, exampleText, description) {
    const col = figma.createFrame();
    col.name = type === "do" ? "do-column" : "dont-column";
    col.layoutMode = "VERTICAL";
    col.primaryAxisSizingMode = "AUTO";
    col.counterAxisSizingMode = "FIXED";
    col.resize(560, 40);
    col.itemSpacing = 12;
    col.paddingTop = 20; col.paddingBottom = 20;
    col.paddingLeft = 20; col.paddingRight = 20;
    col.cornerRadius = 8;
    col.fills = vFill("color/background/default", "#FFFFFF"); // 16.4:1 ✅

    // Colored left border (4px) — semantic token depending on type
    const borderToken = type === "do" ? "color/feedback/success" : "color/feedback/error";
    const borderFallback = type === "do" ? "#1B6E1B" : "#B91C1C";
    col.strokes = [figma.variables.setBoundVariableForPaint(
      {type:"SOLID", color:{r:borderFallback==="#1B6E1B"?0.106:0.725,
                            g:borderFallback==="#1B6E1B"?0.431:0.110,
                            b:borderFallback==="#1B6E1B"?0.106:0.110}},
      "color", VARS[borderToken]
    )];
    col.strokeWeight = 4;
    col.strokeAlign = "INSIDE";

    // DO / DON'T badge
    const badge = figma.createText();
    badge.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
    badge.fontSize = 12;
    badge.characters = type === "do" ? "✅  DO" : "❌  DON'T";
    badge.fills = vFill(borderToken, borderFallback); // 6.4:1 on white ✅
    col.appendChild(badge);

    // Example
    const example = figma.createText();
    example.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
    example.fontSize = 14;
    example.characters = exampleText;
    example.fills = vFill("color/text/primary", "#1C2024"); // 16.4:1 ✅
    example.textAutoResize = "HEIGHT";
    col.appendChild(example);

    // Description
    const desc = figma.createText();
    desc.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
    desc.fontSize = 13;
    desc.characters = description;
    desc.fills = vFill("color/text/secondary", "#4A5568"); // 7.5:1 ✅
    desc.textAutoResize = "HEIGHT";
    col.appendChild(desc);

    return col;
  }

  row.appendChild(mkColumn("do",   doExample.text,   doExample.desc));
  row.appendChild(mkColumn("dont", dontExample.text, dontExample.desc));
  return row;
}
```

### Integration into the section

```javascript
const sectionDos = mkSection("section-dos-donts", "#FFFFFF");

const dosLabel = figma.createText();
dosLabel.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
dosLabel.fontSize = 14;
dosLabel.characters = "Best practices";
dosLabel.fills = vFill("color/text/primary", "#1C2024");
sectionDos.appendChild(dosLabel);

const dosRow = mkDosSection(
  {text: "Permanently delete this folder",
   desc: "Explicit label — the user understands the action and its impact."},
  {text: "OK",
   desc: "Vague label — doesn't describe the critical action or its consequences."}
);
sectionDos.appendChild(dosRow);
wrapper.appendChild(sectionDos);
```

### Content rules

```
✅ White background for columns — never a tinted background (contrast issues confirmed)
✅ 4px colored left border as the signal — visible enough, not intrusive
✅ DO: show the right way to do it + a short justification
✅ DON'T: show the most common anti-pattern + its consequence
✅ Maximum 3 DO/DON'T pairs per page
❌ Green/red background: DO badge on #F0FCEF = 4.15:1 — FAILS WCAG AA
❌ Red background: description on #FFEFEF = 4.48:1 — FAILS WCAG AA (< 4.5:1)
```

---

## 10. Mandatory links

**Every component page must have a `links-row` — exactly once, in `section-links` at the bottom of the page.**

> History: this rule used to require a `links-row` in the header AND in
> `section-links`, which duplicated the same content twice on the page (fixed
> on 2026-07-06 — see §17 Known errors). The header now only contains the
> title and description; links live only at the bottom of the page.

### Verified link palette

| Role | Text hex | Background hex | WCAG ratio |
|------|-----------|----------|-----------|
| Link text | `#006B5C` | `#FFFFFF` | **6.5:1** ✅ AA |
| Link text | `#006B5C` | `#F4F4F5` | **5.9:1** ✅ AA |
| Pill border | `#006B5C` 40% | — | (decorative) |

> `#007A6A` on a tinted pill background (#E0ECEC) = **4.35:1 — FAIL** — replaced by `#006B5C` on a transparent background.

### Mandatory links

| Link | Source | Present when |
|------|--------|---------------|
| Guidelines | `guidelines/components/<comp>.md` (repo) | Always |
| NN/g | Relevant Nielsen Norman article | Always |
| WCAG | Applicable WCAG 2.1/2.2 criterion | If the component is interactive |
| ADR | `decisions/ADR-XXX.md` | If an ADR exists |
| Tokens | `tokens/component.json` (repo) | Always |

### Code pattern

```javascript
function mkLinksRow(links) {
  const row = figma.createFrame();
  row.name = "links-row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 12;
  row.fills = [];

  links.forEach(link => {
    const pill = figma.createFrame();
    pill.name = `link-${link.label.toLowerCase().replace(/\s/g,'-')}`;
    pill.layoutMode = "HORIZONTAL";
    pill.primaryAxisSizingMode = "AUTO";
    pill.counterAxisSizingMode = "AUTO";
    pill.itemSpacing = 4;
    pill.paddingTop = 6; pill.paddingBottom = 6;
    pill.paddingLeft = 12; pill.paddingRight = 12;
    pill.cornerRadius = 100;
    pill.fills = vFill("color/background/default", "#FFFFFF"); // 6.5:1 ✅ on white background
    pill.strokes = [figma.variables.setBoundVariableForPaint(
      {type:"SOLID", color:{r:0, g:0.420, b:0.361}}, // #006B5C
      "color", VARS["color/border/focus"]
    )];
    pill.strokeWeight = 1;
    pill.strokeAlign = "INSIDE";

    const txt = figma.createText();
    txt.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Medium")};
    txt.fontSize = 12;
    txt.characters = `↗  ${link.label}`;
    txt.fills = vFill("color/border/focus", "#006B5C"); // 6.5:1 on white ✅
    txt.hyperlink = {type:"URL", value:link.url};
    pill.appendChild(txt);
    row.appendChild(pill);
  });
  return row;
}
```

### Typical call (Button example)

```javascript
const linksRow = mkLinksRow([
  {label:"Guidelines",     url:"https://github.com/orgs/agentica/docs/components/button.md"},
  {label:"NN/g — Buttons", url:"https://www.nngroup.com/articles/command-links/"},
  {label:"WCAG 1.3.5",     url:"https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose"},
  {label:"ADR-042",        url:"https://github.com/orgs/agentica/decisions/ADR-042"},
  {label:"Tokens",         url:"https://github.com/orgs/agentica/tokens/component.json"},
]);
```

### Content rules

```
✅ White background on the pills (translucent tinted background = #007A6A on #E0ECEC = 4.35:1 — FAIL)
✅ Text #006B5C — 6.5:1 on white, 5.9:1 on zinc ✅ (vs #007A6A which fails on a tinted pill)
✅ Absolute URLs — never relative paths
✅ links-row only in section-links (bottom of page) — never also in section-header
❌ opacity on the whole pill — dilutes readability; put opacity on the pill frame, not the text
❌ Link to a Figma file (risk of a circular loop)
❌ Duplicate the same links-row in the header AND section-links
```

---

## 11. Accessibility palette — verified WCAG AA values

> All values below were computed using the WCAG 2.1 formula (relative luminance).
> Minimum required ratio: **4.5:1** for normal text (< 18pt / < 14pt bold).

### Text on page backgrounds

| Role | Text hex | Background hex | Ratio | WCAG |
|------|-----------|----------|-------|------|
| Heading (H1-H2) | `#1C2024` | `#FFFFFF` | 16.4:1 | ✅ AAA |
| Heading (H1-H2) | `#1C2024` | `#F4F4F5` | 14.9:1 | ✅ AAA |
| Body / label | `#1C2024` | `#FFFFFF` | 16.4:1 | ✅ AAA |
| Secondary | `#4A5568` | `#FFFFFF` | 7.5:1 | ✅ AA |
| Secondary | `#4A5568` | `#F4F4F5` | 6.9:1 | ✅ AA |
| Teal link | `#006B5C` | `#FFFFFF` | 6.5:1 | ✅ AA |
| Teal link | `#006B5C` | `#F4F4F5` | 5.9:1 | ✅ AA |

### DO / DON'T

| Role | Text hex | Background hex | Ratio | WCAG |
|------|-----------|----------|-------|------|
| DO badge | `#1B6E1B` | `#FFFFFF` | 6.4:1 | ✅ AA |
| DON'T badge | `#B91C1C` | `#FFFFFF` | 6.5:1 | ✅ AA |
| ~~DO badge (old)~~ | ~~`#228B22`~~ | ~~`#F0FCEF`~~ | ~~4.15:1~~ | ❌ FAIL |
| ~~Description (old)~~ | ~~`#637180`~~ | ~~`#FFEFEF`~~ | ~~4.48:1~~ | ❌ FAIL |

### Values to never use in this context

| Forbidden combination | Ratio | Problem |
|-----------------------|-------|---------|
| `#228B22` on `#F0FCEF` | 4.15:1 | Tinted DO badge — FAIL |
| `#637180` on `#FFEFEF` | 4.48:1 | Description on pink background — FAIL |
| `#007A6A` on `#E0ECEC` | 4.35:1 | Link on translucent teal pill — FAIL |

---

## 12. Decorations — Hero Gradient

### Decoration accessibility principle

> Any decoration that **touches** text must be checked for contrast.
> Decorative elements with no text on top of them can have any opacity.

Two approaches are defined — the choice is made at the page level:

| Approach | When to use it | Text |
|----------|-----------------|-------|
| **A — Partial** (recommended) | White header + teal as a right-side decoration | Dark (#1C2024) |
| **B — Bold** | Fully teal header — strong visual impact | White (#FFFFFF) |

---

### Approach A — Partial gradient (right-side decoration)

The header background stays white. The teal decoration is an absolutely positioned
overlay in the right half — **never underneath text**. All text stays on a white background.

```javascript
function mkHeaderSection(title, description) {
  const section = figma.createFrame();
  section.name = "section-header";
  section.fills = vFill("color/background/default", "#FFFFFF");
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "FIXED";
  section.resize(1440, 40);
  section.primaryAxisSizingMode = "AUTO";
  section.itemSpacing = 20;
  section.paddingTop = 60; section.paddingBottom = 60;
  section.paddingLeft = 80; section.paddingRight = 80;
  section.clipsContent = true; // clip overflowing blobs

  // ── Absolute decorations ("_" prefix = non-content) ──────────────────

  // Right-side gradient (transparent → color/action/primary 14%)
  // Accepted exception (section 0): gradientStops don't support setBoundVariableForPaint
  // → semantic token's fallback hex + mandatory comment
  const decoGrad = figma.createFrame();
  decoGrad.name = "_deco-gradient";
  decoGrad.resize(800, 320);
  decoGrad.fills = [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1,0,0],[0,1,0.5]], // left→right
    gradientStops: [
      {position:0,   color:{r:1,  g:1,    b:1,    a:0   }}, // color/background/default transparent
      {position:0.5, color:{r:0,  g:0.478,b:0.408,a:0.06}}, // color/action/primary 6%
      {position:1,   color:{r:0,  g:0.478,b:0.408,a:0.14}}, // color/action/primary 14%
    ]
  }];
  decoGrad.strokes = []; decoGrad.effects = [];
  decoGrad.layoutPositioning = "ABSOLUTE";
  decoGrad.x = 640; decoGrad.y = 0;
  section.appendChild(decoGrad);

  // Large blob — color via vFill(), opacity via node.opacity (not on the fill)
  const blob1 = figma.createEllipse();
  blob1.name = "_deco-blob-lg";
  blob1.resize(340, 340);
  blob1.fills = vFill("color/action/primary", "#007A68");
  blob1.opacity = 0.07; // opacity on the node — section 0 exception
  blob1.layoutPositioning = "ABSOLUTE";
  blob1.x = 1160; blob1.y = -120;
  section.appendChild(blob1);

  // Small secondary blob
  const blob2 = figma.createEllipse();
  blob2.name = "_deco-blob-sm";
  blob2.resize(180, 180);
  blob2.fills = vFill("color/action/primary", "#007A68");
  blob2.opacity = 0.05;
  blob2.layoutPositioning = "ABSOLUTE";
  blob2.x = 1310; blob2.y = 100;
  section.appendChild(blob2);

  // ── Content (participates in auto-layout) ──────────────────────────────────

  const titleNode = figma.createText();
  titleNode.name = "component-title";
  titleNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
  titleNode.fontSize = 32;
  titleNode.characters = title;
  titleNode.fills = vFill("color/text/primary", "#1C2024"); // 16.4:1 ✅
  section.appendChild(titleNode);

  const descNode = figma.createText();
  descNode.name = "description";
  descNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
  descNode.fontSize = 16;
  descNode.characters = description;
  descNode.fills = vFill("color/text/secondary", "#4A5568"); // 7.5:1 ✅
  descNode.textAutoResize = "HEIGHT";
  section.appendChild(descNode);

  // No links-row here — it lives only in section-links, at the bottom of the page (§10)

  return section;
}
```

**Contrast check — Approach A:**

| Text | Effective background | Ratio | WCAG |
|-------|--------------|-------|------|
| Title `#1C2024` | `#FFFFFF` | 16.4:1 | ✅ AAA |
| Description `#4A5568` | `#FFFFFF` | 7.5:1 | ✅ AA |
| Link `#006B5C` | `#FFFFFF` | 6.5:1 | ✅ AA |
| Teal background 14% max | No text on top | — | decorative ✅ |

---

### Approach B — Full teal gradient (white text)

The entire header is teal. Text switches to **white** — contrast checked.
Link pills become white pills with teal text.

```javascript
function mkHeaderSectionBold(title, description) {
  const section = figma.createFrame();
  section.name = "section-header";
  // Dark diagonal gradient → brand teal
  // gradientStops exception (section 0) — hex = fallback of the semantic tokens
  section.fills = [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: [
      {position:0, color:{r:0,  g:0.353,b:0.294,a:1}}, // color/action/primary-hover #005A4E
      {position:1, color:{r:0,  g:0.478,b:0.408,a:1}}, // color/action/primary #007A68
    ]
  }];
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "FIXED";
  section.resize(1440, 40);
  section.primaryAxisSizingMode = "AUTO";
  section.itemSpacing = 20;
  section.paddingTop = 60; section.paddingBottom = 60;
  section.paddingLeft = 80; section.paddingRight = 80;
  section.clipsContent = true;

  // Decorative blobs — color via vFill(), opacity via node.opacity
  const blobW1 = figma.createEllipse();
  blobW1.name = "_deco-blob-white-lg";
  blobW1.resize(400, 400);
  blobW1.fills = vFill("color/text/on-primary", "#FFFFFF"); // white
  blobW1.opacity = 0.06;
  blobW1.layoutPositioning = "ABSOLUTE";
  blobW1.x = 1100; blobW1.y = -160;
  section.appendChild(blobW1);

  const blobW2 = figma.createEllipse();
  blobW2.name = "_deco-blob-white-sm";
  blobW2.resize(200, 200);
  blobW2.fills = vFill("color/text/on-primary", "#FFFFFF");
  blobW2.opacity = 0.04;
  blobW2.layoutPositioning = "ABSOLUTE";
  blobW2.x = 1280; blobW2.y = 80;
  section.appendChild(blobW2);

  // White title — color/text/on-primary (5.27:1 min on #007A68 ✅)
  const titleNode = figma.createText();
  titleNode.name = "component-title";
  titleNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
  titleNode.fontSize = 32;
  titleNode.characters = title;
  titleNode.fills = vFill("color/text/on-primary", "#FFFFFF");
  section.appendChild(titleNode);

  // Description — slightly tinted color for visual hierarchy (4.95:1 ✅)
  const descNode = figma.createText();
  descNode.name = "description";
  descNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
  descNode.fontSize = 16;
  descNode.characters = description;
  descNode.fills = vFill("color/action/primary-subtle", "#F0FAF8");
  descNode.textAutoResize = "HEIGHT";
  section.appendChild(descNode);

  // No links-row here — it lives only in section-links, at the bottom of the page (§10)
  // mkLinksRowOnDark stays available if a link pill is needed elsewhere on a teal background

  return section;
}

// mkLinksRow variant for a teal background (white pills, teal text)
function mkLinksRowOnDark(links) {
  const row = figma.createFrame();
  row.name = "links-row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 12;
  row.fills = [];
  links.forEach(link => {
    const pill = figma.createFrame();
    pill.name = `link-${link.label.toLowerCase().replace(/\s/g,'-')}`;
    pill.layoutMode = "HORIZONTAL";
    pill.primaryAxisSizingMode = "AUTO"; pill.counterAxisSizingMode = "AUTO";
    pill.itemSpacing = 4;
    pill.paddingTop = 6; pill.paddingBottom = 6;
    pill.paddingLeft = 12; pill.paddingRight = 12;
    pill.cornerRadius = 100;
    pill.fills = vFill("color/background/default", "#FFFFFF"); // white background — semantic token
    const txt = figma.createText();
    txt.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Medium")};
    txt.fontSize = 12;
    txt.characters = `↗  ${link.label}`;
    txt.fills = vFill("color/border/focus", "#006B5C"); // 6.5:1 on white ✅
    txt.hyperlink = {type:"URL", value:link.url};
    pill.appendChild(txt);
    row.appendChild(pill);
  });
  return row;
}
```

**Contrast check — Approach B:**

| Text | Effective background | Ratio | WCAG |
|-------|--------------|-------|------|
| White title | `#005A4B` (dark) | 8.2:1 | ✅ AAA |
| White title | `#007A68` (light) | 5.3:1 | ✅ AA |
| Description `#F0FAF8` | `#007A68` | 5.0:1 | ✅ AA |
| Teal link `#006B5C` | pill `#FFFFFF` | 6.5:1 | ✅ AA |

---

### section-showcase decoration — Subtle dots

```javascript
// Add a grid of dots to the section-showcase background
function addDotGrid(section, cols, rows) {
  const dotSize = 4, spacing = 24;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const dot = figma.createEllipse();
      dot.name = "_dot";
      dot.resize(dotSize, dotSize);
      dot.fills = vFill("color/action/primary", "#007A68");
      dot.opacity = 0.12; // opacity on the node — section 0 exception
      dot.layoutPositioning = "ABSOLUTE";
      dot.x = c * spacing; dot.y = r * spacing;
      section.appendChild(dot);
    }
  }
}
// Call (20×8 = 160 dots over ~480×192px)
const showcase = mkSection("section-showcase", "#F4F4F5");
showcase.clipsContent = true;
addDotGrid(showcase, 20, 8);
// Then add the ComponentSets into showcase (they render above)
```

---

### Decoration rules

```
✅ Prefix decorative layers with "_": _deco-gradient, _deco-blob-lg
✅ layoutPositioning = "ABSOLUTE" on every decorative element
✅ section.clipsContent = true when decorations overflow
✅ Max opacity: 14% for decorative fills (preserves contrast)
✅ No text on an unverified tinted background
❌ Don't put text inside _deco-* frames
❌ Opacity > 20% for decorations (risk to adjacent text)
❌ Blobs / gradients in section-states, section-tokens, section-dos-donts
   → these sections stay pure white or zinc to maximize readability
```

---

## 13. Canvas background — the #535353 rule

> **Every Figma page (except Brand) must have a `#535353` canvas background.**
> This rule applies to every new page and every build script.

```javascript
// ✅ REQUIRED — run on every page (except Brand 17:4)
function h2r(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return {r,g,b};
}
const BG_CANVAS = h2r("#535353");
figma.currentPage.backgrounds = [{type:"SOLID", color:BG_CANVAS}];
```

### Why `#535353`

This neutral gray creates enough contrast against white and subtle frames (#FCFCFC, #F4F4F5)
without "swallowing" dark components — it simulates the production environment (a neutral web page background).

### Exception

- **Brand (page 17:4)**: has its own brand-specific background, never touch it.
- The frames *themselves* keep their own tokens — only `page.backgrounds` changes.

### Automated check in a script

```javascript
const bgTarget = h2r("#535353");
const pages = figma.root.children;
pages.forEach(page => {
  if (page.id === "17:4") return; // Brand — skip
  const current = page.backgrounds[0];
  const needsFix = !current || current.type !== "SOLID"
    || Math.abs(current.color.r - bgTarget.r) > 0.005
    || Math.abs(current.color.g - bgTarget.g) > 0.005
    || Math.abs(current.color.b - bgTarget.b) > 0.005;
  if (needsFix) page.backgrounds = [{type:"SOLID", color:bgTarget}];
});
```

---

## 14. Agentica font — Atkinson Hyperlegible

> **Inter has been replaced by Atkinson Hyperlegible since 2026-06-09 (ADR-021).**
> All new code must use AH. Global-fix scripts rely on `ahStyle()`.

### Weight availability

| Requested weight | Weight used | Reason |
|-----------------|-----------------|--------|
| Regular | Regular | Direct |
| Medium | **Regular** | AH has no Medium (ADR-021: fontWeight.medium=500 → 400) |
| Semi Bold | **Bold** | AH has no Semi Bold |
| Bold | Bold | Direct |
| Extra Bold / Black / Heavy | **Bold** | AH only has 2 weights |

### Mandatory helper

```javascript
function ahStyle(s) {
  const bold = ["Bold","Semi Bold","Extra Bold","ExtraBold","Black","Heavy"];
  return bold.includes(s) ? "Bold" : "Regular";
}

// mkT — FILL text inside a container (natural wrap)
function mkT(chars, style, size, tok, fb) {
  const t = figma.createText();
  t.fontName = {family:"Atkinson Hyperlegible", style: ahStyle(style||"Regular")};
  t.fontSize = size||14; t.characters = String(chars);
  t.fills = vFill(tok||"color/text/primary", fb||"#202020");
  t.textAutoResize = "HEIGHT"; return t;
}

// mkI — inline text (pills, titles, badges) — natural width
function mkI(chars, style, size, tok, fb) {
  const t = figma.createText();
  t.fontName = {family:"Atkinson Hyperlegible", style: ahStyle(style||"Regular")};
  t.fontSize = size||14; t.characters = String(chars);
  t.fills = vFill(tok||"color/text/primary", fb||"#202020");
  t.textAutoResize = "WIDTH_AND_HEIGHT"; return t;
}
```

### Monospace font

`Atkinson Hyperlegible Mono` only for code blocks (`<code>`, `<pre>`).
Never for running text.

### Required installation

Both fonts must be installed **locally** for the Figma plugin to load them:
- `Atkinson Hyperlegible` (Regular + Bold)
- `Atkinson Hyperlegible Mono` (Regular)

---

## 15. ComponentSet showcase — instance approach

> **Never insert a ComponentSet directly into the page layout flow.**
> Variants position themselves at `(0,0)` → guaranteed overlap.

### Rule

1. Move the ComponentSet to `y = 3000` (out of the flow, still accessible to the library)
2. Create an `instances-row` WRAP auto-layout
3. For each variant: `variant.createInstance()` inside a VERTICAL wrap with a label
4. After `sSection.appendChild(instRow)`: `instRow.layoutSizingHorizontal = "FILL"`

```javascript
// ComponentSet → y=3000
compSets.forEach(cs => { cs.x = 0; cs.y = 3000; });

// instances-row WRAP
const instRow = figma.createFrame();
instRow.name = "instances-row";
instRow.layoutMode = "HORIZONTAL";
instRow.layoutWrap = "WRAP";
instRow.primaryAxisSizingMode = "AUTO";
instRow.counterAxisSizingMode = "AUTO";
bv(instRow, "itemSpacing", "space/layout/component", 20);
bv(instRow, "counterAxisSpacing", "space/layout/component", 20);
instRow.fills = [];

compSets.forEach(cs => {
  [...cs.children].forEach(variant => {
    try {
      const wrap = figma.createFrame();
      wrap.name = variant.name;
      wrap.layoutMode = "VERTICAL";
      wrap.primaryAxisSizingMode = "AUTO";
      wrap.counterAxisSizingMode = "AUTO";
      bv(wrap, "itemSpacing", "space/control/gap", 8);
      wrap.fills = [];
      wrap.appendChild(variant.createInstance());
      const lbl = mkI(
        variant.name.replace(/State=/,""), "Regular", 11,
        "color/text/secondary", "#646464"
      );
      lbl.letterSpacing = {value:0.3, unit:"PIXELS"};
      wrap.appendChild(lbl);
      instRow.appendChild(wrap);
    } catch(e) {}
  });
});

sSection.appendChild(instRow);
instRow.layoutSizingHorizontal = "FILL"; // constrain to the section's width
```

---

## 16. "Main component" frame — mandatory rule

> **Every ComponentSet (or isolated Component) must live inside a frame named `Main component`,
> positioned at `x = 1600, y = 0` on its page.**

### Structure

```
Frame "Main component"   x=1600, y=0
  VERTICAL auto-layout · padding 24px · gap 32px
  background #FAFAFA · border #E8E8E8 1px · cornerRadius 8
  ├── section "button-/-primary"
  │   ├── Title (Bold 12px, #202020)  "Button / Primary"
  │   ├── Variants (Regular 10px, #646464)  "Default · Hover · Focus · Disabled · Loading"
  │   └── ComponentSet  (FIXED sizing — keeps its native dimensions)
  ├── section "button-/-secondary"
  │   └── ...
  └── (one section per ComponentSet)
```

### Rules

```
✅ x=1600, y=0 on every component page
✅ Only one "Main component" frame per page (delete the old one before recreating it)
✅ Each section: bold title + list of states as a subtitle + the ComponentSet
✅ layoutSizingHorizontal = "FIXED" on every ComponentSet (keeps its native width)
✅ Also applies to isolated Components (e.g. Checkbox's Focus/Disabled variants)
❌ Never leave a ComponentSet floating directly on the canvas
❌ Never rename ComponentSets while moving them into the frame
```

### Code pattern

```javascript
async function mkMainComponent(sets) {
  // sets = [{ node: ComponentSetNode, label: "Button / Primary", variants: "Default · Hover…" }]

  const existing = figma.currentPage.findChildren(n => n.name === "Main component");
  existing.forEach(e => e.remove());

  const frame = figma.createFrame();
  frame.name = "Main component";
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = 32;
  frame.paddingTop = 24; frame.paddingBottom = 24;
  frame.paddingLeft = 24; frame.paddingRight = 24;
  frame.cornerRadius = 8;
  frame.fills = vFill("color/background/hover", "#FAFAFA");
  frame.strokes = [figma.variables.setBoundVariableForPaint(
    {type:"SOLID", color:hex("#E8E8E8")},
    "color",
    VARS["color/border/default"]
  )];
  frame.strokeWeight = 1; frame.strokeAlign = "INSIDE";
  frame.x = 1600; frame.y = 0;

  for (const { node, label, variants } of sets) {
    const section = figma.createFrame();
    section.name = label.replace(/\s*\/\s*/g, "-").toLowerCase();
    section.layoutMode = "VERTICAL";
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.itemSpacing = 6;
    section.fills = [];

    const titleNode = figma.createText();
    titleNode.fontName = { family: "Atkinson Hyperlegible", style: ahStyle("Bold") };
    titleNode.fontSize = 12; titleNode.characters = label;
    titleNode.fills = vFill("color/text/primary", "#202020");
    titleNode.textAutoResize = "WIDTH_AND_HEIGHT";
    section.appendChild(titleNode);

    const varNode = figma.createText();
    varNode.fontName = { family: "Atkinson Hyperlegible", style: ahStyle("Regular") };
    varNode.fontSize = 10; varNode.characters = variants;
    varNode.fills = vFill("color/text/secondary", "#646464");
    varNode.textAutoResize = "WIDTH_AND_HEIGHT";
    section.appendChild(varNode);

    section.appendChild(node);
    try { node.layoutSizingHorizontal = "FIXED"; } catch(e) {}
    try { node.layoutSizingVertical = "FIXED"; } catch(e) {}

    frame.appendChild(section);
  }
  return frame;
}
```

---

## 17. Rows with a variable item count — WRAP + FILL mandatory

> **Any row whose item count depends on the component (`states-row`, `instances-row`,
> or equivalent) must have `layoutWrap="WRAP"` AND `layoutSizingHorizontal="FILL"`.**
> 2026-07-06 incident: Input's `states-row` (6 states: Default, Focused, Filled,
> Error, Disabled, ReadOnly) was 1560px inside a 1440px section — it visually
> overflowed the page (visible on the last state, "ReadOnly", clipped by the
> canvas edge). §15 already documented this fix for `instances-row`, but didn't
> generalize it to `states-row` — the omission recurred elsewhere from simply
> copy-pasting the non-WRAP pattern.

### Why `layoutWrap="WRAP"` alone isn't enough

```javascript
// ❌ INSUFFICIENT — WRAP with no width constraint does NOTHING
row.layoutWrap = "WRAP";
// The row is HUG-sized (width = sum of children): there's never an edge to
// reach, so it never wraps to a new line. It silently overflows the parent section.

// ✅ CORRECT — WRAP + FILL (the row must be a child of an auto-layout parent)
row.layoutWrap = "WRAP";
row.counterAxisSpacing = 16;         // vertical gap between wrapped lines
row.layoutSizingHorizontal = "FILL"; // constrains the row to the parent's width → forces the wrap
```

### Systematic verification rule

Before considering a component page done, for **every horizontal row** (states,
instances, or any list whose size depends on the component's variants):

```
✅ layoutWrap = "WRAP"
✅ layoutSizingHorizontal = "FILL" (never left as HUG/AUTO)
✅ counterAxisSpacing defined (otherwise wrapped lines touch each other)
✅ Verify with get_screenshot that nothing extends past the section's white background
   (content overflowing onto the #535353 canvas gray = overflow signal)
❌ Never assume a component with few variants will always stay on a single line
   — the number of states (Input has 6, most have 4) varies per component
❌ Never tolerate a "minor" overflow (a few pixels) on the grounds that it's
   imperceptible — apply WRAP+FILL systematically, with no tolerance threshold
```

> **2026-07-06 incident (again) — Segmented.** The COMPONENT section's
> `instances-row` overflowed by 2px (1442px inside a 1440px section). Left as-is
> at first, judged "negligible." Fixed after an explicit request: always prefer
> an extra line (WRAP) over any overflow, however small — there is no acceptable
> threshold. Once WRAP+FILL is applied, the multi-line rendering stays clean
> (each `Tabs=N` naturally gets its own line) — the argument "it would break a
> clean layout" never justifies keeping an overflow.

---

## 18. Always the component token — never the semantic one directly

> **2026-07-06 incident.** Button, Input, Toggle, Checkbox, Radio, and Segmented bound
> their fills/strokes/text directly to variables from the `semantic` collection
> (e.g. `semantic/color/action/primary`), even though the `component` collection
> exists and defines dedicated tokens per component (e.g. `component/button/primary/background`).
> This is the exact Figma equivalent of the `tokens-system.md` level-3 rule —
> violated on both sides (Figma **and** `agtc-button.js`'s CSS, which also
> referenced the semantic token directly before the fix).

### Rule

```
✅ Before binding a fill/stroke/text, check whether a component/<comp>/... token exists
✅ If yes → use it, never the semantic/... it references internally
✅ If not (a state not covered by tokens/component.json, e.g. Disabled on most
   components) → stay on semantic/... explicitly, that's not a mistake
❌ Never bind a semantic/... when an equivalent component/... exists
❌ Never invent a component/... token that doesn't exist in tokens/component.json
   without adding it there first (the JSON is the source of truth, Figma follows — never the reverse)
```

### How to check whether a component token exists

```javascript
// List every token in the "component" collection for a given component
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const comp = collections.find(c => c.name === 'component');
const vars = await Promise.all(comp.variableIds.map(id => figma.variables.getVariableByIdAsync(id)));
vars.filter(v => v.name.startsWith('button/')).map(v => v.name);
```

The "TOKENS USED" table on each component page must list the **component** tokens
actually bound — not the semantic tokens they reference internally (except for
properties with no dedicated component token, where the semantic token is
correct and should be shown as-is).

---

## 19. Always `textStyleId` — never manual fontName/fontSize that "match" a style

> **2026-07-06 incident.** Component text used the right font and the right size
> (e.g. 14px Regular = values identical to `typography/label`) but wasn't
> **bound** to the library's Text Style via `textStyleId`. Result: if the
> library's typography changes, this text doesn't follow along — it only
> resembled the style at the moment it was created.

### Rule

```
✅ Always set text.textStyleId = <the library Text Style's id>
❌ Never settle for fontName + fontSize + lineHeight that manually reproduce
   an existing Text Style's values — that is not a binding
```

### ⚠️ API pitfall — `textStyleId` + a weight different from the style = broken link

`textNode.textStyleId = style.id` works. But any font mutation **afterward**
(`textNode.fontName = {...}` OR `textNode.setRangeFontName(...)`) silently
clears `textStyleId` (it reverts to `""`) — unlike the Figma editor, where
changing the weight on styled text leaves a partial "override" indicator. The
Plugin API doesn't support this partial behavior: it's all or nothing.

```javascript
// ❌ FORBIDDEN — clears the link
textNode.textStyleId = labelStyle.id;
textNode.fontName = { family: "Atkinson Hyperlegible", style: "Bold" }; // → textStyleId reverts to ""

// ✅ CORRECT — if the required weight differs from the existing style, create the right style
// (see the Button incident: typography/label is Regular, the button's text is Bold
//  → typography/label-bold created, a full Text Style in its own right, native Bold)
textNode.textStyleId = labelBoldStyle.id; // no font mutation afterward → link intact
```

**Never work around this with a manual value "that looks close enough."** If no
existing Text Style matches the weight actually needed, that's a signal that
the library is **missing a Text Style** — not an invitation to disconnect the
text from the system. Does adding the style lack legitimacy? No: a distinct
emphasis weight (e.g. Bold for a CTA vs Regular for a form label) is a real
typography decision, not a cosmetic detail — it deserves its own token,
propagated everywhere: `tokens/semantic.json` (`typography.*` composite) →
`tokens/figma-text-styles.json` (generates the Text Style via Tokens Studio) →
`tokens/component.json` (component token referencing it) → compiled CSS
(`npm run tokens`) → code component (`components/agtc-*.js`) → Figma (Text
Style created/applied) → documentation (`guidelines/components/*.md`). Never
a Figma-only fix.

---

## 20. Instance-swap icons — `constraints: SCALE` mandatory at every nested level

> **2026-07-07 incident.** The icons (`Icon / <name>` component, `Foundations / Icons`
> page) had been rebuilt at 24×24 with real Lucide paths (closing out the
> 2026-07-06 incident — gray placeholder squares). But used in instance-swap
> inside `agtc-button` (the `icon-prefix`/`icon-suffix` slot resized to 18×18),
> some icons overflowed the button, overlapping the label — only visible with
> certain icon shapes, not all (e.g. `plus` looked fine, `layout-dashboard`
> clearly overflowed).

### Cause

Resizing an instance (`instance.resize(18, 18)`) only cascades the scaling down
to children **if every child, at every level of the hierarchy, carries
`constraints: { horizontal: 'SCALE', vertical: 'SCALE' }` relative to its
direct parent**. A child left at `MIN`/`MIN` (the default for
`figma.createNodeFromSvg()` and `figma.createFrame()`) stays frozen at its
native size — it ignores the parent's resize and silently overflows.

Structure of each icon: `Icon / <name>` (COMPONENT 24×24) → `Frame` (24×24,
wrapper created by `createNodeFromSvg`) → `Vector` × N (paths). The `Vector`
nodes did have `SCALE/SCALE` (inherited from the SVG export), but the
intermediate `Frame` had stayed at `MIN/MIN` — a single non-compliant level
is enough to break the whole scaling chain.

### Rule

```
✅ After creating/modifying any Icon component, check `constraints` on EVERY
   direct child at every ancestor level down to the leaf (not just the first level)
✅ Explicitly set { horizontal:'SCALE', vertical:'SCALE' } on these children —
   never assume it's already the case
✅ Test resizing an INSTANCE (not just the master) with an icon whose path
   touches the edges (e.g. layout-dashboard, cpu, boxes) — symmetric, centered
   icons (plus, x, check) visually mask the bug
❌ Never assume a child inherits SCALE behavior from its own child —
   each level of the hierarchy has its own, independent constraints
```

```javascript
// ✅ CORRECT — fixes all 81 icons in one pass (2026-07-07 incident)
const icons = page.findAllWithCriteria({types:['COMPONENT']}).filter(n => n.name.startsWith('Icon / '));
for (const icon of icons) {
  const frame = icon.children.find(c => c.name === 'Frame');
  frame.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
}
```

Once this fix is applied at the master level, `instance.swapComponent(otherIcon)`
preserves the instance's size (e.g. 18×18) and the new icon automatically
adapts to it — that's the whole point of instance-swap: compose freely without
re-fixing the size on every swap.

---

## 21. Mandatory validation — dimensions, contrast, display

> **Absolute rule (2026-07-07, following the §16/§17/§20 incidents): no component
> and no page can be considered done without passing these three validations.**
> This is not an optional visual checklist — these are three scripts to actually
> run via `use_figma` before reporting a component as finished, on the affected
> component/page AND on anything touched indirectly (e.g. modifying an Icon
> master affects every usage of it elsewhere in the file).

Historical trigger: icons overflowing their slot (§20), an `icon-wrap` background
that lost its opacity mid-build and made the icon invisible (same color as the
background), a hardcoded gap instead of a token. All three bugs would have been
caught immediately by the scripts below — they went unnoticed because no
programmatic check had been run, only a quick visual read-through.

### A. Dimensions — no overflow, no misalignment

**Pass criterion:** for every child node (excluding `_prefixed` decorative nodes
with `layoutPositioning:"ABSOLUTE"`, and excluding intentional focus rings with
`strokeAlign:"OUTSIDE"`), the child's bounds must stay inside its direct
parent's bounds.

```javascript
// Run on every modified page — detects any overflow
function findOverflows(root) {
  const issues = [];
  function walk(node) {
    if (!('children' in node)) return;
    for (const child of node.children) {
      const isDecorative = child.name.startsWith('_') && child.layoutPositioning === 'ABSOLUTE';
      const isFocusRing = child.strokeAlign === 'OUTSIDE';
      if (!isDecorative && !isFocusRing && 'width' in node) {
        const overflowsRight  = child.x + child.width  > node.width  + 0.5;
        const overflowsBottom = child.y + child.height > node.height + 0.5;
        const overflowsLeft   = child.x < -0.5;
        const overflowsTop    = child.y < -0.5;
        if (overflowsRight || overflowsBottom || overflowsLeft || overflowsTop) {
          issues.push({ parent: node.name, child: child.name, parentSize: [node.width, node.height], childBounds: [child.x, child.y, child.x+child.width, child.y+child.height] });
        }
      }
      walk(child);
    }
  }
  walk(root);
  return issues;
}
```

Run `findOverflows(pageNode)` (or on a specific `ComponentSet`/instance) and
treat any non-empty result as a blocker — not just a flag.

**Instance-swap special case (icons, avatars, etc.):** test the resize with at
least one "at-risk" value (content close to the edges), not only the default
value — see §20, where the `plus` icon masked the bug and `layout-dashboard`
revealed it.

### B. Contrast — an actual calculation, not a visual estimate

**WCAG thresholds:**
- Normal text: **4.5:1** minimum
- Large text (≥ 24px, or ≥ 18.66px Bold): **3:1** minimum
- Icons / UI graphics (WCAG 1.4.11): **3:1** minimum

```javascript
// WCAG contrast calculation — composites semi-transparent backgrounds up the tree
function relLum(c) {
  const lin = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}
function contrastRatio(c1, c2) {
  const L1 = relLum(c1), L2 = relLum(c2);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}
function compositeOver(fg, opacity, bg) {
  return { r: fg.r*opacity + bg.r*(1-opacity), g: fg.g*opacity + bg.g*(1-opacity), b: fg.b*opacity + bg.b*(1-opacity) };
}
function resolveBackground(node, canvasBg = {r:1,g:1,b:1}) {
  const chain = [];
  let n = node.parent;
  while (n && n.type !== 'PAGE') { chain.unshift(n); n = n.parent; }
  let bg = canvasBg;
  for (const anc of chain) {
    if (!('fills' in anc) || !Array.isArray(anc.fills)) continue;
    for (const f of anc.fills) {
      if (f.type === 'SOLID' && f.visible !== false) bg = compositeOver(f.color, f.opacity ?? 1, bg);
    }
  }
  return bg;
}
// Usage on a text node: requiredRatio depends on fontSize/fontWeight (see thresholds above)
const bg = resolveBackground(textNode);
const fg = textNode.fills[0].color;
const ratio = contrastRatio(fg, bg);
```

Treat any ratio under the threshold as a blocker, **including tinted icons on a
tinted background** (e.g. the `icon-wrap` incident: a solid `action-primary`
icon on a 12% `action-primary` background — the calculation would have
immediately given a ratio close to 1:1).

### ⚠️ Frequent pitfall — a focus ring the same color as the component's background

> **2026-07-07 incident.** `agtc-button`'s focus ring (Primary, teal background)
> used `border-focus`, which resolves to **the same teal** as the button's
> background — a 1:1 ratio between the ring and the component it surrounds.
> The same risk exists everywhere a component with an `action-primary`
> background (Toggle on, Checkbox checked, Radio selected, Segmented selected)
> gets a focus ring bound to the same token.

**Standard solution (W3C technique C40 — "Two-Color Focus Indicator"), not a
local invention:** use **two colors with strong contrast between them** (one
light, one dark) for the ring — as long as these two colors have **at least a
9:1 contrast ratio between them**, one of the two will *always* have at least
3:1 against any solid background, without needing a different ring per color
variant.
Reference: [W3C WCAG — Technique C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40.html).

```
✅ A light band (white) directly against the component + a dark band (teal/black)
   on the outside — the light band alone guarantees contrast against ANY
   background, including one the same color as the dark band
✅ Each band ≥ 2px — verified: white (spread 2) + teal (spread 6) on Button
✅ Verified: white vs teal = 5.28:1 (> 3:1 required) — so even if the outer
   ring visually "disappears" on a background of the same hue, the component
   stays compliant AND visually larger (enlarged silhouette) — explicitly
   accepted by the user as a sufficient criterion: "even if it's the same
   color, the Focus state should look bigger because of the wider outline"
❌ Never assume a single-color ring is enough against every background
❌ Never evaluate a focus ring only on its internal ratio (ring vs background) —
   always also check the light band (ring vs any background, the C40 guarantee)
```

**Width reference:** Material Design 3 uses `--md-focus-ring-width: 3px` by
default for its focus ring — our two bands (2px + 6px = 8px total visible
width) are in the same order of magnitude, slightly more generous to stay
legible even in low-resolution exports.

**Related API pitfall (Figma Plugin):** `figma.variables.setBoundVariableForEffect()`
correctly binds `boundVariables` but doesn't always immediately recompute the
effect's literal `color` field — check the resolved `color` after binding, and
force it explicitly if needed (`effect.color = {r,g,b,a}` in addition to the binding):
```javascript
let ring = { type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:1}, spread:6, /* ... */ };
ring = figma.variables.setBoundVariableForEffect(ring, 'color', borderFocusVar);
ring.color = { r:0, g:0.478, b:0.408, a:1 }; // force-sync if the render still shows the old color
```

### C. On-page display — measurable elegance, not just "it looks fine"

- [ ] Icon ⇄ label gap: **always** a token (`space/control/gap` or equivalent),
      never a hardcoded value — see §18
- [ ] Vertical alignment: icon and text share the same `counterAxisAlignItems:"CENTER"`
      on their parent — no baseline offset
- [ ] No default `itemSpacing:0` on a container that later receives icon+text
      children (a pitfall hit on Button — the component had originally been
      built text-only, `itemSpacing` never revisited when icons were added)
- [ ] `findOverflows()` (§A) returns an empty result for the entire page, not
      just the modified component — a neighboring page can inherit a modified master
- [ ] Final screenshot at a `maxDimension` high enough to see details (≥ 900px
      on the relevant area) — a too-small screenshot hides exactly this kind of bug

### When to run these three validations

```
✅ After EVERY component creation or modification, before declaring it done
✅ After EVERY master modification (Icon, Text Style, variable) — audit every
   usage elsewhere in the file, not just the spot just modified
✅ Before the final verification screenshot of a work session
❌ Never rely on a low-resolution screenshot as sufficient validation
❌ Never validate a component by testing only one value/variant per property
   (e.g. testing instance-swap with a single icon proves nothing about the other 80)
```

---

## 22. Mandatory full audit — 9 categories

> Referenced by `.claude/rules/figma-library-governance.md`. Run on any newly
> created/modified page, before declaring it done, and on every explicit
> request ("audit", "check the whole file", "full screenshot"). Also run
> automatically, weekly, against the ENTIRE library (not just recently touched
> pages) by a scheduled cloud agent — see ADR-079. That routine's prompt reads
> this exact section as its source of truth, so keep this checklist accurate:
> a change here changes what the weekly routine checks, with no separate copy
> to update.

### 1. Accessibility
- [ ] Focus ring visible on every focusable state — technique C40 (§20), never
      a simple outline touching the element (see the 2026-07-07 "bigger button
      ≠ focus ring" incident)
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 if ≥ 24px or ≥ 18.66px Bold) — §21.B script
- [ ] Icon/UI graphic contrast ≥ 3:1
- [ ] `disabled` states exempt from contrast (WCAG) — don't treat these as bugs

### 2. Page display
- [ ] `findOverflows()` (§21.A) returns an empty array on `page-wrapper` AND on
      the `ComponentSet` itself
- [ ] No orphaned node at the page's root level (leftover test rectangles/instances
      — see the 2026-07-07 incident, two test leftovers left on Button)
- [ ] Icon ⇄ label gap always via `space/control/gap` (or equivalent), never
      hardcoded (§18)

### 3. Variables
- [ ] No fill/stroke/padding/radius without `boundVariables` — scan script below
- [ ] Component token prioritized over semantic (§18)
- [ ] Never a primitive token bound directly to a component

```javascript
// Scan for fills/strokes not bound to a Variable on a ComponentSet
function scanUnboundPaints(root) {
  const issues = [];
  function walk(node) {
    if ('fills' in node && Array.isArray(node.fills)) {
      node.fills.forEach((f, i) => {
        if (f.type === 'SOLID' && f.visible !== false && !f.boundVariables?.color) {
          issues.push({ node: node.name, prop: `fills[${i}]`, color: f.color });
        }
      });
    }
    if ('strokes' in node && Array.isArray(node.strokes)) {
      node.strokes.forEach((s, i) => {
        if (s.type === 'SOLID' && s.visible !== false && !s.boundVariables?.color) {
          issues.push({ node: node.name, prop: `strokes[${i}]`, color: s.color });
        }
      });
    }
    if ('children' in node) node.children.forEach(walk);
  }
  walk(root);
  return issues;
}
```

### 4. Styles (Text Styles)
- [ ] Every `TEXT` has a non-empty `textStyleId` (§19) — never manual
      fontName/fontSize that "resembles" an existing style
- [ ] **Every Text Style has all 4 properties (`fontSize`, `fontFamily`, `fontWeight`,
      `lineHeight`) bound to a Variable** — never a literal value, even if the
      displayed value looks correct (see the `scanUnboundTextStyleProperties`
      script below)

```javascript
function scanMissingTextStyles(root) {
  const issues = [];
  root.findAllWithCriteria({ types: ['TEXT'] }).forEach(t => {
    if (!t.textStyleId) issues.push({ node: t.name, characters: t.characters.slice(0, 30) });
  });
  return issues;
}
```

> **2026-07-09 incident.** 10 of the library's 11 Text Styles (all except
> `typography/detail`) had **no** variable bound at all — literal values
> (`fontSize: 40`, etc.) with only a text description pointing at the token
> name, with no real link. Worse: `detail-bold` and `label-bold` had **no
> Figma variable whatsoever** (no size, weight, or line-height), even though
> `tokens/semantic.json` fully defines them — a genuine code↔Figma parity gap
> that stayed invisible as long as no audit script specifically checked the
> Text Styles (the §3 `scanUnboundPaints` scan only covers fills/strokes, not
> typography). Only caught because a human compared a correctly bound Text
> Style against the existing ones.

```javascript
// Scan every local Text Style — detects unbound properties
async function scanUnboundTextStyleProperties() {
  const styles = await figma.getLocalTextStylesAsync();
  const required = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight'];
  const issues = [];
  for (const s of styles) {
    const bound = Object.keys(s.boundVariables || {});
    const missing = required.filter(k => !bound.includes(k));
    if (missing.length) issues.push({ style: s.name, missing });
  }
  return issues;
}
```

```
✅ Always bind fontSize/fontFamily/fontWeight/lineHeight on EVERY Text Style created
   — never just a text description pointing at the token name
✅ Run scanUnboundTextStyleProperties() on the WHOLE library (not just newly
   created styles) on every §22 audit — the debt can be old and invisible
✅ If a composite token (e.g. detail-bold, label-bold) referenced by chrome text
   has no matching Figma Variable, create it as an alias to the right primitive
   BEFORE binding the Text Style — never leave a Text Style unbound
❌ Never treat a "correct-looking" literal value as sufficient — without a
   binding, a future primitive change (e.g. a typographic rescale) won't propagate
```

### 4bis. Local fonts — check `loadFontAsync` BEFORE building on a font

> **2026-07-09 incident.** A locally installed font (`Atkinson Hyperlegible
> Mono`) is selectable and renders correctly in the interactive Figma editor —
> but `figma.loadFontAsync({family, style})` systematically fails in the
> Plugin API sandbox (`use_figma`), even after restarting the desktop app,
> with the error *"The font family ... does not exist"*. A Text Style created
> by hand in the UI with this font stays inspectable by script (reading,
> binding variables both work) but **cannot be applied to any other node by
> script** (`setTextStyleIdAsync` fails with `unloaded font`) — a hard
> platform ceiling, not a matter of insufficient local installation.

```javascript
// MANDATORY check before basing a Text Style effort on a non-standard font
// (not in Google Fonts / Figma's default library)
async function canLoadFont(family, style) {
  try {
    await figma.loadFontAsync({ family, style });
    return true;
  } catch (e) {
    return false;
  }
}
```

```
✅ Before any effort based on a non-standard local font: test canLoadFont()
   for EVERY style used (Regular AND Bold are not guaranteed equivalent)
✅ If canLoadFont() fails: either use the token's documented CSS stack fallback
   (e.g. JetBrains Mono, 2nd link), or accept that applying it to nodes stays a
   manual human task in the Figma UI (the Text Style can still be created and
   bound to variables by script — only the APPLICATION to new nodes is blocked)
❌ Never assume a font "visible in the Figma picker" is usable by a script —
   these are two different access paths (interactive rendering vs Plugin API),
   see Figma help "Add a font to Figma"
❌ Never loop indefinitely on app restarts hoping the font will load — if
   `canLoadFont()` fails twice in a row after a confirmed restart, treat it as
   a platform ceiling and escalate the fallback option to the human instead of retrying
```

### 5. States
- [ ] Figma states match exactly those of the code component (grep the
      `:hover`, `:focus-visible`, `:disabled`, custom states like `loading`/`error` in
      `components/agtc-<comp>.js`)
- [ ] No missing state, no invented state

### 6. Variants
- [ ] `componentPropertyDefinitions.Variant.variantOptions` (or equivalent) matches
      exactly the union type / `argTypes.variant.options` from the `.stories.js` file
- [ ] Properties (BOOLEAN/TEXT/INSTANCE_SWAP) match the props exposed by the Lit
      component (`static properties`)

### 7. In-page documentation
- [ ] `section-header` (title + description), `section-showcase` (VARIANTS),
      `section-states` or equivalent, `section-tokens`, `section-dos-donts`,
      `section-links` — all present (§8)
- [ ] The `TOKENS USED` table reflects the real `component.<comp>.*` tokens, not
      the raw semantic ones (§18)

### 8. Links
- [ ] `section-links` contains at minimum: Guidelines, 1 UX source (NN/g, W3C APG, IxDF…),
      1 WCAG/ADR reference, Tokens — see `ux-patterns-sources.md`
- [ ] No link duplicated between the header and the bottom of the page (§10)

### 9. Code ↔ Figma parity after a direct human visual instruction

> **2026-07-07 incident.** The user asked to remove `.icon-wrap`'s background on
> Feature-card directly in Figma (visual feedback, not a code read). The change
> was made on the Figma side without immediately checking
> `agtc-feature-card.js` — creating a silent Figma↔code gap
> (`background: rgba(18, 165, 148, .12)` stayed in the code). A separate
> developer agent had to fix the code afterward to bring the two back into sync.

**Rule**: any visual change made in Figma **based on direct human feedback**
(not sourced from reading the code) inherently creates a gap with the code
until the code is updated — this is not a mistake in itself, but the gap must
be **made visible**, never silent.

```
✅ After any visual change requested directly (not read from the code):
   1. Immediately check the matching components/agtc-<comp>.js file
   2. If the code diverges, note the gap explicitly (e.g. a "fixed" row in the
      TOKENS USED table, as done for Feature-card) — never silently
   3. Offer the user a handoff prompt to the developer agent
      (see `.claude/rules/figma-library-governance.md` — code is the source of truth)
   4. Once the code is fixed, recheck Figma ↔ code and clear the gap note
❌ Never assume a "Figma-only" visual change will stay consistent with the code
   without an explicit propagation action
❌ Never let a Figma token table claim a value the code doesn't actually
   produce (or vice versa) without an explicit note of the gap
```

---

## 23. Testing variant × state × content combinations — the EightShapes method

> **2026-07-07 incident.** Button had a focus ring that worked perfectly… as
> long as the label stayed "Button" and no icon property was on. As soon as a
> designer combined `State=Focus` with both icon properties, the ring (sized
> once and for all at build time, as a static sibling of the pill) no longer
> tracked the button's actual size — full visual overlap. The bug was only
> detectable by testing a **combination**, never by looking at each variant in isolation.

**Methodological reference**: [Nathan Curtis (EightShapes) — Component Visual Test
Cases](https://medium.com/eightshapes-llc/component-visual-test-cases-e501e2d21def).
Core principle: **never test an exhaustive grid of every combination**
(an unmanageable combinatorial explosion) — instead test **representative edge
cases**, organized into 5 categories:

```
1. Properties    — every property value works (already covered by the variant
                    grid itself — not the priority here)
2. Content       — text/icons: shortest realistic, longest realistic,
                    and deliberately too much (stress test) — not just the nominal case
3. Spacing       — base layout with several elements shown together at once
4. Layout        — varied component width (narrower / wider than the norm)
5. Composition   — nested slots/content tested at several proportions
```

### Practical rule for this Figma file

For any component that has **both** (a) a visually additive interactive state (Focus,
Selected, Hover…) **and** (b) content of variable size (free text, optional
icons) — combine both explicitly before considering the component done:

```javascript
// Targeted test — not exhaustive: the plausible worst case for THIS component
// 1. Create an instance on the most "visually additive" state variant (Focus, Selected)
// 2. Turn on ALL optional content properties at the same time (icons, etc.)
// 3. Use the longest realistic text (not a giant lorem ipsum — a real long label)
// 4. Screenshot + findOverflows() — if it breaks, it's structural, not cosmetic
const inst = componentSet.children.find(c => c.name.includes('State=Focus')).createInstance();
inst.setProperties({
  [showIconPrefixKey]: true,
  [showIconSuffixKey]: true,
  [labelKey]: 'A label representative of the realistic worst case',
});
```

### Components with identified risk (variable content + visually additive state)

| Component | Variable content | Additive state | Status |
|---|---|---|---|
| Button | Label + 2 optional icons | Focus (ring) | Fixed 2026-07-07 — ring now in a HUG auto-layout wrapper, never again a statically sized sibling |
| Segmented | Option labels (2-5, free length) | Focused (ring) | Fixed 2026-07-07 — same wrapper pattern |
| Input | Label + Placeholder/Value + icons | Focus (border) | Border is internal to `.control`, not a sibling — lower risk but should be retested if the structure changes |
| Toggle/Checkbox/Radio | Label (free text) | Focus (ring) | Low risk — the ring surrounds a track/box with a **fixed size**, independent of the label text (a separate element) |

**Architecture lesson**: a focus ring (or any additive indicator) must
**never** be a sibling node sized once and then frozen. It must either:
(a) surround its content via a `HUG` auto-layout wrapper (the content grows →
the wrapper follows automatically, with no manual recalculation), or (b)
target an element whose size is structurally fixed and independent of the
variable content (the Toggle/Checkbox/Radio case).

---

## 24. Monospace presentation typography — isolating docs from components

> **Rule adopted 2026-07-08.** All **presentation/documentation** text on a
> Figma page (section titles, descriptions, anatomy captions, grid column
> labels, token table headers, DO/DON'T text) uses the mono font **from the
> token**, not the content font, and not a font name guessed by eye. Goal:
> visually distinguish at a glance what is **meta** (the docs *about* the
> component) from what is **the component itself** (which keeps its real
> `Atkinson Hyperlegible` font).

### Source of truth — the token, never a guess

> General rule (`figma-library-governance.md` §1): **code is the source of
> truth**. For Monospace, that means tracing the token to its real value
> before creating anything in Figma — never starting from a font name pulled from memory.

```
Token          semantic.typography.mono.family
  → alias of   primitive.fontFamily.mono
  → value      'Atkinson Hyperlegible Mono', 'JetBrains Mono', 'Cascadia Code', monospace
  → CSS var    --agtc-semantic-typography-mono-family
  → consumer: components/agtc-code-block.js
```

First link in the stack available in Figma → **`Atkinson Hyperlegible Mono`**
(the `JetBrains Mono` / `Cascadia Code` fallbacks are a browser CSS fallback
stack, not variants to replicate in Figma).

### Real values wired into `agtc-code-block.js` — to reproduce, not reinvent

Debt paid down on 2026-07-08 (commits `15070ef` token(semantic), `3dedc58`
fix(component) — see ADR-067). The component no longer has any hardcoded
typography value; these tokens are the exact reference for the
`typography/doc-mono` Text Style:

| Usage in the component | Size | Weight | Line-height | Letter-spacing | Token |
|---|---|---|---|---|---|
| Code body | 14px | 400 (regular) | **1.6** | normal (0em) | `component.code-block.default.font-size` (= `semantic.typography.label.size`) · `semantic.typography.detail.line-height` (= `primitive.lineHeight.reading`) |
| Language badge (header) | 12px | **500 (medium)** | normal | **0.06em** | `semantic.typography.detail.size` · `semantic.typography.label.weight` (= `primitive.fontWeight.medium`) · `semantic.typography.letter-spacing.wide` (= `primitive.typography.letterSpacing.wide`) |

> Decision made to set the language badge at 500 (medium) rather than 600: no
> new `semibold` primitive was created — the existing `fontWeight.medium` was
> reused, approved by the Design System Lead + Principal Designer (ADR-067).
> Don't create a Figma Text Style at "weight 600" — it doesn't exist on the code side.

### Scope — what goes Monospace, what does NOT

| ✅ Monospace (presentation text, meta) | ❌ Stays in the real content font |
|---|---|
| Section titles (`section-header`, "ANATOMY", "VARIANTS"…) | **The component's own label** (e.g. "Button" inside an `agtc-button`) |
| Descriptions and explanatory paragraphs on the page | Any text **inside a component instance** |
| Anatomy captions, column/row labels of the variant grid | Values displayed by a component in a real-world situation |
| Token table headers and cells | |
| DO/DON'T column badges/text, link pill text | |

> **Absolute boundary:** as soon as text lives **inside a component instance**,
> it keeps the component's font. Monospace only applies to the surrounding
> **documentation chrome**. It's this font contrast that creates the requested visual separation.

### Implementation — a dedicated Text Style, never a manual fontName (§19)

Create/reuse a `typography/doc-mono` library Text Style (and its weight
variants if needed, `typography/doc-mono-bold`) and apply it via
`textStyleId` — never a hand-coded monospace `fontName` (same reasons as
§19: text that "looks like" mono isn't bound to the system).

```javascript
// The mono family already exists (§14) — check the style before use
await figma.loadFontAsync({ family: "Atkinson Hyperlegible Mono", style: "Regular" });
// Apply the library's doc Text Style (created once), not a raw fontName
docTextNode.textStyleId = TX["typography/doc-mono"].id;
// No font mutation afterward (otherwise textStyleId reverts to "" — §19 pitfall)
```

```
✅ Presentation text → textStyleId = typography/doc-mono (or -bold)
✅ The showcased component keeps Atkinson Hyperlegible (its real font)
❌ Never switch a component's internal label to mono (breaks parity with the code)
❌ Never hand-code the mono font — always via the Text Style (§19)
```

---

## 25. Page content width — never let the wrapper overflow

> **Rule adopted 2026-07-08.** Trigger: the `Foundations / Logos` page was
> still overflowing its `page-wrapper` (wide content pushed outside the white
> background, visible on the canvas's `#535353` gray). Generalizes the §17
> principle (WRAP+FILL) to **all page content**, not just state/instance rows.

### Canonical width

```
page-wrapper width: 1440 px (fixed, counterAxisSizingMode = "FIXED")
Section horizontal padding: 80 px on each side
→ Usable content width: 1440 − 160 = 1280 px MAXIMUM
```

No content element (frame, grid, logo image, row) should exceed **1280 px**
wide once placed in a section. Any element that might be wider than the
available space must either switch to `layoutSizingHorizontal = "FILL"`, be
in a `layoutWrap = "WRAP"` container (§17), or be scaled to fit.

### Verification rule (run on every page, not just Logos)

```javascript
// Reuses findOverflows() (§21.A): any non-decorative child whose bounds
// exceed its direct parent's = a blocker. ALSO target the entire page-wrapper.
const overflows = findOverflows(pageWrapper);
// Logos case: a logo grid or a single logo with a native width > 1280
// → constrain the grid to FILL + WRAP, or resize each logo tile
```

```
✅ Content ≤ 1280 px wide in every section (1440 wrapper − 2×80 padding)
✅ Variable-width grids/rows: layoutSizingHorizontal="FILL" + layoutWrap="WRAP" (§17)
✅ Oversized images (logos, illustrations): proportional resize to fit within 1280
✅ findOverflows(pageWrapper) must return an empty array before declaring the page done
❌ Never let an element overflow onto the canvas gray, even "by a few pixels" (§17)
❌ Never widen the page-wrapper past 1440 to "fit" oversized content
   → fix the content, not the wrapper
```

---

## 26. Post-audit checklist — line-height units, container nesting, alignment, stale reads

> **Rule adopted 2026-07-23.** Trigger: a routine "verify the mono pilot rendering" request
> uncovered five distinct, previously-undetected defects across the whole file — a broken
> `lineHeight` unit on all 15 Text Styles, cropped focus rings on 2 pages, invisible tag text on
> 3 pages, a hardcoded color failing WCAG contrast, and (later, from a user report) a decorative
> background that didn't scale with its content. None of these were caught by `findOverflows()`
> or the existing clipping checks — they need their own verification steps, documented here so
> they become a standing checklist, not a one-off fix.

### 26.1 `lineHeight` must be `{unit:"PERCENT"}`, never `{unit:"PIXELS"}` with a bare multiplier

A Text Style's `lineHeight` binding can silently carry the *token's numeric value* (e.g. `1.6`,
meant as a unitless CSS multiplier) under the **wrong unit** — `{unit:"PIXELS", value:1.6}`
instead of `{unit:"PERCENT", value:160}`. On a single line of text this is invisible (nothing to
space out). The moment that text wraps to 2+ lines, the lines render on top of each other.

```javascript
// Audit every Text Style before trusting it
const styles = await figma.getLocalTextStylesAsync();
const broken = styles.filter(s => s.lineHeight.unit === 'PIXELS' && s.lineHeight.value < 10);
// value < 10 is the tell — a real pixel line-height is never that small
```

```
✅ Convert primitive.lineHeight.* (a unitless number, e.g. "1.6") to Figma's lineHeight as
   {unit:"PERCENT", value: primitiveValue * 100} — never as {unit:"PIXELS", value: primitiveValue}
✅ Re-check ALL styles sharing a category (reading/heading/display), not just the one you're
   touching — this bug is copy-pasted across every style built the same way
❌ Never assume a style is fine because it "looks right" on short, single-line text
```

**Amendment (2026-07-27, building `doc/page-frame`):** the same bug hits a raw `TEXT` node's
`lineHeight` bound directly to a Variable via `setBoundVariable('lineHeight', var)` — not just
published Text Styles. Figma always resolves a Variable-bound `lineHeight` as `PIXELS`, even
when the variable stores a unitless multiplier (`primitive/lineHeight/display` = `1`, a correct
primitive value) — there is no way to bind a percent-semantics lineHeight to a Variable. Hit on
`semantic/marketing/typography/display/line-height`, never exercised before (no prior text node
had used it), so invisible to every earlier audit. Fix: never bind `lineHeight` to a Variable on
an ad-hoc text node for a unitless-multiplier token — set a plain, unbound
`{unit:"PERCENT", value:100}` instead, same as the Text Style fix above.
`scripts/figma/audit-figma-file.js`'s `findBrokenLineHeights()` now scans both Text Styles and
any `TEXT` node with a Variable-bound `lineHeight`, not just Text Styles.

### 26.2 A decorative background must be a HUG parent of its content, never an independent sibling

Pattern to avoid: `section-content-bg` (a fixed- or manually-resized decorative frame) sitting
**next to** a content frame (`typo-content`, `spacing-content`, …) at the same page level,
relying on both frames' authored sizes staying in sync by hand. The moment the content frame
grows (new row added, translated text is longer, a token is added), the background doesn't
follow — content spills onto the plain white page background, breaking the visual container.

```
✅ appendChild the content frame INTO the background frame (real nesting, not visual coincidence)
✅ Background frame: layoutMode="VERTICAL", primaryAxisSizingMode="AUTO" (hug), padding set once
✅ Content frame: layoutSizingHorizontal="FIXED" at its authored width, height stays HUG
✅ Any time content is added/removed/re-translated, the background auto-follows — nothing to sync
❌ Never position a "container-looking" background as a sibling frame at a coincidentally-matching
   size — it WILL drift the next time the content changes (2026-07-23 incident: adding 4 rows to
   `typography`'s type ramp left the last 3 rows rendering outside `section-content-bg`)
```

### 26.3 A `FILL`/`layoutGrow=1` spacer defeats left-alignment in table-like rows

If a row's last element (a sample bar, a status pill) is meant to **start at the same X across
every row** for easy visual comparison, the text/spacer column immediately before it must be
`layoutSizingHorizontal="FIXED"` at a width wide enough for the longest row's content — never
`FILL`/`layoutGrow=1`. A `FILL` spacer eats all remaining row width, which pushes the following
element flush against the row's right edge instead of anchoring it to a shared left position —
the classic "space-between" trick, wrong for anything meant to read as a comparable bar chart.

```
✅ Table/list rows where a trailing element (bar, badge) should align across rows:
   give the preceding text column a FIXED width sized to the longest content in that column
❌ FILL/layoutGrow on a column whose only job is "push the next thing to the far edge" —
   that's a right-alignment tool, not a left-alignment one
```

### 26.4 `.height` / `.absoluteBoundingBox` can lie right after a script mutation — use `.absoluteRenderBounds`

Reading `node.height` or `node.absoluteBoundingBox` on an auto-layout child immediately after a
style/font change in the **same session** (even a fresh `use_figma` call) can return a stale or
nonsensical value (`height: 1` on a 32px-bold heading has been observed). This corrupts anything
computed from it — including auto-layout's own positioning of the next sibling, which is how a
title/subtitle pair ended up rendering on top of each other even though geometry read as
"non-overlapping" at the time.

```
✅ For ground-truth rendered geometry, always read node.absoluteRenderBounds — it reflects the
   actual paint, not a cached layout value
✅ After adding/mutating nodes inside an auto-layout HUG frame, re-fetch the frame fresh
   (getNodeByIdAsync in a NEW use_figma call) and check absoluteRenderBounds before trusting it
❌ Never conclude "no overlap" from .height/.absoluteBoundingBox alone right after a mutation —
   cross-check with a screenshot at a real resolution (scale ≥ 2) when anything looks tight
```

### 26.5 Every fill must resolve `boundVariables` — a raw color is both a token violation and an a11y risk

`node.fills[0].boundVariables` being empty (`{}`) on a text/shape fill means the color is
hand-painted, not tokenized — a direct violation of `tokens-system.md`, AND a sign nobody
contrast-checked it (the 2026-07-23 `PATTERNS` tag: hardcoded gray text at ~12% opacity of the
same gray for its own background → 2.86:1 contrast, below the 4.5:1 AA minimum for small text).

```javascript
// Audit sweep — run on any page before calling it done
const unbound = page.findAll(n => 'fills' in n && Array.isArray(n.fills))
  .filter(n => n.fills.some(f => f.type === 'SOLID' && f.visible !== false && !f.boundVariables?.color));
```

```
✅ Every SOLID fill on text/shapes resolves through boundVariables.color to a semantic token
✅ When fixing a hardcoded color, bind to an EXISTING semantic token matching the same resolved
   value/role (e.g. semantic/color/text/secondary) rather than inventing a new one
✅ Compute contrast (WCAG relative luminance) for any text-on-fill pair discovered this way —
   don't assume the existing pairing was ever checked
❌ Never leave `boundVariables: {}` on a fill "because the color looks right" — it will drift
   silently the next time a token value changes, since nothing links it back
```

### 26.7 A variable can resolve by ID while its collection is orphaned — check `getLocalVariableCollectionsAsync()`, not just `getVariableByIdAsync()`

**2026-07-23 incident.** `page-wrapper`'s background fill showed a "?" in the Figma UI (broken
variable), yet `figma.variables.getVariableByIdAsync(id)` returned a perfectly valid-looking
object — name, type, resolved color, all present. The tell was one level up:
`variable.variableCollectionId` pointed at a collection (`"Agentica — Tokens"`, an early,
pre-ADR-059 token collection) that **`getLocalVariableCollectionsAsync()` no longer lists** —
i.e. Figma's own UI can't resolve it as live/editable even though the raw ID lookup still
succeeds. Scope when audited: **~1600 fill/stroke bindings across all 18 pages**, essentially
the entire file's chrome color layer, silently pointing at a collection that isn't part of the
current `primitives` / `semantic` / `component` / `semantic.dark` hierarchy.

```javascript
// A variable "resolving" is not proof it's healthy — cross-check its collection
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const knownGoodIds = new Set(collections.map(c => c.id));
const v = await figma.variables.getVariableByIdAsync(someBoundVarId);
const isOrphaned = v && !knownGoodIds.has(v.variableCollectionId); // true = broken, even though v itself is non-null
```

```
✅ Cross-check every bound variable's variableCollectionId against getLocalVariableCollectionsAsync()
   — a non-null getVariableByIdAsync() result is NOT sufficient proof of health
✅ To fix: find the matching name in the current semantic/component collection
   (orphan "color/text/secondary" → current "semantic/color/text/secondary") and rebind via
   figma.variables.setBoundVariableForPaint(paint, 'color', newVariable)
❌ Never trust a "?" badge in the Figma UI as the only signal — the Plugin API can mask it
❌ Never assume a single fixed "?" instance is isolated — this class of bug is copy-pasted
   across every node built from the same original template, audit the WHOLE file
```

### 26.8 Auto-layout padding/gap/radius must be bound too — not just fills

The token-binding requirement (§26.5) applies identically to **layout** properties, not only
paint. `node.paddingLeft/Right/Top/Bottom`, `itemSpacing`, and the four corner-radius properties
can silently hold a hardcoded number with zero entry in `node.boundVariables` — the Figma
properties panel shows a plain number with no visual distinction from a bound one unless you
look for the small variable-link icon.

**2026-07-23 incident.** The `Button` ComponentSet's own variants had `paddingLeft/Right: 20`,
`paddingTop/Bottom: 10`, `cornerRadius: 8` — hardcoded, unbound, and **not matching the
documented `TOKENS USED` table** (16px / 8px / 6px) NOR the real CSS
(`components/agtc-button.js`, confirmed by grep before touching anything). A nested `pill` child
inside each Focus-state variant repeated the same hardcoded values one level deeper — the
top-level fix alone would have missed it. A file-wide sweep afterward found the same pattern on
`Input` (135 instances), `Segmented` (480), `Checkbox` (53), `Toggle`/`Radio` (14 each).

```
✅ Before binding, resolve the REAL value from code (tokens/component.json → tokens/semantic.json
   → tokens/primitives.json → the literal CSS custom property in components/agtc-*.js) — the
   Figma instance's current hardcoded number is not evidence of the correct value, it may have
   drifted (as it had here: 20/10/8 in Figma vs 16/8/6 in code)
✅ Check EVERY variant of a ComponentSet, and recurse into named wrapper children (e.g. "pill",
   "track", "field") — a fix on the outer variant frame does not propagate to nested frames
✅ Exclude the ComponentSet's own root layout from the audit — that governs the editor canvas
   arrangement of variants, never the rendered/instanced design
❌ Never assume a Figma instance's current padding/radius is correct just because it renders
   "fine" visually — compare against the code before binding, every time
```

### 26.9 Renames and deletions leave stale references — check text mentions AND internal links

> **Rule added 2026-07-24**, prompted by the redesign plan (§1.6.1,
> `Temp/plan-redesign-figma-2026-07-23.md`) renaming `INTRO`→`GETTING STARTED` and moving
> `COVER` under a new `UTILITY` page. Every check added to this file so far (§26.1–26.9)
> catches a node whose OWN property drifted — none of them catch a node whose text or link
> still references something else that changed. A rename or a page restructure is exactly the
> kind of change that leaves this behind, silently, because the stale text still renders fine.

Two distinct failure modes, both covered by `scripts/figma/audit-figma-file.js`:

1. **Stale plain-text mentions** — a breadcrumb, eyebrow tag, or prose sentence that spells out
   an old name (`"See the INTRO page for..."`) after the referenced thing was renamed. Nothing
   in Figma flags this on its own — the text is perfectly valid, just wrong.
2. **Broken internal hyperlinks** — a text hyperlink of type `NODE` (Figma's "link to a frame"
   feature) whose target node was deleted or had its ID change. Figma doesn't surface this
   either; the link text still looks clickable.

```
✅ Maintain KNOWN_RENAMES at the top of audit-figma-file.js — every time a page, component, or
   pattern gets canonically renamed, add an { oldName: newName } entry immediately, in the same
   session as the rename
✅ Run findStaleNameReferences() (and the full auditPage()) on EVERY page, not just the one that
   was renamed — a page-A eyebrow tag can reference page B's old name
✅ Prefer a manual fix over applyKnownRenames() whenever the flagged text has mixed styling
   (bold substring, a hyperlink) or needs rewording beyond a straight swap — the helper does a
   literal find/replace only, it does not re-flow surrounding prose
✅ Once every reference is confirmed fixed (staleNameReferences returns empty for that
   oldName), remove the entry from KNOWN_RENAMES — it's a working list, not a permanent log
   (the permanent log lives in the plan document / commit history)
❌ Never treat "the renamed page itself looks right" as sufficient — the whole point of this
   check is catching references living on OTHER pages
```

### 26.10 Consolidated pre-"done" checklist for any Figma page work

Run `scripts/figma/audit-figma-file.js` (paste into `use_figma`, one page per call, fan out in
parallel per the figma-use skill's multi-page rule) — it codifies checks 26.1–26.8 into one
script instead of five hand-copied snippets. A clean page returns every result array empty:

```
✅ orphanedVariables — §26.7 — empty
✅ unboundComponentProps — §26.8 — empty
✅ brokenLineHeights — §26.1 — empty
✅ staleNameReferences — §26.9 — empty (blocking: any text still spelling out an old name
   after a rename is a regression, fix in the same session, don't defer)
✅ brokenLinks — §26.9 — empty (blocking: an internal NODE-type hyperlink whose target no
   longer resolves)
✅ clippedEffects — § "Known errors" DROP_SHADOW row — empty (treat as candidates to verify
   visually, not automatic bugs — the check flags any clipsContent ancestor even when the effect
   has enough room and never actually gets cut)
✅ overflows — §21.A / §25 — empty (or only the known decorative _deco/Ellipse header bleed)
✅ Decorative background nesting (§26.2) — appendChild, don't co-position — not yet automated,
   check by hand: does a "…-content" frame sit as a CHILD of its "…-content-bg", or merely
   beside it at a coincidentally-matching size?
✅ Alignment columns (§26.3) — FIXED width for anything meant to align across rows, not FILL —
   not yet automated, check by hand on any new token-sample table
✅ Screenshot at scale ≥ 2 (small crop) AND the REST `get_screenshot` tool if in doubt about a
   `node.screenshot()` result — cheap cross-check against a second rendering pipeline
```

---

## Known errors — Figma Plugin API

| Error | Cause | Fix |
|--------|-------|-----|
| Frame stays at 40 px tall | `primaryAxisSizingMode="AUTO"` before `resize()` | `resize()` first, `AUTO` after |
| `page.appendChild(node)` — conflict | Nodes auto-attach to the current page | Never call `page.appendChild()` for top-level nodes |
| `Cannot write to node with unloaded font` | textStyleId uses an unloaded font | Load ALL fonts at the start of the call (`loadFontAsync`) |
| Empty text after `textStyleId` | `characters` set after `textStyleId` on an empty node | Always: `fontName` → `characters` → `textStyleId` → `fills` |
| `strokeAlign OUTSIDE` invisible | Frame with `clipsContent=true` | Set `clipsContent=false` on the parent when there's an external focus ring |
| Effect (`DROP_SHADOW`/glow) invisible on a hover/focus/selected state | The node carrying the effect itself has `clipsContent=true` — not just its parent | Check `clipsContent` on the node carrying the effect AND on every ancestor up to the ComponentSet — set it to `false` everywhere the effect must overflow. 2026-07-06 incident: Segmented's selected pill (`tab-1`) and the ComponentSet itself had `clipsContent=true`, hiding the drop-shadow — a full file-wide audit is required (the bug isn't limited to strokes, effects get clipped the same way) |
| Overlapping ComponentSet variants | CS inserted directly into the flow — variants at `(0,0)` | CS at `y=3000` + `variant.createInstance()` inside a WRAP instRow |
| `instRow` overflows (2637 px+) | `primaryAxisSizingMode="AUTO"` with no constraint | After `append`: `instRow.layoutSizingHorizontal = "FILL"` |
| Any row (states, instances) overflows the section (content visible on the canvas gray) | `layoutWrap="WRAP"` set without `layoutSizingHorizontal="FILL"` — WRAP is a no-op under HUG | `row.layoutWrap="WRAP"` **+** `row.layoutSizingHorizontal="FILL"` **+** `counterAxisSpacing` — see §17 |
| Duplicated content (e.g. links) visible twice on the same page | `links-row` added to both `section-header` and `section-links` | Only one `links-row`, in `section-links` alone (bottom of page) — see §10 |
| Fill/stroke bound to `semantic/...` when a component token exists | Habit of binding the semantic token without checking `component/<comp>/...` first | Always look for the matching `component/` token before binding — see §18 |
| `textStyleId` reverts to `""` after appearing to apply | `fontName`/`setRangeFontName` set after `textStyleId` — the API clears the link, unlike the Figma editor | Never mutate the font after `textStyleId`; if the weight doesn't match, create/use the right Text Style — see §19 |
| Icon overflows its slot (18×18) when resized or swapped via instance-swap | The icon's internal `Frame` wrapper is at `constraints: MIN/MIN` (the `createNodeFromSvg` default) — doesn't follow the parent instance's resize | `frame.constraints = { horizontal:'SCALE', vertical:'SCALE' }` at EVERY intermediate level, not just the final `Vector` nodes — see §20 |
| Wrapped text renders lines stacked on top of each other (self-overlap or overlapping the row above) | Text Style `lineHeight` bound as `{unit:"PIXELS", value:1.6}` instead of `{unit:"PERCENT", value:160}` | Audit every Text Style's `lineHeight.unit` — see §26.1 |
| Content spills onto the plain page background instead of staying on its "card"/section background | Background is a sibling frame at a manually-matched size, not a real parent — drifts the moment content grows | `appendChild` content into the background, set the background to auto-layout HUG — see §26.2 |
| A row of sample bars/badges doesn't align to a common starting X across rows | The preceding text/description column is `FILL`/`layoutGrow=1`, pushing the bar to the row's right edge | Give that column a `FIXED` width sized to the longest row's content — see §26.3 |
| `node.height` / `.absoluteBoundingBox` reads a nonsensical tiny value (e.g. `1`) right after a mutation | Stale auto-layout geometry cache in the Plugin API, not a real layout state | Read `.absoluteRenderBounds` instead, or re-fetch the node in a fresh `use_figma` call — see §26.4 |
| Text is technically visible but fails contrast / was clearly hand-picked | `fills[0].boundVariables` is empty — a hardcoded color, not a token | Bind to the matching semantic token and compute WCAG contrast — see §26.5 |
