# Component: Top-nav — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-15
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/top-nav.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-060-agtc-top-nav-implementation.md, guidelines/components/tabs.md, .claude/rules/no-visited-nav.md

---

## Intent

**Why this component exists:**
Provide the product's main horizontal navigation as inter-page links.
Visually inspired by the tabs pattern (full-height border-bottom indicator), but semantically
correct: `<nav>` + `<a>` + `aria-current="page"`, not `role="tablist"`.

**This component is not:**
- `agtc-tabs` — which displays in-page content panels with `role="tablist"`
- `agtc-segmented` — immediate-effect setting (language, density)
- A dropdown menu

---

## Architecture note — site usage (ADR-087)

The Agentica site itself does **not** mount `<agtc-top-nav>` on its own pages — its main nav is
hand-written markup (`.site-nav`) styled through the same token contract described below. This is
a looser version of the "mix" pattern used by `agtc-table`/`agtc-banner`/`agtc-code-block`
(ADR-040/041/042): those expose a dedicated, documented CSS class (`.agtc-table`, etc.) as a
first-class alternative form; `.site-nav` is ordinary site chrome that happens to consume the same
tokens, not a maintained class variant of this component. Everything in this contract (properties,
tokens, states, accessibility) still applies to any consumer that mounts the real component.

---

## Distinction from `agtc-tabs`

| | `agtc-top-nav` | `agtc-tabs` |
|---|----------------|-------------|
| ARIA semantics | `role=navigation` + `<a>` | `role=tablist` + `role=tab` + `role=tabpanel` |
| Keyboard navigation | Tab + Enter (standard links) | Arrows ←/→ + Home/End (roving tabindex) |
| Active state | `aria-current="page"` | `aria-selected="true"` |
| Effect | Inter-page navigation | In-page content panel |
| CTA | Yes (built-in Get Started button) | No |

---

## Properties

| Property / Attribute | Type | Default | Description |
|----------------------|------|--------|-------------|
| `items` | Array | `[]` | `[{ label?, labelFr?, labelEn?, href, cta? }]` — list of links |
| `current` | String | `window.location.pathname` | Pathname for active link detection |
| `nav-label` | String | `"Main navigation"` | `aria-label` of the `<nav>` element (**required** for AT) |

### Structure of an item

```javascript
{
  labelFr: 'Tokens',        // French text (shown when data-lang="fr")
  labelEn: 'Tokens',        // English text (shown when data-lang="en")
  label:   'Tokens',        // language-neutral fallback (if labelFr/labelEn absent)
  href:    '../tokens/',    // destination URL
  cta:     false,           // true → adoption CTA button (Get Started)
}
```

### Bilingualism

The component observes `document.documentElement[data-lang]` via `MutationObserver`
and automatically re-renders when the language changes. There is no need to
re-assign `.items` on a language change.

### Mobile — open state

Add the `.open` CSS class on the `<agtc-top-nav>` host to open the mobile drawer.
The component manages its own responsive CSS via `@media (max-width: 768px)` in shadow DOM.

```javascript
document.querySelector('agtc-top-nav').classList.toggle('open');
```

---

## Usage

```html
<agtc-top-nav nav-label="Main navigation"></agtc-top-nav>
<script>
  const nav = document.querySelector('agtc-top-nav');
  nav.items = [
    { label: 'Tokens',      href: '../tokens/' },
    { label: 'Components',  href: '../components/' },
    { label: 'Foundations', href: '../foundations/' },
    { label: 'Agents',      href: '../agents/' },
    { label: 'Decisions',   href: '../decisions/' },
    { label: 'Get started', href: '../get-started.html', cta: true },
  ];
  nav.current = window.location.pathname;
</script>
```

---

## Variants

| Variant | Description |
|---------|-------------|
| Tab link (default) | Full-height navigation link, border-bottom indicator on active hover |
| CTA (`cta: true`) | Visually distinct adoption button — rounded, action-primary background, separated from the tabs |

---

## Tokens

### Component tokens (source of truth)

