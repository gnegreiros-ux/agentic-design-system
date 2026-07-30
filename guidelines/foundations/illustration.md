# Foundation — Illustration

> Style spec for Agentica system illustrations — "Tactile Tech" style.
> **Status:** ✅ Approved (human, 2026-06-06) — formalized by ADR-051. Each illustration
> produced remains subject to individual approval (see `.claude/rules/ux-patterns-sources.md`).
> **Type:** guideline
> **Logical path:** guidelines/foundations/illustration.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/foundations/color.md, tokens/semantic.json, decisions/ADR-051,
> .claude/rules/illustrations-source.md

---

## Why this style

Style chosen: **"Tactile Tech: Humanizing Complexity"**
(ref. https://getillustrations.com/blog/saas-illustration-styles-that-convert/, style #1).

This style "bridges the gap between the coldness of a software product and the warmth" of
the human experience. Deliberate imperfection (grain, stipple, brush touches) signals
**intentional care** rather than over-smoothed AI-generic. It directly serves the system's
narrative: *"the last word is always human"* — the machine is precise, the human makes it
warm and governs it.

Usage targets: hero sections, the "For each role" section, and the **Pipelines &
Workflows showcase**. A single shared visual language across all these surfaces.

---

## Visual characteristics

| Dimension | Decision |
|-----------|----------|
| **Foundation** | Precise geometric vector shapes, large overlapping angular fills (ref. `color-pattern.jpg`, archived outside the repo with the rest of the exploration prototype) |
| **Texture** | Grain + stipple + brush touches over the vector — precision/imperfection tension |
| **Depth** | Light, through layering of fills and transparency; no realistic drop shadows |
| **Level of detail** | Balanced — refined enough to feel professional, textured enough to feel "hand-made" |
| **Tone** | Professional but warm; technical but human |
| **Subject** | Show the **outcome** (aligned team, corrected drift, tracked decision) — never UI screenshots |

---

## Illustration palette

Tokenized as `semantic.color.illustration.*` (ADR-051) — mapping from `brand-colors.jpg` (archived
outside the repo) to the closest primitive step, teal already being common to the brand.

| Semantic token | Primitive | Illustration usage |
|------------------|-----------|---------------------------|
| `color.illustration.ink`     | `mauve.12`   | dark masses, anchoring |
| `color.illustration.accent`  | `crimson.9`  | warm focal point, energy |
| `color.illustration.brand`   | `teal.9`     | visual link to the product, throughline |
| `color.illustration.neutral` | `slate.9`    | secondary masses, depth |
| `color.illustration.surface` | `slate.3`    | breathing room, light negative space |

> Light AND dark (see dual-theme decision): the palette must stay legible on light **and**
> dark backgrounds. Plan a per-theme variant for neutral fills. Re-run through the
> **axe-core** gate (contrast of meaning-bearing elements ≥ 3:1).

---

## Consistency rules

```
✅ Always the same tokenized palette (no hardcoded color in the export pipeline)
✅ Always geometric shapes + grain/stipple — never one without the other
✅ Always illustrate a business OUTCOME, not an interface
✅ Legibility guaranteed in light AND dark
❌ No screenshots disguised as illustrations
❌ No realistic gradients / heavy drop shadows
❌ No inconsistent style from one section to another
```

---

## Illustrations produced (v1 — replaced)

> **2026-07-10:** these 3 SVG diagrams were replaced by the PNG illustration system
> (`Brand/illustrations/`, see `.claude/rules/illustrations-source.md`) before ever being
> integrated into the site — step 4 of the pipeline below therefore never happened for these
> files. The `illustrations/` folder was removed from the repo; the table is kept for
> historical reference.

| File (removed) | Subject | Status |
|---------|-------|--------|
| `illustrations/pipeline-tokens.svg` | 3-level architecture (Primitive → Semantic → Component) | ✅ v1 approved (2026-06-06) — replaced by PNG |
| `illustrations/human-last-word.svg` | Human governance — Agent → Human → System approval flow | ✅ v1 approved (2026-06-06) — replaced by PNG |
| `illustrations/multi-platform.svg`  | Multi-platform Style Dictionary (6 outputs: CSS, Swift, JS, Android, Angular, Tailwind) | ✅ v1 approved (2026-06-06) — replaced by PNG |

Style: **functional diagram** on an `ink` background (#211f26), teal accents, real code snippets. <!-- audit-ignore: resolved value cited for reference in a historical style description -->
This SVG diagram style is no longer the chosen direction — see `Brand/illustrations/` for the
PNG illustrations currently in production on the site.

---

## Production pipeline (historical)

1. ✅ **Spec approved** (this document) — human decision (2026-06-06).
2. ✅ **Tokenized palette** (`semantic.color.illustration.*`) + ADR-051.
3. ✅ **v1 vector compositions** — 3 functional diagram illustrations approved (2026-06-06).
4. ❌ **Site integration** — never happened; the 3 SVGs were replaced by the PNG system
   (`Brand/illustrations/`) before integration.
5. Additional illustrations as needed (roles section, hero, pipelines showcase).
