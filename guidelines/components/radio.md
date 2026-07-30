# Component: Radio — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-01
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/radio.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-038-agtc-radio-implementation.md, guidelines/components/checkbox.md

---

## Intent

**Why this component exists:**
Allow choosing **exactly one** option in a mutually exclusive set.

**This component is not:**
- An independent multiple selection (use `<agtc-checkbox>`)
- An on/off setting with immediate effect (use `<agtc-toggle>`)
- A selector for many options (prefer a future `<agtc-select>` beyond ~7 choices)

---

## Two components

| Element | Role |
|---------|------|
| `<agtc-radio-group>` | Container — `role="radiogroup"`, manages exclusivity, roving focus, keyboard, event |
| `<agtc-radio>` | A choice — `role="radio"`, round shape |

> An `<agtc-radio>` **must** live inside an `<agtc-radio-group>`: `<input type="radio">`
> elements in separate shadow DOMs do not form a native group (see ADR-038).

---

## Shape — decision

**Round.** NN/g: round is the radio button convention; a square signals a checkbox.

---

## Properties

### `<agtc-radio-group>`
| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `value` | String | `''` | Value of the selected radio |
| `name` | String | — | Group name for forms |
| `label` | String | — | Accessible label for the group (`aria-label`) |
| `disabled` | Boolean | `false` | Disables the group |

### `<agtc-radio>`
| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `value` | String | `''` | Value of this option |
| `label` | String | — | Label — or text in slot |
| `checked` | Boolean | `false` | Managed by the group (read-only) |
| `disabled` | Boolean | `false` | Disabled option |

---

## Events

| Event | Emitted by | Detail | Trigger |
|-----------|----------|--------|---------------|
| `agtc-change` | `agtc-radio-group` | `{ value, name }` | On every selection change |

---

## Keyboard navigation

| Key | Action |
|--------|--------|
| `Tab` | Enters/exits the group (only one tabbable radio — roving focus) |
| `↓` / `→` | Next option (selects, loops) |
| `↑` / `←` | Previous option (selects, loops) |
| `Space` | Selects the focused option (`Enter` reserved for form submission) |

---

## Tokens used

| Property | Component token |
|-----------|-----------------|
| Background | `component.radio.default.background` |
| Border | `component.radio.default.border` |
| Border hover | `component.radio.default.border-hover` |
| Border focus | `component.radio.default.border-focus` |
| Selected dot | `component.radio.default.fill` |
| Selected dot hover | `component.radio.default.fill-hover` |
| Label | `component.radio.default.label` |

> Size: `--agtc-semantic-icon-size-control` (20px). Round shape: `border-radius: var(--agtc-semantic-radius-pill)`.

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Group | `role="radiogroup"` + `aria-label` |
| Option | `role="radio"` + `aria-checked` |
| Roving focus | Only one radio `tabindex="0"` at a time |
| Navigation | Arrows select (native radio behavior) |
| Touch target | ≥ 24px tall (WCAG 2.5.8) |
| Clickable label | The whole option (dot + text) |

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Square shape | Checkbox convention — confusion (NN/g) |
| `<agtc-radio>` outside a group | No exclusivity or keyboard support |
| Expected multiple selection | Use checkboxes |
| No default when a sensible default exists | Unnecessary step for the user (NN/g) |
| Presumptuous default (gender, title) | Leave empty (NN/g, exception) |

---

## UX Patterns Reference

> Patterns approved by the Design System Lead via the `ux-pattern-review` workflow
> (see `.claude/rules/ux-patterns-sources.md` and ADR-036). Decision: **all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| **Round shape** (square = checkbox) | [NN/g — checkboxes vs radio](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | `border-radius: var(--agtc-semantic-radius-pill)` |
| Mutually exclusive selection (exactly 1) | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Group manages exclusivity |
| Pre-select a sensible default (except exceptions) | [NN/g — radio default selection](https://www.nngroup.com/articles/radio-buttons-default-selection/) | ✅ | Group `value` — usage guidance |
| Vertical stacking, one option per row | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Layout recommendation |
| Clickable label (dot **or** text) — Fitts | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | The whole option is clickable |
| Touch target ≥ 24×24px | [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `min-height: 24px` (WCAG 2.5.8) |
| Arrow navigation = selection (native radio) | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Managed by the group (WAI-ARIA radiogroup) |
| Complete visible states | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | default/hover/focus/selected/disabled |

---

## Implementation

```html
<!-- Group with a selected default -->
<agtc-radio-group name="plan" value="pro" label="Plan">
  <agtc-radio value="free">Free</agtc-radio>
  <agtc-radio value="pro">Pro</agtc-radio>
  <agtc-radio value="team">Team</agtc-radio>
</agtc-radio-group>

<!-- Without a pre-selection -->
<agtc-radio-group name="ship" label="Shipping">
  <agtc-radio value="standard">Standard</agtc-radio>
  <agtc-radio value="express">Express</agtc-radio>
</agtc-radio-group>
```

```javascript
document.querySelector('agtc-radio-group')
  .addEventListener('agtc-change', (e) => console.log(e.detail)); // { value, name }
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Component token modification | Principal Designer |
| Keyboard behavior change | Design system team |
| Accessibility bug fix | Design system team review |
