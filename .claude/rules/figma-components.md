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
> **Relations:** .claude/instructions/figma-components.md, .claude/rules/tokens-system.md

---

## Absolute rule (reminder)

Every fill or stroke in a Figma script goes through `vFill(semanticToken, fallbackHex)`.
Never a direct `hexRgb()`, never a primitive token inside a component.

---

## Full document

`.claude/instructions/figma-components.md` contains 25 sections:
§0 Fundamental rule · §1 Component properties · §2 Auto-layout · §3 Architecture
§4 Naming · §5 Variables & Styles (tokens → hex mapping table) · §6 Performance
§7 Publication checklist · §8 Component page layout · §9 DO/DON'T template
§10 Mandatory links · §11 Accessibility palette · §12 Hero gradient decorations
§13 Canvas background #535353 · §14 Atkinson Hyperlegible font · §15 Instance showcase
§16 "Main component" frame · §17 Variable rows (WRAP+FILL) · §18 Component token
before semantic · §19 Mandatory textStyleId · §20 Instance-swap icons (SCALE
constraints) · §21 Dimension/contrast/display validation · §22 Full audit (9 categories,
including code↔Figma parity after direct visual instruction) · §23 Combination testing of
variants × states × content (EightShapes method — focus rings in a HUG wrapper)
· §24 Presentation typography in Monospace (isolating component docs)
· §25 Page content width (≤ 1280 px, wrapper must never overflow)

**Read `.claude/instructions/figma-components.md` before any work on a Figma plugin script.**
**Also read `.claude/rules/figma-library-governance.md`** — code-as-source-of-truth charter,
tokens-only, architecture/rendering parity, best-practices watch.
