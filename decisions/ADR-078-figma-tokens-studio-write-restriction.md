# ADR-078 — Restrict Tokens Studio write access to the `agentica/proposals` branch

> **Date:** 2026-07-20 (opened) — 2026-07-21 (closed as Active)
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** ADR-011 (Tokens Studio adoption), ADR-076/ADR-077 (branch protection on `main`/`develop`), `.claude/rules/figma-library-governance.md`, GitHub Projects — Figma-domain branch-security ticket (Priority P1, this session)

## Context

ADR-011 established a one-way sync direction — `tokens/*.json` (repo) → Tokens Studio →
Figma Variables — with Figma treated as read-only for designers and Tokens Studio
explicitly "not in the agent loop." That remains the governing rule for ordinary token
changes.

This ADR addresses a narrower, defense-in-depth gap flagged in the Figma governance
backlog: Tokens Studio's API credentials are account-scoped, not branch- or
project-scoped — a given API key has full read/write access to every org and project
the account belongs to, with no native way to restrict it to "this repo, this branch
only." If Tokens Studio's push-to-GitHub capability is ever enabled (e.g. a
designer-proposed token tweak flowing back from Figma), an unrestricted credential
could write directly to `main`, bypassing the JSON-leads-Figma-follows principle
ADR-011 exists to protect.

## Decision

Any future write path from Tokens Studio into this repository is restricted to a
dedicated branch, `agentica/proposals` (created this session from `main`, pushed to
`origin`), never `main` directly. Three concrete controls, of which two are already
in place:

1. **`main` refuses direct pushes — done.** Branch protection (ADR-076, hardened by
   ADR-077: `enforce_admins: true`) already requires every change to `main` to go
   through a PR with `lang-audit` green. This was configured for an unrelated reason
   (the `develop` bypass incident) but happens to also satisfy this ticket's
   requirement in full — no additional action needed here.
2. **A dedicated service account + scoped PAT for Tokens Studio — done.** A separate
   GitHub account, `agentica-tokens-bot`, was created and added to this repository as
   a collaborator with **Write** permission (not Admin) — confirmed via
   `GET /repos/.../collaborators/agentica-tokens-bot/permission` → `"role": "write"`.
   Its fine-grained PAT could not yet be scoped to a single selected repository (the
   "Only select repositories" option was unavailable on the brand-new account, even
   after email verification) — a **classic PAT** with the `repo` scope was generated
   instead, as an accepted interim substitute (see Rejected alternatives).
3. **Tokens Studio's own sync settings pointed at `main` for reads — done and verified.**
   Configured in the Tokens Studio plugin panel (`Repository: gnegreiros-ux/agentica-design-system`,
   `Branch: main`, `Token storage location: tokens`). A pull was run and captured in a
   HAR trace: 82 requests to `api.github.com`, all `200`/`204`, reading every file under
   `tokens/` (`primitives.json`, `semantic.json`, `semantic.dark.json`, `component.json`,
   `figma.json`, `$metadata.json`) plus `branches` and the `git/trees` listing on `main`.
   No write request (`PUT`/`POST` to `contents`, `git/commits`, `git/refs`) appeared
   anywhere in the trace — consistent with a pull-only test and with ADR-011's
   read-only design. The pull produced no visible change in Figma, which is the
   expected outcome when the repo and Figma are already in sync, not a failure.

## Rationale

Once (2) exists, `main`'s existing protection (1) does the real enforcement work for
free: a service-account PR into `main` can receive genuine human review (unlike the
repo's own commits, which hit the self-approval wall documented in ADR-076) — so no
new GitHub-side configuration is needed beyond what already exists. `agentica/proposals`
gives that credential somewhere to land writes without needing push access to any
protected branch.

## Rejected alternatives

- **Wait until Tokens Studio's push feature is actually turned on before doing
  anything.** Rejected: the ticket explicitly frames this as a prerequisite "before
  any [Figma library] write action," and the branch/protection setup costs nothing to
  do now, ahead of need, versus configuring it under time pressure later.
- **Rely on `main` protection alone, skip the dedicated branch.** Rejected: without a
  designated landing branch, a permissive Tokens Studio credential would still be free
  to push to `develop` or any other unprotected branch, or create arbitrary branches —
  `agentica/proposals` gives the write path a single, auditable destination.
- **Wait for the fine-grained PAT's "Only select repositories" option to unlock before
  issuing any credential.** Rejected: a classic PAT scoped to `repo` grants the same
  practical access today, since `agentica-tokens-bot` is currently a collaborator on
  exactly one repository — no broader blast radius than a correctly scoped fine-grained
  token would have, just less future-proof if the account is ever added to a second
  repository. Migrate to fine-grained once the option becomes available, rather than
  block on it now.

## Consequences

- `agentica/proposals` exists (branch off `main`) as the designated landing branch for
  any future Tokens Studio push.
- `agentica-tokens-bot` (Write, not Admin) is a distinct GitHub identity from
  `gnegreiros-ux` — its future PRs into `main` can receive genuine human review,
  unlike the repository owner's own commits (ADR-076's self-approval constraint).
- The classic PAT (`repo` scope) is broader than strictly necessary and should be
  migrated to a fine-grained, repo-scoped token once `agentica-tokens-bot`'s account
  restrictions lift — tracked as a follow-up, not a blocker, since the practical access
  is already limited to this one repository.
- Tokens Studio reads `tokens/*.json` from `main` successfully (verified via HAR trace,
  2026-07-21) — the read direction of ADR-011 is fully operational end to end. No push
  capability has been exercised or is expected to be, per ADR-011's read-only design;
  `agentica/proposals` and this credential exist as a prepared safety rail should that
  ever change, not because a push is currently planned.
