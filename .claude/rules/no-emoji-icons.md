# Rule: no-emoji-icons

> Emoji are never used as iconography in the product, the site, or the Figma file.
> Lucide (via `agtc-icon`, or a real Lucide component instance in Figma) is the only icon system.
> **Type:** rule
> **Logical path:** .claude/rules/no-emoji-icons.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/code-style.md
> **Relations:** components/agtc-icon.js, guidelines/components/icon.md, .claude/instructions/figma-components.md

---

## Absolute rule

> **An emoji is never used as a UI icon — in the site, in a component, or in the Figma file.**
> Wherever an icon is needed, use the real icon system: `<agtc-icon name="...">` in code, a
> Lucide component instance in Figma.

```
❌ FORBIDDEN: an emoji glyph (🟡, ✅, ❌, ⚠️, 🚀, …) rendered as a status/UI icon on the site,
   in a component, or on a Figma page/frame/node
✅ REQUIRED: <agtc-icon name="check-circle">, <agtc-icon name="x-circle">, etc. on the site/
   in components; a real Lucide component instance in Figma
```

---

## Scope — what counts as "the product, the site, or Figma"

| ✅ In scope (no emoji, Lucide only) | ❌ Out of scope (emoji/Unicode symbols acceptable) |
|---|---|
| Any icon rendered on `agentica.design` (status cells, badges, table markers) | `✅`/`❌` checklist bullets in `.claude/rules/*.md` and `guidelines/*.md` — agent-facing documentation prose, not a UI icon |
| Any icon inside a `agtc-*` component | Code-block examples inside prose that illustrate the `✅ Correct` / `❌ Forbidden` documentation convention itself (verbatim quotes of that convention, not a live UI element) |
| Figma page names, frame names, or on-canvas content (e.g. a staging-page emoji prefix) | ADR/commit-message prose |

> When in doubt: if it **renders as part of the interface** a user or Figma-file consumer sees
> as an icon, it's in scope. If it's a **textual pass/fail marker in documentation meant for
> agents/humans reading rules**, it's out of scope — that's an established, separate convention
> (`code-style.md`), not an icon system.

---

## Known instances to migrate (not yet done)

- `site/build.js` — the framework-compatibility matrix (`✅`/`⚠️` table cells, integration docs
  page) renders as a real UI table on the site: in scope, not yet converted to `agtc-icon`.
  Tracked as a GitHub Projects ticket (Domaine Site) rather than fixed inline, given the size of
  the sweep needed across a ~9,000-line file with many occurrences of mixed classification (some
  UI, some documentation-convention code samples that stay as-is per the scope table above).
- Figma staging page name `🟡 Proposal — pending approval` (`figma-library-governance.md` §B) —
  documented as a workflow pattern but not yet created as an actual page in the file (verified
  2026-07-27, no matching page exists today). When it's first created, name it without the emoji
  prefix (a text label or a real Lucide icon instance next to the page name).

---

## Rules for agents

```
✅ Use <agtc-icon name="..."> for any status/UI icon added to the site or a component
✅ Use a real Lucide component instance for any icon added to the Figma file
✅ Keep the ✅/❌ checklist convention in .claude/rules/*.md and guidelines/*.md as-is —
   it's documentation prose, not a UI icon, and converting it would require a non-existent
   text equivalent for a visual icon system
❌ Never add a new emoji as a status marker, badge, or page/frame name prefix in the site,
   a component, or the Figma file
❌ Never "quick-fix" with an emoji because the equivalent Lucide icon isn't obviously named —
   check `guidelines/components/icon.md` / the Lucide icon set first, ask if genuinely missing
```
