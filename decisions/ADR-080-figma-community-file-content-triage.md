# ADR-080 — Figma Community File content triage rule: brand identity stays private

> **Date:** 2026-07-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** `.claude/rules/figma-library-governance.md`, GitHub Projects — Figma-domain Community File content-triage ticket (Priority P1, this session)

## Context

A Figma **Community File** is publicly visible and freely duplicable by anyone
who finds it — once a third party duplicates it, that copy is theirs, with no
way to revoke or retract it. The backlog chantier to publish this library as a Community File (still in
Backlog, no publication date set — the library is early-stage, most
components and every pattern still need to be built) requires deciding,
ahead of that eventual publication, what content is safe to hand out this
way and what must not be.

Two categories of leak risk were identified while reviewing the file
(`uXgPVB6cMLwAPqSwoa0dGq`) live in Figma:
1. **Page-level**: entire pages whose content is the Agentica brand identity
   itself, not generic design-system documentation.
2. **Component-embedding**: a generic, otherwise-publishable component
   (e.g. a future `top-nav` or a page-banner pattern) could nest an
   *instance* of the logo component inside it — publishing that component
   would carry the embedded logo along with it, even if the dedicated
   `logos` page itself is excluded. Flagged by the Design System Lead during
   this review: the logo is expected to be used inside top-nav/banner
   patterns soon, once that work starts.

## Decision

**Rule 1 — page-level exclusion (durable, applies to future pages too, not
just today's inventory):**

> Any page whose content specifically identifies Agentica/the organization
> (the brand mark itself, not documentation *about* generic design-system
> concepts) is excluded from the Community File. Any page documenting a
> generic, reusable design-system concept (Foundations, Components, Patterns)
> is included — including pages that don't exist yet.

Concrete instances of the excluded category today (reviewed live in Figma,
2026-07-21):

| Page | Why excluded |
|---|---|
| `COVER` | Full Agentica brand mark composition + `agentica.design` domain |
| `FOUNDATIONS > logos` | The logo itself: 5 full-lockup color variants (Teal/Color/Black/White/Color White) + 3 symbol-only variants |

Everything else reviewed is generic and included: `INTRO`, `FOUNDATIONS >
icons/colors/spacing/typography`, every page under `COMPONENTS` (button,
input, toggle, checkbox, radio, segmented, icon, tabs, top-nav, feature-card),
and `PATTERNS` (currently an empty placeholder — nothing to triage yet).

**Rule 2 — pre-publication component audit (not yet actionable, required
before any actual publish):**

> Before publication is ever executed (separate, still-Backlog chantier), audit
> every component and pattern in the file for a nested instance of the logo
> component. For each one found: either exclude that specific component from
> the publish, or replace the embedded logo instance with a generic
> placeholder before publishing.

This rule is deliberately **not enforced today** — the library is still being
built (most components and every pattern remain to be created), and requiring
placeholder branding in ordinary work now, years before any publish date, was
explicitly rejected (see below) as unnecessary friction on current design
work.

## Rejected alternatives

- **Require a generic/placeholder logo everywhere in patterns starting now**
  (e.g. in `top-nav`, page banners), instead of the real Agentica mark.
  Rejected: solves the embedding-leak problem structurally, but forces every
  future component/pattern to route around the brand system's own logo
  during ordinary design work, for a publication that isn't scheduled and
  won't happen until the library is far more complete. The pre-publication
  audit (Rule 2) catches the same risk at the point it actually matters —
  right before publishing — without that ongoing cost today.
- **Treat today's page inventory as the final exclusion list.** Rejected per
  the Design System Lead: the library is at the very beginning of its
  construction — new components and every pattern still need to be added.
  A static list would silently go stale the moment a new page is created.
  Rule 1 is written as a category-based principle for this reason, not an
  enumeration.

## Consequences

- No action is required in Figma right now — this ADR documents the rule the
  *eventual* publication must follow, not a change to make today.
- When work begins on any pattern or component that visually incorporates the
  logo (top-nav, banners, etc.), that's expected and not a governance
  violation — Rule 2's audit is a pre-publication gate, not a
  pre-construction one.
- Before the Community File publication chantier is ever
  actually executed, both rules must be applied: re-run the Rule 1 triage
  (new pages may exist by then) and run the Rule 2 component-embedding audit
  in full — neither is optional at that point.
