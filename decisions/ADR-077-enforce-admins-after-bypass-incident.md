# ADR-077 — Enable `enforce_admins` on `main`/`develop` (amends ADR-076)

> **Date:** 2026-07-20
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** ADR-076 (branch protection, solo maintainer — amended), `.claude/rules/git-workflow.md`, PR #35

## Context

ADR-076, merged earlier the same session, set `enforce_admins: false` on both `main`
and `develop` — reasoned as an emergency safety valve for a solo maintainer with no
second reviewer to fall back on.

Within the same session, that valve was used unintentionally: a documentation commit
(`c34df57`) was pushed directly to `develop` with `git push`, and GitHub reported
`Bypassed rule violations for refs/heads/develop` — the PR-required rule was
silently skipped because the admin bypass was available by default, not invoked
deliberately. Investigating the incident also surfaced a second, independent gap:
none of the repository's `push`-triggered CI workflows (`lang-audit` included) were
scoped to `develop` at all (`branches: [main]` only), so even a non-bypassed direct
push to `develop` would have shipped with zero CI validation.

## Decision

1. `enforce_admins` is set to `true` on both `main` and `develop`. Direct pushes —
   including by the repository admin — are rejected outright; every change,
   admin or not, goes through a PR with `lang-audit` green.
2. `lang-audit.yml`'s `push` trigger is extended from `branches: [main]` to
   `branches: [main, develop]` (PR #35), so a merge into `develop` is validated the
   same way a merge into `main` already was, closing the CI gap independently of (1).

This reverses the `enforce_admins: false` clause of ADR-076; every other clause of
ADR-076 (0 required approvals, `lang-audit` as the sole required check, the trigger
for moving to 1/2 approvals once a second collaborator exists) stands unchanged.

## Rationale

The premise behind ADR-076's `enforce_admins: false` — "an unconditional lock would
have no safety valve" — assumed the bypass would be a deliberate, occasional
emergency action. In practice, for a solo maintainer using ordinary `git push`, the
bypass is silent and the default path, not an emergency one: nothing distinguishes a
routine push from a genuine emergency, so the valve fires on routine work instead of
being reserved for emergencies. Removing it costs nothing operationally, since 0
required approvals already means merging a self-authored PR is a single-click action
— the discipline of branch → PR → merge is the only thing enforced, not review by a
second person.

## Rejected alternatives

- **Keep `enforce_admins: false`, rely on discipline alone (always open a PR, never
  `git push` to `main`/`develop` directly).** Rejected: this is exactly what failed
  minutes earlier in this same session — discipline is not a substitute for a
  technical control when the tool (`git push`) makes the unsafe path the shortest one.
- **Leave `lang-audit` scoped to `main` only, since `enforce_admins: true` alone
  prevents direct pushes to `develop` going forward.** Rejected: `enforce_admins`
  only stops *this* repository's collaborators from bypassing branch protection —
  it does not, by itself, make `lang-audit` run on a `develop` push. The two gaps
  (bypassable rule, and rule not actually checking anything on `develop`) are
  independent and both needed fixing.

## Consequences

- Any future direct-push attempt to `main` or `develop`, admin or not, is rejected by
  GitHub; the only path in is `feature/`/`fix/` branch → PR → green `lang-audit` →
  merge.
- If GitHub Actions or the repository itself is ever in a state where no PR can be
  merged (e.g. lang-audit misconfigured and permanently red), recovering requires
  temporarily disabling branch protection via repository settings before a fix can
  land — an explicit, visible action, not a silent per-push bypass.
- `.claude/rules/git-workflow.md` is updated alongside this ADR to drop the "admin can
  bypass" language and describe the `develop` CI trigger.
