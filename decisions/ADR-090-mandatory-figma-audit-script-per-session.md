# ADR-090 — Consolidated Figma audit script, mandatory before ending any session that mutates the file

> **Date:** 2026-07-23
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** `scripts/figma/audit-figma-file.js`, `.claude/instructions/figma-components.md` §0bis and §26,
> `.claude/rules/figma-library-governance.md` (existing §22 audit)

## Context

A single verification request on 2026-07-23 ("verify the mono pilot rendering") uncovered five
regression classes that had been shipping silently for weeks, none caught by the existing §22
audit or `findOverflows()`: ~1600 color bindings pointed at an orphaned variable collection,
hardcoded padding/radius drifted from code on `Button`'s 20 variants, a broken `lineHeight` unit
on all 15 Text Styles (PIXELS instead of PERCENT — invisible on single-line text, only visible
once text wraps), cropped focus rings, and invisible tag text. All five rendered as visually
correct in a screenshot — none were catchable by eye or by the checks that existed at the time.

The existing §22 audit (figma-library-governance.md) already mandated an audit at several
triggers (new page, shared-component change, explicit user request, weekly scheduled routine —
ADR-079), but left a gap: no trigger caught drift introduced *during* an ordinary editing
session before that session ended. Five scattered prose checklists (one per bug class) were also
proving to get skipped under time pressure — a script does not get skipped the same way a
checklist item does.

## Decision

1. `scripts/figma/audit-figma-file.js` consolidates seven checks into one canonical, versioned
   script (paste-and-run in `use_figma`, mirroring the existing plugin-script convention — not a
   Node/CI script, Figma has no first-party hook to run one on save): orphaned variable bindings,
   unbound component layout properties, broken Text Style `lineHeight` units, `clipsContent`
   cascading over effects/outside-strokes, parent/child bounding-box overflows, stale text
   references after a rename (`KNOWN_RENAMES`), and broken internal hyperlinks.
2. New mandatory trigger (§0bis of `figma-components.md`, additive to the existing §22 triggers):
   any session that calls `use_figma` with a mutation must run this script against every page it
   touched **before the session ends** — not deferred to "when the whole file is declared done."
3. A non-empty result in `orphanedVariables`, `unboundComponentProps`, `brokenLineHeights`,
   `staleNameReferences`, or `brokenLinks` is a blocking regression, fixed in the same session.
   `clippedEffects`/`overflows` are flagged for visual verification (screenshot), not automatic
   failures — some are legitimate decorative overflow.

## Rationale

The 2026-07-23 incident's common thread: every one of the five bugs was invisible in a normal
screenshot review, and the existing audit triggers all fired *after* the fact (new page created,
shared component changed) rather than catching drift introduced mid-session on pages already
past those trigger points. Ending every mutating session with a script run — rather than trusting
"it looks right" — is the only check in this system's history that actually caught all five.
Consolidating five scattered snippets into one file also means future incident-driven checks
accumulate in one place instead of living only in agent memory across sessions.

## Rejected alternatives

| Alternative | Reason for rejection |
|---|---|
| Keep five separate prose checklist items, one per incident | Already the status quo that let this incident ship silently for weeks — checklists get skipped under time pressure, a script call does not |
| Only re-run the existing weekly scheduled routine (ADR-079) more often | Weekly-or-more-often still leaves same-session drift undetected until the next scheduled run; this decision closes the *in-session* gap, which ADR-079 was never scoped to cover |
| Treat this as an application of the existing §22 audit rather than a new rule | §22's triggers (new page / shared-component change / explicit request / weekly) do not include "before ending a mutating session" — this is a genuinely new, stricter trigger, not a restatement |

## Consequences

- `.claude/instructions/figma-components.md` gained §0bis (the mandatory-trigger rule) and §26
  (the five 2026-07-23 incident writeups + the post-audit checklist each check encodes).
- `scripts/figma/audit-figma-file.js` is the single source of truth for these seven checks going
  forward — a new incident-driven check is added there, not as a sixth scattered snippet.
- Phase 0bis of the Figma redesign (page rename/reorganization, 2026-07-24) was audited clean
  against this script on all 22 pages before being declared complete — first real use of the new
  trigger.
- `KNOWN_RENAMES` requires upkeep: an entry is added the moment something canonically named is
  renamed, and retired once `findStaleNameReferences` confirms every reference updated (see the
  retired `INTRO` → `GETTING STARTED` entry, swept clean the same day).
