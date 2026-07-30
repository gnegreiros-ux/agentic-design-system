# ADR-081 — Figma Community File license: CC BY 4.0

> **Date:** 2026-07-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** `LICENSE` (repo root), `.claude/rules/figma-library-governance.md`,
> ADR-080 (Community File content triage), GitHub Projects — Figma-domain
> "Community File — Décider la licence" ticket (Priority P1) <!-- lang-audit-ignore: literal ticket title (French, board convention) -->

## Context

The repository's `LICENSE` file (MIT) covers the **code** — Web Components,
token JSON, site build, etc. It does not properly cover the **Figma file**
(`uXgPVB6cMLwAPqSwoa0dGq`) that the still-Backlog "publish a Community File"
chantier intends to publish. Figma's Community publishing flow requires the
publisher to declare a license for the file itself, independent of any
software license in the linked repository. This was the one remaining P1 item
blocking that chantier — the decision could only be made by the Design System
Lead, not an agent.

## Decision

> The Figma Community File will be published under **CC BY 4.0** (Creative
> Commons Attribution 4.0 International) — chosen for consistency with the
> code's MIT license: both are permissive, both only require attribution, and
> neither restricts commercial reuse or modification.

## Rejected alternatives

- **CC0 (public domain, no attribution required).** Rejected: less consistent
  with MIT, which does require preserving the copyright notice — CC0 would be
  a strictly looser stance for the design assets than the project already
  takes for the code.
- **A restrictive/proprietary Figma Community license.** Rejected: would put
  the design assets at odds with the project's existing permissive posture on
  the code, for no stated benefit.

## Consequences

- No action needed in Figma today — the library is still early-stage (most
  components and every pattern remain to be built) and the Community File
  publish itself has no scheduled date. This ADR fixes the license *decision*
  ahead of that eventual publish, per ADR-080's pattern of resolving
  publish-blocking questions before they're urgent.
- When the Community File publish chantier is actually executed: set the
  file's Community license to CC BY 4.0 in Figma's publish flow, and state it
  in the file's Community description (see ADR-080's Rule 2 pre-publication
  audit and the not-yet-written cover/description/tags backlog item — both
  still apply independently of this decision).
- The GitHub Projects "Community File — Décider la licence" item (P1) is resolved and can move to Terminé (the board's Status field is French: Backlog/En cours/Terminé/etc.). <!-- lang-audit-ignore: literal ticket title + literal Status field value, both French by board convention -->
