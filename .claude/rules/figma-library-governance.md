---
paths:
  - "scripts/figma/**"
  - "tokens/figma-text-styles.json"
---

# Rule: figma-library-governance

> Governance charter for the Agentica Figma library — code is the source of truth, Figma is
> its representation. These rules apply to **every agent** creating or modifying a
> component, page, or variable in the Figma file.
> **Type:** rule
> **Logical path:** .claude/rules/figma-library-governance.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/figma-components.md
> **Relations:** .claude/instructions/figma-components.md (Plugin API mechanics + §22 audit),
> .claude/rules/tokens-system.md, tokens/*.json, components/agtc-*.js, components/agtc-*.stories.js

---

## The 5 absolute rules

```
1. CODE is the single source of truth — never the other way around.
   components/agtc-*.js + *.stories.js define variants, states, properties.
   Figma REPRODUCES them. In case of divergence, code wins — we fix Figma, never
   the reverse without an explicit human decision (an ADR if the change must flow back into code).

2. No hardcoded value in a Figma component. Only Figma Variables mirroring the code
   tokens (primitive → semantic → component, see tokens-system.md).
   A fill, stroke, padding, radius, or gap not bound to a Variable is a bug —
   not an acceptable exception.

3. Same architecture, same logic, same options as in code.
   If agtc-button.js exposes variant + icon + icon-suffix + icon-only + loading + disabled,
   the Figma ComponentSet exposes EXACTLY these axes — no more, no less. A Figma
   property that doesn't exist on the code component is an invention to be fixed.

4. Figma construction aligned with industry best practices (§ below) — no shortcut
   that breaks parity with code at hand-off time.

5. The Figma visual rendering must be as close as possible to Storybook and the final
   screen. Industry-acknowledged nuance (2026): there is no reliable solution for
   automatic structural Figma↔code parity — verification stays human + scripted (§22
   audit), never a one-time automated guarantee.
```

---

## Lifecycle of a Figma change — staging, no-delete, report

> Adopted 2026-07-08 (Button pilot review). Completes the 5 absolute rules on the
> **process** side. These three guardrails exist because a sub-agent mistakenly deleted
> the master Button ComponentSet while "cleaning up" a section that contained it — an
> incident that would not have happened under these rules.

### A. Never delete — hard rule

```
❌ FORBIDDEN: deleting a node, component, ComponentSet, variable, page, or Text Style —
   even if it looks orphaned, duplicated, or "just a draft"
✅ If in doubt about removing a node: MOVE it out of the flow (e.g. a "_trash" frame
   at x=6000) and FLAG it to the human — never .remove()
✅ The only exception: deleting a node the agent JUST created in the same session
   and is immediately rebuilding (e.g. rebuilding a broken ComponentSet)
```

> Before any `.remove()`, check `node.findAll()`/`node.children`: a "decorative" node
> can contain a master component as a direct child (the exact cause of the Button incident).

> **2026-07-30 recurrence, page-consolidation variant.** While merging two Icon pages,
> a "leftover content" sweep moved a `Composant principal` reference frame into `_trash`
> without checking what it contained — it held the ACTUAL master `Icon` ComponentSet
> (§16 convention: this frame IS where the master lives, off-canvas, on every page). The
> `_trash` frame sat on the now-redundant old page, which the human then deleted per the
> normal "flag for manual deletion" flow — taking the master ComponentSet down with it.
> Recovered only because Figma kept a `removed: false`, `parent: null` zombie reference
> reachable in the same session (`page.appendChild()` on it worked); this would NOT have
> been recoverable in a later session. **When "cleaning up" or consolidating a page, always
> check every node being moved to `_trash` for a nested `Composant principal` (or any
> ComponentSet/COMPONENT) FIRST — move the real master to its new home BEFORE trashing the
> rest, never lump it in with disposable content.**

### B. Staging page "Proposal — pending approval"

> Page name carries no emoji (`.claude/rules/no-emoji-icons.md`) — if a visual marker is wanted
> next to it in the page list, use a real Lucide icon instance, never an emoji character.

```
✅ Every significant creation or redesign is written FIRST on the staging page
✅ The human approves visually, THEN the agent moves the result to the final page
✅ Small targeted fixes (a token, a link) can be made in place
❌ Never publish the library or move to the final page without explicit approval
```

### C. Mandatory report — 10-point checklist before any human review

Before requesting your validation, the agent provides this short report (complements the
detailed §21/§22 audit, does not replace it):

```
[ ] 1. All contract props present, with the correct Figma type
[ ] 2. No combined prop ("Style" merging variant + state)
[ ] 3. A text property on every text layer — zero hardcoded text
[ ] 4. Full variant × state matrix, including focus
[ ] 5. 100% variables bound — zero hardcoded hex/px (scanUnboundPaints §22.3) AND zero
       unbound Text Style property — fontSize/fontFamily/fontWeight/lineHeight
       (scanUnboundTextStyleProperties §22.4, 2026-07-09 incident: 10/11 existing
       styles were unbound despite displaying correct-looking values)
[ ] 6. Auto-layout everywhere, no absolute positioning (outside of _prefixed decor)
[ ] 7. Naming compliant (ComponentSet, Variant/State props, layers)
[ ] 8. Panel order matches the documented API
[ ] 9. Description + link to guidelines/components/<comp>.md filled in
[ ] 10. Screenshot compared against the site rendering — discrepancies fixed
```

Format: **10-point list + screenshot + residual discrepancies**. Never a deliverable without this report.

---

## Why this hierarchy (code → Figma, never the reverse)

> "Structural component parity — keeping Figma variants, states, and properties in sync
> with coded component APIs — does not have a reliable automated solution. The most
> consistent advice from mature design systems teams is: **code is the source of truth,
> Figma is the representation**." — [Atomize, Figma Design System Parity 2026](https://atomize.tools/blog/figma-design-system-parity-code-sync)

This repository follows this principle to the letter. Concretely, for an agent:

```
✅ Before creating/modifying a Figma component: read components/agtc-<comp>.js AND
   components/agtc-<comp>.stories.js — that's WHERE the real variants/states/props live
✅ If Figma and code diverge: Figma is wrong by default, unless a human decides otherwise
✅ If the code itself seems to have a flaw (nonexistent token, hardcoded value):
   flag it to the human — never silently "fix" it only on the Figma side
❌ Never invent a variant, state, or property that doesn't exist in the code
❌ Never let Figma "be right" over the code without a human ruling
```

---

## Token architecture — Figma Variables = exact mirror of code

Three collections, aligned with `tokens/primitives.json` → `tokens/semantic.json` → `tokens/component.json`:

| Code level | Figma collection | Binding rule |
|---|---|---|
| `primitive.*` | `Primitives` | **Never** bound directly to a component |
| `semantic.*` | `Semantic` | Bound if no component token exists for this role |
| `component.<comp>.*` | (via alias to Semantic, same `component/<comp>/<prop>` naming) | **Always priority** — look for the component token before binding to semantic (see §18 of `figma-components.md`) |

**Sourced**: "Never bind a component directly to a Primitive Color variable. Bind components
to semantic variables only." — [Design Systems Collective, Figma Variables Playbook](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66)

Naming convention — **identical on both sides** (Figma path = CSS custom property):
```
Figma : component/button/primary/background
Code  : --agtc-component-button-primary-background
```
No manual translation should be needed to connect the two — the Figma path with `/`
replaced by `-` and prefixed with `--agtc-` MUST match exactly.

---

## Components vs Variants — when to use which (sourced reminder)

> "Use component properties for simple variations (on/off icon, text content) and variants
> for visual changes (primary/secondary/ghost). Auto-layout and Variable bindings on every
> component are not optional refinements — they are baseline for production handoff."
> — [Atomize, Figma Design System Best Practices 2026](https://atomize.tools/blog/figma-design-system-best-practices/)

```
✅ VARIANT (ComponentSet axis): qualitative visual change — Primary/Secondary/Ghost,
   Text/Search/Password, Default/Selected
✅ COMPONENT PROPERTY (BOOLEAN/TEXT/INSTANCE_SWAP): presence/absence or content —
   icon-only, show-icon-prefix, the button's label, the displayed icon
❌ Never create a variant for what is actually a boolean property of the code
   component (2026-07-06 Button icon incident — see §3 of figma-components.md)
```

---

## Watch — sources to re-verify periodically

This list must be re-verified (WebSearch) at the start of any large-scale Figma effort
(new component, architecture redesign) — Figma practices evolve quickly.

| Source | What it covers |
|---|---|
| [Figma Help — Guide to variables](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma) | Official variables API, Figma source of truth |
| [Atomize — Figma Design System Best Practices](https://atomize.tools/blog/figma-design-system-best-practices/) | Token architecture, variants vs properties |
| [Atomize — Figma↔Code Parity](https://atomize.tools/blog/figma-design-system-parity-code-sync) | Positioning code as source of truth |
| [Design Systems Collective — Figma Variables Playbook](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66) | Binding anti-patterns, naming |
| [W3C WCAG — Technique C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40.html) | Two-color focus ring (reference for any interactive component) |
| [zeroheight — Scalable Figma Design Systems](https://zeroheight.com/blog/building-scalable-design-systems-with-figma-26-tips-for-2026/) | Scalability, in-page documentation |

> Don't rely solely on this fixed table: run a targeted search if a recurring structural
> issue appears (like the 2026-07-07 focus ring incident, which led to documenting
> technique C40 after the fact — it should have been verified upfront).

---

## Tokens Studio write-access restriction — `agentica/proposals` (ADR-078)

> Prerequisite before any Tokens Studio write path into this repo is enabled (not
> before ordinary read-only agent work covered by the rest of this file).

Tokens Studio's API credentials are account-scoped, not branch/project-scoped — a key
has full access to every org/project the account belongs to. If Tokens Studio's
push-to-GitHub feature is ever turned on, it must write only to the `agentica/proposals`
branch, never `main` directly.

```
Status (2026-07-21, ADR-078 Active):
✅ agentica/proposals branch created (off main)
✅ main already refuses direct pushes, PR + green CI required (ADR-076/077) —
   satisfies this ticket's branch-protection requirement, no extra config needed
✅ Dedicated GitHub service account (agentica-tokens-bot, Write, not Admin) + PAT
   — classic PAT (repo scope) for now, fine-grained migration pending account aging
✅ Tokens Studio's GitHub-sync settings pointed at main, reads verified via HAR
   trace (82 requests, all 200/204, zero writes attempted)
```

There is still no active Tokens Studio write path into this repo — only the read
direction (ADR-011) has ever been exercised. This section documents the safety rail
that now exists should a push capability ever be turned on, not a currently-used
push feature.

---

## Mandatory audit — see §22 of `figma-components.md`

The full audit (accessibility, display, variables, styles, states, variants,
in-page documentation, links) is scripted and documented in
`.claude/instructions/figma-components.md` §22. It must be run:

```
✅ On any newly created page, before declaring it complete
✅ On any page whose shared component (Icon, Text Style, Variable) has been modified
✅ At explicit user request ("audit", "check everything", "global screenshot")
✅ Automatically, weekly, against the WHOLE library — scheduled cloud agent
   (routine `trig_015wTFo2gJNztALS2bvFZ54d`, Mondays 06:00 America/Toronto),
   ADR-079. Closes the gap the three triggers above leave open: none of them
   ever re-checks a page nobody has recently touched.
```

Weekly-run outcome: silent if clean; a GitHub issue (label `figma-audit`) if
any violation is found, or if the run itself fails — a failure is never left
indistinguishable from a clean result.

**Confirmed risk (flagged 2026-07-21 during ADR-082 verification, confirmed
2026-07-28 on the separate `Agentica — Lucide Icons` file, `TRMVFT2TenOibMniLYu00S`):**
`get_metadata` called without a `nodeId` returned only a single page
(`❖ GETTING STARTED`) for a file that in fact already had at least three more
top-level pages (`COVER`, `❖ CATEGORIES`, a `---` separator) sitting at lower
node IDs than the one page it reported — meaning page enumeration is silently
scoped to less than the whole file, not a one-off glitch. No data was lost in
that incident (the missing pages were pre-existing and untouched, discovered
only during an unrelated audit), but any workflow relying on this call to
"enumerate every page" — including the weekly scheduled audit routine above —
must not trust its page list as complete. Prefer a targeted `nodeId` call per
already-known page, or cross-check the returned list's plausibility (e.g.
against an expected page count) before trusting it. First real run's
scheduled meta-check (`trig_01UViQKgDMyb4ATCBeMduYsS`) should verify whether
this also affects the main design system file, not just newly created ones.

---

## Community File content triage — brand identity stays private (ADR-080)

> Applies only when the still-Backlog "publish a Community File" chantier is
> actually executed — not a constraint on ordinary work today.

```
✅ Any page whose content IS the Agentica brand identity (the logo mark
   itself, not documentation about a generic concept) → excluded from
   any future Community File publish
✅ Any page documenting a generic, reusable design-system concept
   (Foundations, Components, Patterns) → included, even pages that don't
   exist yet — this is a category rule, not a fixed list
✅ Before publication is ever executed: also audit every component/pattern
   for a NESTED instance of the logo (e.g. a future top-nav or banner
   pattern) — publishing a component that embeds the logo leaks it even
   if the dedicated logos page itself is excluded
❌ Do not require a placeholder/generic logo in ordinary design work today —
   the pre-publication audit above catches embedding risk at the point it
   actually matters, no need to route around the brand system now for a
   publication with no scheduled date
```

`COVER` remains in the main file (`uXgPVB6cMLwAPqSwoa0dGq`) and stays excluded
from any future Community File publish. `FOUNDATIONS > logos` no longer
applies as a page-level exclusion (ADR-082) — that content was moved
permanently, no back-reference, to a dedicated published library, **`Agentica
| Brand`** (file key `F8jhyCeRJaJhF7W1inlFuc`), consumed by the main file via
cross-file instances. The Rule 2 nested-instance audit above is unaffected and
now concretely in scope: any component/pattern that places a logo instance
from that library still needs auditing before a Community File publish — the
structural split only removes the page-level exclusion, not the
instance-embedding risk.

---

## Community File license — CC BY 4.0 (ADR-081)

> Applies only when the still-Backlog "publish a Community File" chantier is
> actually executed — not a constraint on ordinary work today.

The repo's `LICENSE` (MIT) covers the code only, not the Figma file itself.
When the Community File is published, its Figma Community license must be set
to **CC BY 4.0** — chosen for consistency with the code's permissive MIT
license (attribution required, no restriction on reuse/modification/commercial
use). Declare it in Figma's publish flow and state it in the file's Community
description.

---

## Icon component naming — flat names only, no "/" grouping prefix (2026-07-31)

> **Absolute rule:** master icon components in the "Agentica | Lucide Icons" library file
> are named with the bare icon name only — e.g. `activity`, `settings`, `arrow-right`.
> **Never** prefix with a category or type label containing `/` (e.g. `Icon / activity`,
> `Icons/activity`).

Figma automatically groups any component whose name contains `/` into a nested folder in
every picker that lists it (the instance-swap picker, the assets panel, the insert picker).
All ~3,449 icons across the 42 category pages were originally named `Icon / {name}` —
every single swap required an extra click to expand the "Icon" folder before reaching the
actual icon name. Fixed 2026-07-31 by stripping the prefix on all 42 pages (one component
rename per icon, no visual/geometry change). If a future batch import reintroduces a
grouping prefix (a common default from some Figma-to-component import scripts and Tokens
Studio-adjacent tooling), strip it before publishing — never leave a "/" in a Lucide icon
component's name.

---

## Rules for agents

```
✅ Read the code (component + stories) BEFORE touching Figma — never the reverse
✅ Look for the component token before binding to semantic — never a hardcoded value
✅ Match Figma variants/properties 1:1 with the code component's API
✅ Re-run a best-practices search before a large-scale effort
✅ Run the §22 audit before declaring a component or page complete
❌ Never invent a variant, token, or property absent from the code
❌ Never resolve a Figma↔code divergence by favoring Figma without human arbitration
❌ Never treat a non-scripted visual audit (just a screenshot) as sufficient
```
