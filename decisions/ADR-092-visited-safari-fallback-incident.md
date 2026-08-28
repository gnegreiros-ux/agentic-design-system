# ADR-092 — Safari `:visited` hex-fallback incident, consolidated record (amends ADR-047, ADR-059, ADR-060)

> **Date:** 2026-08-28
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-092-visited-safari-fallback-incident.md
> **Read before:** .claude/rules/no-visited-nav.md
> **Relations:** ADR-047 (no-visited-nav rule — amended), ADR-059 (tokens audit that caused the
> regression — amended), ADR-060 (top-nav implementation, corrected timeline — amended),
> `.claude/rules/no-visited-nav.md`, `site/build.js`

---

## Context

ADR-047 (2026-06-05) established a system-wide rule: navigation elements never carry a
distinct `:visited` color, realigned to the unvisited state via a semantic token.

WebKit blocks `var()` resolution inside `:visited` rules for security reasons — a
defense against history-sniffing attacks that infer a user's browsing history from
computed styles. `var()` is accepted as syntax but silently ignored at apply time, so a
`:visited` rule written as `color: var(--agtc-semantic-color-text-secondary)` alone never
resolves in Safari: the link keeps the browser's default `:visited` color instead of the
token value, defeating ADR-047's rule on that one browser.

This ADR consolidates the incident record that was previously scattered across three
separate documents — ADR-047's original text (which did not yet know about the Safari
constraint), a post-incident note added to ADR-059, and a corrected timeline in ADR-060
(PR #64, 2026-08-24) — into a single dedicated record, and is the canonical reference
going forward.

## What happened

Four commits, spanning three weeks:

| Date | Commit | Event |
|------|--------|-------|
| 2026-05-30 | `b5850cf` | `:visited` neutralization added as `var()` alone, no fallback — passes on Chrome/Firefox, silently fails on Safari |
| 2026-06-06 | `fb7b5a5` | First fix, bundled into a broader dark-section/visited-state/active-nav pass — adds the literal hex value before the `var()` declaration as a Safari fallback |
| 2026-06-15 | `6b42f21` | Regression: the semantic-tokens-hierarchy audit (ADR-059) scans `site/build.js` for hardcoded values, flags the `color:#hex;color:var(...)` pair in the `:visited` rules as an obsolete IE11-style fallback, and strips the hex line |
| 2026-06-15 | `ce994bf` | Same-day fix: hex fallback restored, and the exception documented durably in `.claude/rules/no-visited-nav.md` and ADR-059, so a future audit doesn't repeat the same misclassification |

The regression and its fix landed the same day — the audit tooling had no way to
distinguish "hardcoded value that should route through a token" from "browser-mandated
literal that must stay paired with the token," because both look identical at the
syntax level (`color:#hex;color:var(...)`).

## Decision

1. The hex-then-`var()` pairing in `:visited` rules is a permanent, required pattern —
   not a stopgap and not IE11-era cruft — for as long as WebKit blocks `var()`
   resolution inside `:visited`. It is documented as an explicit exception in
   `.claude/rules/no-visited-nav.md` (§Safari exception), which any future automated
   token audit must treat as allow-listed rather than flag as a violation.
2. The literal hex value must always be the resolved value of the paired semantic
   token, kept in sync manually — this is not a hardcoded value in the sense of
   `tokens-system.md`, since it carries no independent design decision; it is a
   browser-compatibility mirror of the token.
3. ADR-047, ADR-059, and ADR-060 are not rewritten to remove the incident material they
   already carry (their post-incident notes and corrected timeline stay as the
   in-context record at each decision point) — this ADR is the single place a reader
   goes for the full incident end-to-end, cross-linked from the other three.

### Reference implementation

```css
/* Hex value resolved BEFORE the var() — Safari applies the hex, Chrome/Firefox apply
   var(). Declare before :hover/.active rules per ADR-047 (later selector must win at
   equal specificity). */
.top-nav a:visited { color: #646464; color: var(--agtc-semantic-color-text-secondary); }

/* Dark theme: same pattern with the resolved dark value */
[data-theme="dark"] .top-nav a:visited { color: #a4abb8; color: var(--agtc-semantic-color-text-secondary); }
```

Applied identically across every navigation surface in scope for ADR-047 (`top-nav`,
`sidebar`, `toc`, `footer-links`, `audit-footer-link`, icon buttons).

## Accessibility (WCAG 2.2)

No regression versus ADR-047's original assessment: the hex fallback resolves to the
exact same color the token already resolves to elsewhere, so contrast ratios validated
under ADR-047 are unchanged. The fix restores parity across browsers rather than
introducing a new visual state — before the fix, Safari users saw the browser's default
purple `:visited` tint on navigation, an inconsistency the rest of ADR-047 was written
to eliminate.

## Rejected alternatives

- **Drop the Safari fallback, accept the browser-default `:visited` tint on WebKit only.**
  Rejected: reintroduces exactly the cross-browser inconsistency ADR-047 exists to
  remove, only silently and on one browser family.
- **Teach the tokens-audit script to special-case `:visited` blocks structurally
  (parse selector context, not just the value pattern) instead of relying on a
  documented allow-list.** Deferred, not rejected outright: a structural fix is more
  robust but a larger change to `scripts/audit-tokens.js`'s matching logic; the
  allow-list documented in `no-visited-nav.md` closes the immediate gap at near-zero
  cost and is tracked as a candidate follow-up rather than blocking this record.
- **Rewrite ADR-047 in place to add the Safari clause, instead of a new ADR.**
  Rejected: ADR-047 predates the discovery and its original text is part of the
  historical record of what was decided and known at the time (2026-06-05, before the
  regression); folding the incident into it retroactively would obscure that the
  constraint was learned the hard way three weeks later, not designed in from the start.

## Consequences

- `.claude/rules/no-visited-nav.md` remains the operational source of truth for the
  Safari exception pattern (§Safari exception) — this ADR does not change that file, it
  documents why the pattern exists.
- Any future token-consistency audit (manual or scripted) must check
  `no-visited-nav.md`'s exception list before flagging a `:visited` hex-then-`var()`
  pair as a violation, to avoid repeating the 2026-06-15 regression.
- No token added or modified — a governance and incident-record decision, consolidating
  material already present in ADR-047, ADR-059, and ADR-060.
