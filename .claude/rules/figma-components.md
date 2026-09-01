---
paths:
  - "scripts/figma/**"
  - "tokens/figma-text-styles.json"
---

# Rule: figma-components

> Stub — full rules in `.claude/instructions/figma-components.md`.
> Load this file **only** when working on Figma scripts.
> **Type:** rule
> **Logical path:** .claude/rules/figma-components.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** .claude/instructions/figma-components.md, .claude/rules/tokens-system.md,
> .claude/instructions/figma-component-page-method.md (step-by-step build/modify playbook,
> distilled from this document), .claude/instructions/figma-component-page-checklist.md
> (matching validation-audit checklist)

---

## Absolute rule (reminder)

Every fill or stroke in a Figma script goes through `vFill(semanticToken, fallbackHex)`.
Never a direct `hexRgb()`, never a primitive token inside a component.

---

## Full document

`.claude/instructions/figma-components.md` contains 28 sections:
§0 Fundamental rule · §0bis Mandatory audit before ending any session · §1 Component
properties · §2 Auto-layout · §3 Architecture · §4 Naming · §5 Variables & Styles (tokens →
hex mapping table) · §6 Performance · §7 Publication checklist · §8 Component page layout
· §9 DO/DON'T template · §10 Mandatory links · §11 Accessibility palette · §12 Hero gradient
decorations · §13 Canvas background #535353 · §14 Atkinson Hyperlegible font · §15 Instance
showcase · §16 "Main component" frame · §17 Variable rows (WRAP+FILL) · §18 Component token
before semantic · §19 Mandatory textStyleId · §20 Instance-swap icons (SCALE
constraints) · §21 Dimension/contrast/display validation · §22 Full audit (9 categories,
including code↔Figma parity after direct visual instruction) · §23 Combination testing of
variants × states × content (EightShapes method — focus rings in a HUG wrapper)
· §24 Presentation typography in Monospace (isolating component docs)
· §25 Page content width (≤ 1280 px, wrapper must never overflow) · §26 Post-audit checklist
(line-height units, container nesting, alignment, stale reads; §26.12 — a FIXED-width TEXT
child of an auto-layout instance silently ignores `.resize()`/`.resizeWithoutConstraints()`,
use `layoutSizingHorizontal = 'FILL'` instead) · §27 Component spec panel —
"Specs 2" format standard, token-name-first (Anatomy/Variant/State/Additional
variants/Layout and spacing/Data — target format for a future richer `doc/*` spec set) ·
§27.6 ALL presentation components (`doc/*`, current and future) live on `↳ design
annotations` only, semantic tokens only, never published with the library · §28 Page
architecture — the 3-frame `doc/frame-header` pattern (Main frame/Main-component
frame/Spec frame, positioned side by side, y=0, 360px gap — never stacked), `doc/section-header`
section labels (§28.3 — bottom-stroke on the master, not a `Rectangle` child; one uniform Bold
40px default everywhere, no per-instance size override; must stay a live `INSTANCE`, a
detached copy silently stops inheriting master fixes), `doc/dos-donts-card` for every
DO/DON'T pair, the `section-[name]` → `exhibit-stack` structure inside Spec frame, the
completion contract (a component page is "done" only once Spec frame shows the full §27
content, not a placeholder), the `Main-component frame` body's variant table (§28.4 — must be
a real header-row/row-label/cell table like the page's own `section-presentation` grid, never
a raw `ComponentSet` dump with a text legend; a "(copy for display)" `ComponentSet` is a real
second copy, not a guaranteed-unique master), `doc/footer`
(§28.4bis — the real, user-built footer component, "REFERENCES" + links-row, its `wrapper`
the one deliberate `background/subtle` exception; must stay a live, undetached `INSTANCE` —
now has 6 real Component Properties (5 link-label TEXT + 1 `Show link 4` BOOLEAN) so link
label text is set via `setProperties()` at creation, never `detachInstance()` or reaching into
named children — plus a separate, real `.hyperlink` set on each link's TEXT node (label text
and clickability are two different properties; a hyperlink can only ever live on text, never
a frame; every URL traced to a precedent already in the file or in `guidelines/components/*.md`,
never invented) — plus the `createInstance()`-drops-a-just-toggled-child gotcha this
uncovered), §28.4ter (only the 3 top-level frames carry a fill — `background/page` — every
section/body/wrapper inside is `fills: []`), and §28.7's
mandatory live-verification step before building any piece — search design-annotations for
an existing `doc/*` match first, inspect button's real live structure right before building,
never build from this document's prose or an older page's pattern from memory

**Read `.claude/instructions/figma-components.md` before any work on a Figma plugin script.**
**Also read `.claude/rules/figma-library-governance.md`** — code-as-source-of-truth charter,
tokens-only, architecture/rendering parity, best-practices watch.
