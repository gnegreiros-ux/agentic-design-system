# Component: Toggle — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-01
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/toggle.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-039-agtc-toggle-implementation.md, guidelines/components/checkbox.md

---

## Intent

**Why this component exists:**
Turn a binary setting on/off with an **immediate effect** — the change applies
instantly, with no "Save" button.

**This component is not:**
- A form selection validated on submission (use `<agtc-checkbox>`)
- An exclusive choice among several (use `<agtc-radio>`)

---

## Checkbox vs Toggle — the rule

| | Checkbox | Toggle |
|--|----------|--------|
| Effect | On submission | **Immediate** |
| Usage | 0–N selection in a form | Instant on/off setting |
| Example | "I accept the Terms of Service" | "Dark mode" |

> Never mix a toggle (immediate effect) with fields submitted together — it creates
> ambiguity about when the change applies (NN/g).

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `label` | String | — | Concise label describing the "on" state — or text in slot |
| `checked` | Boolean | `false` | Enabled (on) state |
| `disabled` | Boolean | `false` | Disabled |
| `name` | String | — | Field name for forms |
| `value` | String | `'on'` | Value submitted when enabled |

---

## Events

| Event | Detail | Trigger |
|-----------|--------|---------------|
| `agtc-change` | `{ checked, name, value }` | Immediately on toggle |

---

## Tokens used

| Property | Component token |
|-----------|-----------------|
| Off track | `component.toggle.default.track-off` |
| Off track hover | `component.toggle.default.track-off-hover` |
| On track | `component.toggle.default.track-on` |
| On track hover | `component.toggle.default.track-on-hover` |
| Knob | `component.toggle.default.knob` |
| Focus border | `component.toggle.default.border-focus` |
| Label | `component.toggle.default.label` |

> `track-off` is a proxy to `primitive.color.gray.9` (#8d8d8d): no medium-neutral gray <!-- audit-ignore: resolved primitive value cited for reference -->
> semantic token exists yet. Chosen for a ≥ 3:1 contrast of the white knob against the
> track (WCAG 1.4.11). See ADR-039.

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Accessible element | Native `<input type="checkbox" role="switch">` |
| State without color alone | Signaled by the **knob position** (WCAG 1.4.1) |
| Knob/track contrast | ≥ 3:1 in both states (WCAG 1.4.11) — white knob + shadow |
| Visible focus | `outline` on the track via `:focus-visible` |
| Touch target | ≥ 24px tall (WCAG 2.5.8) |
| Accessible name | Implicit enclosing `<label>` |

---

## Behaviors and states

| State | Behavior |
|------|-------------|
| Off | Gray track, knob on the left |
| On | Teal track, knob on the right |
| Hover | Darkened track |
| Focus | Teal outline — keyboard (Space toggles) |
| Disabled | Reduced opacity, non-interactive |

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Toggle inside a submitted form | Ambiguity between immediate effect and submit (NN/g) |
| State signaled by color alone | Fails WCAG 1.4.1 |
| Interrogative label ("Do you want…?") | Prefer a concise frontloaded label (NN/g) |
| Toggle for a non-binary choice | Use radio/checkbox |
| Hardcoded color or size | Bypasses the tokens |

---

## UX Patterns Reference

> Patterns approved by the Design System Lead via the `ux-pattern-review` workflow
> (see `.claude/rules/ux-patterns-sources.md` and ADR-036). Decision: **all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| `role="switch"` + `aria-checked` | [NN/g — toggle switch](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Native `<input type="checkbox" role="switch">` |
| **Immediate effect** (no submit) | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | `agtc-change` emitted on toggle |
| **State by knob position** (not color alone) | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Knob slides left/right (WCAG 1.4.1) |
| Delimited knob (contrast ≥ 3:1) | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | White + shadow, gray.9 track (WCAG 1.4.11) |
| Concise label describing the "on" state, frontloaded | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | `label` writing rule |
| Clickable label + target ≥ 24px | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Enclosing `<label>`, `min-height: 24px` |
| Binary only | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Otherwise radio/checkbox |

---

## Implementation

```html
<!-- Basic -->
<agtc-toggle label="Email notifications" name="email-notif"></agtc-toggle>

<!-- Enabled -->
<agtc-toggle label="Dark mode" checked></agtc-toggle>

<!-- Disabled -->
<agtc-toggle label="Sync" disabled></agtc-toggle>
```

```javascript
document.querySelector('agtc-toggle')
  .addEventListener('agtc-change', (e) => {
    // Immediate effect — apply the change now
    console.log(e.detail); // { checked, name, value }
  });
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Component token modification | Principal Designer |
| Creating a neutral-track semantic token | Design System Lead |
| Accessibility bug fix | Design system team review |
