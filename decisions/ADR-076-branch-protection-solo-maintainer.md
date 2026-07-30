# ADR-076 — Branch protection on `main`/`develop` with 0 required approvals (solo maintainer)

> **Date:** 2026-07-20
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** `.claude/rules/git-workflow.md` (protection rules section, amended), ADR-069 (GitHub Projects governance)

## Context

`.claude/rules/git-workflow.md` has documented a branch protection policy since this
repository's early sessions — `main`: PR + 2 approvals + green CI; `develop`: PR + 1
approval + green CI — but neither branch actually had GitHub branch protection
configured until this session. All work to date shipped `feature/` → `main` directly.

`develop` was created at the end of the previous session (2026-07-20) as the first step
toward the documented convention, but left unprotected. When configuring protection
this session, two gaps between the documented policy and the actual repository state
surfaced:

1. **Solo maintainer.** `gnegreiros-ux` is the repository's only collaborator. GitHub
   does not allow a user to approve their own pull request. Requiring 1 or 2 approvals
   as literally written would make every PR unmergeable without an admin bypass on
   every single merge — the required-approval count is designed for a multi-contributor
   team, which this repository does not yet have.
2. **CI checks don't all run on `pull_request`.** Of the active workflows, only
   `lang-audit.yml` triggers on `pull_request` (declared explicitly:
   `on: [push: {branches: [main]}, pull_request]`). `playwright.yml`,
   `deploy-site.yml`, and `playwright-reminder.yml` trigger only on `push` to `main`
   (post-merge) — `chromatic.yml` is currently disabled (monthly snapshot quota
   reached, see ADR-066). Requiring a status check that never runs on a PR event
   would deadlock every merge (GitHub waits indefinitely for a check that is never
   reported).

## Decision

Branch protection is enabled on `main` and `develop` with:
- **Required approving reviews: 0.** A PR is still mandatory (no direct push), but no
  reviewer count is enforced, since there is currently no second collaborator to
  provide one.
- **Required status check: `lang-audit` only** (`strict: true` — branch must be
  up to date). This is the only workflow that actually reports a check on the
  `pull_request` event today.
- **Force-push and branch deletion: blocked** on both branches.
- **Conversation resolution: required** before merging.
- **`enforce_admins: false`** — the sole admin (also the sole maintainer) can bypass
  in an emergency; with no second reviewer available, an unconditional lock would have
  no safety valve.

This intentionally implements a **weaker** rule than the approval counts written in
`git-workflow.md` — that file is amended alongside this ADR to describe current state
plus the trigger condition for tightening it.

## Rationale

Protection today is scoped to what a solo maintainer can actually operate: it removes
the accidental-direct-push failure mode entirely (the concrete gap the previous
session's handoff flagged as an open decision) and gates merges on the one CI signal
that is real and enforceable right now, without inventing review theater that would
either block all work or require constant admin bypassing — both worse than no rule.

## Rejected alternatives

- **1–2 required approvals, relying on admin bypass to merge solo.** Rejected: the
  bypass would be used on every single merge, making the "required" review purely
  symbolic while adding friction. Revisit once a second collaborator exists.
- **Require `Playwright (chromium/firefox/webkit)` / `build-and-deploy` as blocking
  checks now.** Rejected: these workflows do not run on `pull_request` today; adding
  them as required checks would deadlock all PRs. Doing this correctly requires first
  deciding whether to add a `pull_request` trigger to `playwright.yml` — a distinct,
  deliberate CI/CD change (cost: ~3x more Playwright runs per PR iteration cycle) that
  also shifts visual review from the current post-merge, issue-based model
  (`playwright-reminder.yml`) to a pre-merge gate. Left as a separate future decision,
  not bundled into this one.

## Consequences

- Every future change to `main` or `develop` must go through a PR; direct `git push`
  to either branch will be rejected by GitHub (unless the admin bypass is invoked).
- `lang-audit` failing on a PR blocks merge until fixed — matches the CI-gate intent
  already documented in `How-to-devs.md` / `How-to-without-agents.md`'s 9-step quality
  gate.
- **Trigger to revisit this ADR:** the moment a second collaborator is added to the
  repository, `required_approving_review_count` should move to 1 (`develop`) / 2
  (`main`) per the original `git-workflow.md` intent, since self-approval is no longer
  the blocking constraint.
- Visual regressions (Playwright) remain caught only after merge, via the existing
  `playwright-reminder.yml` issue flow (see the closure of issue #9 this same session
  for a concrete instance of that flow).
