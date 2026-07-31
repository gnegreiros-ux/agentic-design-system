# Component — Icon (`agtc-icon`)

> Icon component contract — usage rules, accessibility, and anti-patterns.
> **Type:** guideline
> **Logical path:** guidelines/components/icon.md
> **Author:** Guilherme Negreiros
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** components/agtc-icon.js, tokens/semantic.json, decisions/ADR-022-lucide-icons.md, guidelines/components/button.md

---

## Library — Lucide Icons

Lucide (MIT) is the system's official icon library. 1,500+ icons, strict 24×24 viewBox. Stroke width varies per size step (see Sizes and tokens below, ADR-091). Canonical reference: **lucide.dev**

---

## Component API

```html
<!-- Semantic icon (label required) -->
<agtc-icon name="trash-2" size="control" label="Delete file"></agtc-icon>

<!-- Decorative icon (hidden from AT) -->
<agtc-icon name="check" size="inline" decorative></agtc-icon>

<!-- Navigation icon -->
<agtc-icon name="settings" size="nav" label="Settings"></agtc-icon>
```

| Prop | Type | Values | Default | Required |
|------|------|---------|--------|--------|
| `name` | String | Lucide name (e.g. `trash-2`) | — | ✅ |
| `size` | String | `inline` / `control` / `nav` | `control` | — |
| `label` | String | Accessible text | — | If not decorative |
| `decorative` | Boolean | Purely ornamental icon | `false` | — |

---

## Sizes and tokens

| `size` | Size token | Value | Stroke-width token | Value | Default color token | Context |
|--------|-----------------|--------|---------------------|--------|----------------------|---------|
| `inline` | `semantic.icon.size.inline` | 16px | `semantic.icon.strokeWidth.inline` | 1 | `semantic.color.icon.inline` (= `text.primary`) | Within running text, a label |
| `control` | `semantic.icon.size.control` | 20px | `semantic.icon.strokeWidth.control` | 1.5 | `semantic.color.icon.control` (= `text.secondary`) | Within a button, input, badge |
| `nav` | `semantic.icon.size.nav` | 24px | `semantic.icon.strokeWidth.nav` | 1.75 | `semantic.color.icon.nav` (= `text.secondary`) | Navigation, header, emphasis |
| *(n/a — not an `agtc-icon` `size` value)* | `semantic.icon.size.feature` | 32px | `semantic.icon.strokeWidth.feature` | 2 | *(none — always `action.primary` on marketing cards)* | Marketing feature cards, hook sections (`data-context="marketing"`) |

**Stroke-width scales up with size** (ADR-091): thinnest at `inline` (sits next to body text,
must not compete with the copy) to boldest at `feature` (marketing card icons, maximum visual
presence). `nav` and `feature` carry more visual weight for hierarchy in navigation/marketing
contexts — a documented icon-legibility/hierarchy pattern (see
[NN/g — icons & indicators](https://www.nngroup.com/articles/design-pattern-guidelines/)).
`feature` isn't an `agtc-icon` `size` attribute — it's applied via CSS on
`data-context="marketing"` card icons (`site/build.js`).

**Color tokens are documentation-only, not a runtime override.** `agtc-icon` still uses
`stroke: currentColor` in code — it inherits whatever text color surrounds it (error text,
dark mode, hover state, etc. all work automatically with zero extra CSS). `semantic.color.icon.*`
exists to give the Figma Lucide Icons library (which has no `currentColor` equivalent) a
token-driven default per variant, and to document the color each variant typically resolves to
in its default context.

---

## Absolute rules

```
✅ Always provide a label if the icon is the only piece of information (e.g. icon-only button)
✅ decorative when the icon accompanies text that already describes it
✅ size matches the context (control in a button, inline in text)
✅ Exact icon name per lucide.dev (kebab-case)

❌ Never a semantic icon without a label: <agtc-icon name="trash-2">
❌ Never a hardcoded size: style="width: 20px"
❌ Never an invented variant outside inline/control/nav
❌ Never an icon outside the Lucide library without approval
```

---

## Usage with agtc-button

```html
<!-- Button with decorative icon + text -->
<agtc-button variant="critical">
  <agtc-icon name="trash-2" size="control" decorative></agtc-icon>
  Delete permanently
</agtc-button>

<!-- Icon-only button — label required on agtc-icon -->
<agtc-button variant="ghost" aria-label="Close">
  <agtc-icon name="x" size="control" label="Close"></agtc-icon>
</agtc-button>
```

---

## Accessibility — WCAG 1.1.1

| Scenario | Implementation |
|----------|---------------|
| Icon alone (button, link) | `label="Described action"` → `aria-label` injected |
| Icon + adjacent text | `decorative` → `aria-hidden="true"` |
| Icon within a field | `label` on the parent field (`aria-describedby`) |

---

## Anti-patterns to detect

```html
❌ <agtc-icon name="trash-2"></agtc-icon>
   → Semantic icon without a label — escalate

❌ <agtc-icon name="danger" size="control">
   → "danger" name doesn't exist in Lucide — use "alert-triangle" or "x-circle"

❌ <svg>...</svg>  (inline SVG outside agtc-icon)
   → Drift — no accessibility contract or token

❌ <agtc-icon name="check" style="width: 18px;">
   → Hardcoded size — use size="inline" or size="control"
```

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036). Decision: **all approved**.
> No Storybook story for this component → propagated across 5 surfaces.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Icon + text when meaning isn't universal (don't rely on the icon alone) | [NN/g — icon usability](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `decorative` accompanies text; otherwise `label` is required |
| Accessible label required when the icon carries the information | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Absolute rule — `label` → `aria-label` |
| Decorative icons hidden from AT (`aria-hidden`) | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `decorative` → `aria-hidden="true"` |
| Consistent, non-misleading meaning (same icon = same meaning everywhere) | [IF — transparency](https://catalogue.projectsbyif.com/) | ✅ | Semantic consistency enforced by the single Lucide library (ADR-022) |
| Icon legibility at small render sizes (optical stroke correction) | [NN/g — icons & indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `strokeWidth.inline`/`.control` thicker than the native Lucide weight — ADR-091 |

---

## Installation

```bash
# npm (recommended for projects with a bundler)
npm install lucide

# CDN (static projects)
<script src="https://unpkg.com/lucide@latest"></script>
```