| CSS token | Resolved value | Usage |
|-----------|----------------|-------|
| `--agtc-component-top-nav-tab-color` | `semantic.color.text.secondary` | Link at rest |
| `--agtc-component-top-nav-tab-color-hover` | `semantic.color.text.primary` | Link on hover |
| `--agtc-component-top-nav-tab-background-hover` | `semantic.color.background.subtle` | Background on hover |
| `--agtc-component-top-nav-tab-color-active` | `semantic.color.action.primary` | Active page link |
| `--agtc-component-top-nav-tab-indicator-color` | `semantic.color.action.primary` | Indicator color |
| `--agtc-component-top-nav-tab-indicator-width` | `2px` | Indicator thickness |
| `--agtc-component-top-nav-tab-padding-x` | `14px` | Horizontal tab spacing |
| `--agtc-component-top-nav-tab-font-size` | `semantic.typography.label.size` | Text size |
| `--agtc-component-top-nav-tab-font-weight` | `semantic.typography.label.weight` | Default weight |
| `--agtc-component-top-nav-tab-font-weight-active` | `semantic.fontWeight.bold` | Active page weight |
| `--agtc-component-top-nav-tab-focus-ring` | `semantic.color.border.focus` | Keyboard focus ring |
| `--agtc-component-top-nav-cta-gap` | `8px` | Tabs → CTA separation |
| `--agtc-component-top-nav-cta-background` | `semantic.color.action.primary` | CTA background |
| `--agtc-component-top-nav-cta-background-hover` | `semantic.color.action.primary-hover` | CTA background hover |
| `--agtc-component-top-nav-cta-color` | `semantic.color.text.on-action` | CTA text |
| `--agtc-component-top-nav-cta-padding-x` | `semantic.space.control.padding-x` | CTA horizontal spacing |
| `--agtc-component-top-nav-cta-padding-y` | `semantic.space.control.padding-y` | CTA vertical spacing |
| `--agtc-component-top-nav-cta-radius` | `semantic.radius.control` | CTA radius |

---

## States

| State | CSS selector | Behavior |
|------|---------------|--------------|
| Rest | `a` | `text-secondary` text, no background |
| Hover | `a:hover` | `background-subtle` background, `text-primary` text — flat, no border-radius |
| Click | `a:active` | Same as hover — no press effect (link, not a button) |
| Keyboard focus | `a:focus-visible` | `outline:2px solid border-focus; outline-offset:2px` |
| Active page | `a[aria-current="page"]` | `action-primary` text, bold, `border-bottom-color:action-primary` |
| Visited | `a:visited` | Same as rest — navigation does not show the read state (ADR-047) |

---

## Accessibility

- `<nav aria-label="...">` — required landmark, named via `nav-label`
- `aria-current="page"` — automatically applied to the active link
- `:focus-visible` — visible ring on all links (WCAG 2.4.7)
- Keyboard navigation: **Tab** to traverse the links, **Enter** to activate
- `:visited` neutralized — visual consistency (ADR-047, ADR-059 for Safari)
- Touch targets ≥ 44px (header height = 64px) — WCAG 2.5.5

---

## UX Patterns Reference

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Navigation landmark `<nav aria-label>` | [W3C WAI Landmarks](https://www.w3.org/WAI/ARIA/apg/) | ✅ | Invisible to AT without a landmark |
| `aria-current="page"` on the active link | [WCAG 2.4.4 / 4.1.2](https://www.w3.org/WAI/WCAG22/) | ✅ | CSS class alone is insufficient |
| Full-height border-bottom indicator | [NN/g — Horizontal Navigation](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Filled background = toggled button |
| No `role="tablist"` for inter-page nav | [W3C APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Incorrect semantics without a panel |
| Visually distinct CTA (pill button) | [IxDF — Clear primary action](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Adoption is an action, not a destination |
| `:visited` neutralized | ADR-047 | ✅ | Navigation ≠ read/unread content |
| Mobile hamburger + `aria-expanded` | [NN/g — Mobile nav](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | No horizontal scrolling |

---

## Rules for agents

```
✅ Always provide nav-label — the aria-label is mandatory for AT
✅ Use aria-current="page" (automatically managed by the component)
✅ Mark the adoption button with cta:true — never as a standard tab
✅ Handle language (labelFr/labelEn) on the consumer side, not in the component
❌ Do not use role="tablist" on this element — it is inter-page navigation
❌ Do not add border-radius to the tab links
❌ Do not add a persistent filled background to the active link
```
