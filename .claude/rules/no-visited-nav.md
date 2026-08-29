# Rule: no-visited-nav

> Navigation elements never carry a distinct `:visited` state.
> **System-wide** scope rule (site, components, consumer applications).
> **Type:** rule
> **Logical path:** .claude/rules/no-visited-nav.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/development.md, .claude/rules/code-style.md, guidelines/components/link.md

---

## Absolute rule

```
❌ FORBIDDEN: styling :visited differently on a navigation element
✅ REQUIRED: the :visited color is realigned with the unvisited state
```

> Navigation is not "read / unread" **content**. A menu link, tab, breadcrumb,
> sidebar link, table of contents (TOC) entry, or header icon-button must look
> **the same** whether it was visited or not. The `:visited` state (the browser's
> purple tint, or any other drift) breaks consistency and hierarchy.

---

## Scope — what counts as a "navigation element"?

| ✅ In scope (no visited state) | ❌ Out of scope (visited state acceptable) |
|-------------------------------|------------------------------------------|
| Main nav (header), nav CTA | **Content** links within an article's prose |
| Sidebar, table of contents (TOC), tabs | Result/archive lists where "already read" helps the user |
| Breadcrumbs, pagination, menus | Long bibliographic references |
| Header/footer icon-buttons (GitHub, Storybook…) | |
| Footer navigation links | |

> When in doubt: if the element is used to **move around** the product, it's
> navigation → no visited state. If it points to a **resource to read**, the visited
> state may help → allowed.

---

## Reference implementation (CSS)

```css
/* Visited color = unvisited color (same semantic token). Declare BEFORE the
   :hover/.active rules — at equal specificity, the later selector
   (hover/active) must win over a visited AND hovered link. */
.top-nav a:visited,
.sidebar a:visited,
.toc a:visited,
.footer-links a:visited { color: var(--agtc-semantic-color-text-secondary); }
```

### Safari exception — literal value required

Safari (and WebKit) block `var()` resolution inside `:visited` rules for security
reasons (protection against browser history sniffing). `var()` is accepted as
syntax but silently ignored at apply time — the color stays the browser default.

**Correct pattern for the Agentica site:**
```css
/* Hex value resolved BEFORE the var() — Safari applies the hex, Chrome/Firefox apply var(). */
.top-nav a:visited { color: #646464; color: var(--agtc-semantic-color-text-secondary); }

/* Dark theme: same pattern with the resolved dark value */
[data-theme="dark"] .top-nav a:visited { color: #a4abb8; color: var(--agtc-semantic-color-text-secondary); }
```

> **This is NOT a hardcoded value** in the sense of `tokens-system.md`: the literal
> value is identical to the semantic token's resolved value. It's a browser security
> constraint, documented here so agents don't remove it during audits.
> Reference: ADR-047 (rule), ADR-092 (consolidated incident record — commits, timeline,
> and rationale; supersedes the shorter note previously here and in ADR-059).

- Always go through a **semantic token** (never a hardcoded value) — see `tokens-system.md`.
- Exception above: the literal value is allowed only in `:visited` rules,
  always paired with the `var()` token as the second declaration.
- Web Components (`agtc-*`): if a component exposes a navigation link (e.g. `agtc-link`
  used in nav, `agtc-segmented`, future `agtc-tabs`), it must neutralize `:visited` in its
  shadow DOM following the same rule.

---

## Verification (quality gate)

- [ ] No navigation element shows a distinct `:visited` color (visual + CSS audit)
- [ ] The `:visited` neutralization goes through a semantic token, not a hardcoded value
- [ ] **Content** links are NOT affected (the rule only applies to navigation)

---

## Rule for agents

```
✅ Neutralize :visited on every navigation element (site AND components)
✅ Keep the visited state on content/reading links where relevant
❌ Style :visited a different color on a menu, tab, sidebar, TOC, or nav button
❌ Hardcode the color — always go through a semantic token
```
