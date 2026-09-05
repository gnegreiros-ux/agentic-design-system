# Component: Input — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-09-05
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/input.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, DESIGN.md

---

## Intent

**Why this component exists:**
Allow the user to enter textual or structured data in a form.

**This component is not:**
- A selector (use `<agtc-select>`)
- A long text area (use `<agtc-textarea>`)
- A button (use `<agtc-button>`)

---

## Supported types

| Type | Usage |
|------|-------|
| `text` | Free-form input (default) |
| `email` | Email address with native validation |
| `password` | Password with built-in show/hide toggle |
| `number` | Numeric value (native spinners removed) |
| `search` | Search field |
| `tel` | Phone number |
| `url` | URL with native validation |

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `label` | String | — | **Required** — accessible label (WCAG 1.3.1) |
| `hide-label` | Boolean | `false` | Visually hides the label (kept in the DOM, still accessible) — exception for icon-clarified search fields only, see UX Patterns Reference |
| `type` | String | `text` | HTML input type |
| `name` | String | — | Field name for forms |
| `value` | String | `''` | Current value |
| `placeholder` | String | — | Hint text — never used alone as a label |
| `helper-text` | String | — | Contextual help below the field |
| `error-message` | String | — | Error message (visible when `invalid`) |
| `invalid` | Boolean | `false` | Error state — red border + role=alert |
| `disabled` | Boolean | `false` | Disabled — subtle background, non-interactive |
| `readonly` | Boolean | `false` | Read-only — transparent background |
| `required` | Boolean | `false` | Required — `*` marker + aria-required |
| `icon` | String | — | Lucide icon as prefix |
| `icon-suffix` | String | — | Lucide icon as suffix |
| `maxlength` | Number | — | Maximum length |
| `autocomplete` | String | — | HTML autocomplete hint |

---

## Events

| Event | Detail | Trigger |
|-----------|--------|---------------|
| `agtc-input` | `{ value, name }` | On every keystroke |
| `agtc-change` | `{ value, name }` | On blur |

---

## Tokens used

| Property | Component token |
|-----------|-----------------|
| Background | `component.input.default.background` |
| Border | `component.input.default.border` |
| Border focus | `component.input.default.border-focus` |
| Border error | `component.input.default.border-error` |
| Text | `component.input.default.text` |
| Placeholder | `component.input.default.placeholder` |
| Radius | `component.input.default.radius` |
| Padding X | `component.input.default.padding-x` |
| Padding Y | `component.input.default.padding-y` |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Label required | WCAG 1.3.1 — never placeholder alone |
| Visually-hidden label | `hide-label` keeps a real `<label>` in the DOM (`.visually-hidden`, never `display:none`) — requires `icon` (W3C ARIA14 condition) |
| Text contrast | 4.5:1 minimum (WCAG AA) |
| Visible focus | `outline` on the `.control` wrapper |
| Invalid state | `aria-invalid="true"` + `role="alert"` on the message |
| Required field | `aria-required="true"` + visual `*` marker |
| Password toggle | Dynamic `aria-label` (show/hide) |
| Linked descriptions | `aria-describedby` on helper-text and error-message |

---

## Behaviors and states

| State | Behavior |
|------|-------------|
| Default | Default border, surface background |
| Focus | Teal border + outline (border-focus) |
| Invalid | Red border, error message with role=alert |
| Disabled | Subtle background, pointer-events none |
| Readonly | Transparent background, not editable |
| Password | Built-in show/hide button, dynamic aria-label |

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Input without a `label` | Inaccessible (WCAG 1.3.1) |
| Placeholder as the only label | Disappears on input, fails WCAG |
| `invalid` value without an `error-message` | Error flagged without explanation |
| Inline style on the field | Bypasses component tokens |
| Unsupported type | Undefined behavior |
| `hide-label` without `icon` | Purpose no longer visually unambiguous (fails ARIA14's condition) |
| `hide-label` with `display:none` instead of `.visually-hidden` | Removes the accessible name entirely, not just the visual text |

---

## UX Patterns Reference

> Patterns approved by the Design System Lead via the `ux-pattern-review` workflow
> (see `.claude/rules/ux-patterns-sources.md` and ADR-036). Decision: **all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Visible label always present (never placeholder alone) | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | WCAG 1.3.1 — `label` required |
| **Validation on blur (`onBlur`)** by default | [NN/g — Forms](https://www.nngroup.com/articles/design-pattern-guidelines/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Don't flag an error during the initial keystrokes |
| **Re-validation on keystroke once a field is in error** | [NN/g — How to Report Errors in Forms](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Reward the correction immediately |
| Inline error under the field + `role="alert"` | [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Localized error, announced to AT |
| Constructive error message (states what to fix) | [NN/g — Error-Message Guidelines](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `error-message` writing rule |
| Persistent help text, distinct from the error, `aria-describedby` | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `helper-text` linked via `aria-describedby` |
| Required marker `*` + `aria-required` | [NN/g — Forms](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Required field flagged visually and to AT |
| Forgiving format (tolerate spaces/formats: `tel`, `number`) | [IxDF — forgiving formats](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Reduces input errors |
| Avoid hostile patterns (no aggressive blocking, no clearing an errored field) | [NN/g — Hostile Patterns in Error Messages](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Anti-dark-pattern |
| **Exception** — visually-hidden label for icon-clarified search fields (`hide-label`, requires `icon`) | [W3C WAI — Labelling Controls](https://www.w3.org/WAI/tutorials/forms/labels/) · [W3C ARIA14](https://www.w3.org/TR/WCAG20-TECHS/ARIA14.html) · [NN/g — The Magnifying-Glass Icon](https://www.nngroup.com/articles/magnifying-glass-icon/) | ✅ (2026-09-05) | Real `<label>` kept in the DOM (`.visually-hidden`), never `display:none` or placeholder-only — WCAG 1.3.1 still satisfied. Applies only when icon + placeholder make the field's purpose unambiguous (ARIA14's stated condition). NN/g still requires an open visible text-entry field (icon-only search discouraged outside small screens) — this exception hides only the floating label text, never the field itself. |

**Validation contract (synthesis of patterns 2 + 3):** validate on `onBlur`, then re-validate on
every keystroke while the field is in an error state. Never validate on the first keystroke.

---

## Implementation

### Web Component (Lit)
```html
<!-- Basic text field -->
<agtc-input label="Full name" name="fullname"></agtc-input>

<!-- With contextual help -->
<agtc-input
  label="Email address"
  type="email"
  name="email"
  helper-text="Used for notifications only"
></agtc-input>

<!-- Error state -->
<agtc-input
  label="Username"
  invalid
  error-message="This username doesn't exist"
></agtc-input>

<!-- Password with built-in toggle -->
<agtc-input
  label="Password"
  type="password"
  name="password"
  required
></agtc-input>

<!-- With prefix icon -->
<agtc-input
  label="Search"
  type="search"
  icon="search"
  placeholder="Search for a component…"
></agtc-input>

<!-- Search with a visually-hidden label (exception — icon required) -->
<agtc-input
  label="Search"
  hide-label
  type="search"
  icon="search"
  placeholder="Search for a component…"
></agtc-input>

<!-- Disabled -->
<agtc-input label="Postal code" disabled value="75001"></agtc-input>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a new type | Principal Designer + Tech Lead |
| Modifying a component token | Principal Designer |
| Changing validation behavior | Design system team |
| Accessibility bug fix | Design system team review |
