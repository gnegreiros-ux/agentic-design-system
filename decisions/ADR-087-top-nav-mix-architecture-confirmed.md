# ADR-087 — `agtc-top-nav` confirmed as "mix" architecture, dead mobile-menu code removed

> **Date:** 2026-07-22
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-087-top-nav-mix-architecture-confirmed.md
> **Read before:** AGENTS.md, DESIGN.md, decisions/ADR-060-agtc-top-nav-implementation.md
> **Relations:** decisions/ADR-060-agtc-top-nav-implementation.md, decisions/ADR-040-agtc-table-implementation.md, decisions/ADR-041-agtc-code-block-implementation.md, decisions/ADR-042-agtc-banner-implementation.md, guidelines/components/top-nav.md, scripts/smoke-test.js, site/build.js, GitHub Projects — Composants-domain "agtc-top-nav smoke-test" ticket (resolved by this ADR) <!-- lang-audit-ignore: literal ticket title -->

---

## Context

`npm run smoke` had one failing check: `"agtc-top-nav — nav display flex (desktop)"`, looking for
a real `<agtc-top-nav>` custom element on `index.html` and querying `nav` inside its shadow DOM.
Investigation found the check itself was wrong, not the site: `index.html`'s navigation has
always been hand-written markup (`.site-nav`) styled through the component's tokens — the same
"mix" pattern already established and documented for `agtc-table` (ADR-040), `agtc-code-block`
(ADR-041), and `agtc-banner` (ADR-042). `<agtc-top-nav>` itself exists and is used elsewhere
(component demo page), but was never mounted on the live site nav.

A related discovery made while fixing this: `site/build.js`'s embedded `site.js` had a fully dead
code block —
```js
const menuToggle = document.querySelector('.menu-toggle');
const topNav = document.querySelector('agtc-top-nav');
if (menuToggle && topNav) { /* … */ }
```
Neither selector ever matches anything in the generated HTML (the real mobile-menu button is
`<button class="menu-btn" data-menu-toggle>`, not `.menu-toggle`), so this `if` never ran. The
site's actual mobile menu has worked all along through a separate, already-correct mechanism
(`[data-menu-toggle]` / `[data-main-nav]`, labeled "Menu mobile V2" in a comment — a name that no
longer means anything now that the only other version was dead code, not a real V1).

## Decision

1. **`agtc-top-nav` is confirmed "mix" architecture** for the site's main nav, consistent with
   ADR-040/041/042: the component exists and is documented in
   `guidelines/components/top-nav.md`/`.claude/rules/no-visited-nav.md` for consumers who mount
   it directly, but the live site keeps its hand-written `.site-nav` markup, tokenized the same
   way. No component code changes.
2. **`scripts/smoke-test.js`'s top-nav check now targets `.site-nav` directly** (light DOM,
   `display: flex`) instead of a shadow-DOM selector on an element that was never mounted. The
   script gained light-DOM support (`shadowSelector: null` skips the shadow-root traversal and
   the custom-element-upgrade wait) so this pattern is reusable for any future light-DOM-only
   check.
3. **The dead `agtc-top-nav`/`.menu-toggle` mobile-menu block removed** from `site/build.js`. The
   real mobile menu (`[data-menu-toggle]`/`[data-main-nav]`) is unaffected — it was already the
   only one that ever ran. Its comment renamed from "Menu mobile V2" to "Mobile menu" now that
   there is no other version to distinguish it from.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Mount the real `<agtc-top-nav>` on `index.html` (full dogfooding) | Real risk on the site's highest-traffic, marketing-mode page for a check that exists to catch regressions, not to drive architecture; would need re-verifying the mobile menu, lang-switch, `:visited` handling, and Playwright snapshots all still match once the shadow DOM replaces hand-written markup — a separate, larger piece of work than fixing a wrong test |
| Leave the smoke-test check failing / delete it outright | It was catching a real (if misdiagnosed) drift risk — the site's nav display property regressing silently; better to point it at the actual markup than remove coverage |

## Consequences

- `npm run smoke`: 7/7 checks pass again.
- No visual or functional change to the live site — `.site-nav` markup and the working mobile
  menu are untouched; only dead code was removed.
- GitHub Projects: the linked ticket moved to Terminé. <!-- lang-audit-ignore: literal Status field value, French by board convention -->
- Any future decision to actually mount `<agtc-top-nav>` on the site (full dogfooding, per
  `project_site_as_lab`/dogfooding backlog category C) supersedes this ADR's point 1 and would
  need to update the smoke-test check back to a shadow-DOM one at that time.
