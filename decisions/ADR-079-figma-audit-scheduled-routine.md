# ADR-079 — Weekly scheduled cloud agent for the Figma §22 full-library audit

> **Date:** 2026-07-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** `.claude/instructions/figma-components.md` §22 (audit checklist, amended), `.claude/rules/figma-library-governance.md`, GitHub Projects — "Figma gouvernance — Automatiser/planifier l'audit §22"

## Context

The §22 audit (9 categories: accessibility, page display, variables, Text
Styles, states, variants, in-page documentation, links, code↔Figma parity) has
existed since 2026-07-08, but only ever triggers on a newly created/modified
page, or on explicit human request ("audit", "check everything"). It has never
run against the *existing* library as a whole.

That gap caused a real incident: on 2026-07-09, 10 of the library's 11 Text
Styles had zero Figma Variables bound to their `fontSize`/`fontFamily`/
`fontWeight`/`lineHeight` — literal values only, invisible unless someone
opened each style and inspected its bindings. It was caught by a human
manually comparing styles by eye, not by any systematic check, because no
audit was running on pages nobody had recently touched.

## Decision

A weekly scheduled cloud agent ("routine"), created via the `schedule`
skill/`RemoteTrigger` API, runs the full §22 checklist against the *entire*
Figma library every Monday at 06:00 America/Toronto (`10:00 UTC`,
cron `0 10 * * 1`):

- **Trigger ID:** `trig_015wTFo2gJNztALS2bvFZ54d`
- **Scope:** every page and component/ComponentSet in the file
  (`uXgPVB6cMLwAPqSwoa0dGq`), not a subset — the exact gap that let the
  2026-07-09 incident go undetected
- **Environment:** the only cloud environment available on this account
  ("Portfolio web", `env_01GrYNDKPKbnLc4HE3dvaftU`) — not a deliberate choice,
  there was no alternative to pick from
- **Reporting:** silent if clean; a GitHub issue (label `figma-audit`) if any
  violation is found, grouped by the 9 categories with exact node/style names;
  a GitHub issue is also filed if the run fails outright (Figma unreachable,
  MCP error), so a failed run can never be mistaken for a clean one
- **Read-only:** the routine never modifies the repo or the Figma file — audit
  and report only, exactly like the existing `playwright-reminder.yml` pattern
  for visual regressions

## Rationale

A recurring, unattended check is the only way to catch drift on pages nobody
is actively touching — the 2026-07-09 incident's whole failure mode was that
nothing was looking at *already-shipped* library content. Weekly matches how
the library actually changes: in bursts around specific chantiers, not
continuously, so daily would be noisy and monthly would let drift sit for too
long between publications.

## Rejected alternatives

- **A GitHub Actions workflow, like `playwright.yml`.** Rejected: §22's checks
  run inside the Figma Plugin API sandbox (`use_figma`/Figma MCP tools) against
  a live Figma session — there is no headless, CI-runnable equivalent the way
  Playwright drives a browser. A cloud agent with the Figma MCP connector
  attached is the only mechanism available that can actually execute this.
- **Trigger only before each Community File publication.** Rejected (per
  discussion with the Design System Lead): no publication is currently
  scheduled (the Community File chantier is still Backlog), so a
  publication-triggered-only cadence would mean the audit effectively never
  runs until then — reintroducing the exact "ad hoc" gap this ticket exists to
  close.
- **Always report, even when clean.** Rejected: the Design System Lead chose
  issue-only-on-violation, matching `playwright-reminder.yml`'s existing
  philosophy of only surfacing actionable problems.

## Consequences

- Drift on any page, however old or untouched, surfaces within at most a week
  instead of only by chance human discovery.
- The routine's prompt is self-contained (the cloud session starts with no
  memory of this conversation) and points at `.claude/instructions/figma-components.md`
  §22 as the single source of truth for what counts as a violation — if §22's
  checklist changes, the routine's behavior changes with it automatically,
  with no separate copy to keep in sync.
- First real-world validation (does `gh issue create` actually work from this
  cloud environment, does the Figma MCP connector reliably enumerate the whole
  library) only happens at the first scheduled run (2026-07-27) — this ADR
  will need a follow-up note if that run reveals a configuration gap.
