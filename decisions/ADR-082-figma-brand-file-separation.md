# ADR-082 — Brand/logo separated into a dedicated Figma library file (amends ADR-080)

> **Date:** 2026-07-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** ADR-080 (Community File content triage — amended), `.claude/rules/figma-library-governance.md`,
> GitHub Projects — Figma-domain "Séparer les composants Brand/logo dans un fichier Figma dédié" ticket (P2) <!-- lang-audit-ignore: literal ticket title (French, board convention) -->

## Context

ADR-080 (2026-07-21, earlier the same session) documented an open, not-yet-actioned
discussion: splitting the Agentica brand/logo out of the main design
system file into a separate published Figma library, consumed by the main file via
cross-file instances — floated as a structural alternative to manually excluding the
`FOUNDATIONS > logos` page at each Community File publish. That discussion explicitly
noted a reservation: the structural split does not by itself replace ADR-080's Rule 2
pre-publication nested-instance audit, because Figma tends to preserve an instance's
rendered appearance even when a third party who duplicates the file can't resolve the
link back to the source library.

This has now been executed, not just discussed:
- The `↳ logos` canvas (frames `Logo`, 5 color variants, and `Symbole`, 5 color
  variants — the same content ADR-080 described under `FOUNDATIONS > logos`) has been
  moved out of the main design system file into a new dedicated file, **`Agentica |
  Brand`** (file key `F8jhyCeRJaJhF7W1inlFuc`), confirmed live via the Figma MCP
  connector.
- The move is permanent, with no back-reference left in the main file.
- `Agentica | Brand` has been published as a Figma library and is consumed by the
  main file (`Agentica — Agentic design system`, file key `uXgPVB6cMLwAPqSwoa0dGq`)
  via cross-file instances — the cross-file pattern from the ADR-080 discussion is
  now live, not hypothetical.
- `COVER` was explicitly confirmed to remain in the main file — unaffected by this
  change.

## Decision

**Amends ADR-080 Rule 1:** `FOUNDATIONS > logos` is dropped from the page-level
exclusion list — there is no longer a page by that name in the main file to exclude.
`COVER` remains excluded, unchanged from ADR-080.

**ADR-080 Rule 2 (pre-publication nested-instance audit) is reaffirmed and now
concretely in scope**, not merely a future contingency: because `Agentica | Brand`
is a published library consumed via real cross-file instances, any component or
pattern in the main file that places a logo instance (e.g. a future `top-nav` or
page-banner pattern) will carry that instance if the main file is ever published as
a Community File. The pre-publication audit ADR-080 already specifies (exclude the
component, or replace the embedded instance with a placeholder before publishing)
applies exactly as written — this decision does not relax it. Per the ADR-080
discussion's own reservation: the structural split reduces where a logo *page* has
to be excluded, but does not, on its own, catch a logo *instance* embedded inside an
otherwise-generic component.

`tokens/figma-text-styles.json` and any other content sourced against the main file's
fileKey are unaffected — this change only concerns the logo/brand assets.

## Rejected alternatives

See ADR-080's "Discussion en cours" section for the alternative actually considered
at the time (keep the logo page in the main file, rely solely on the Rule 1
page-exclusion list at each publish) — rejected there already, for the reasons
recorded in that ADR: a manually-excluded page is one more thing to remember at every
future publish, where a structural file boundary removes the need to remember it at
all for the page-level case.

## Consequences

- `.claude/rules/figma-library-governance.md`'s Community File content triage section
  (added under ADR-080) is updated to drop `FOUNDATIONS > logos` from the exclusion
  table and record the new `Agentica | Brand` file key alongside the main file's.
- The GitHub Projects "Séparer les composants Brand/logo dans un fichier Figma dédié" ticket (P2) moves to Terminé (the board's Status field is French: Backlog/En cours/Terminé/etc.). <!-- lang-audit-ignore: literal ticket title + literal Status field value, both French by board convention -->
- Before the Community File is ever actually published, ADR-080's Rule 2 audit must
  still be run in full against whatever components/patterns exist by then — this
  ADR does not shrink that audit's scope, only the Rule 1 page list.
- Separately (not part of this decision, flagged for follow-up): while verifying this
  change, `get_metadata` without a `nodeId` was observed returning only a single page
  for both files rather than a full page list, and did not match the page the user
  had open locally at the time. If this reflects a real limitation of the Figma MCP
  connector's page enumeration, it could affect the completeness of the ADR-079
  weekly §22 full-library audit, whose premise depends on enumerating every page.
  Worth checking specifically during that routine's first real run (2026-07-27) and
  its scheduled meta-check.
