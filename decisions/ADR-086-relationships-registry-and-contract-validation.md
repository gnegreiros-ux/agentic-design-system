# ADR-086 — Relationships registry and contract validation scripts (concepts borrowed from DSDS)

> **Date:** 2026-07-22
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-086-relationships-registry-and-contract-validation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/project-overview.md
> **Relations:** tokens/component.json, tokens/semantic.json, guidelines/components/, GitHub Projects — Tokens-domain "Registre relationships" ticket and Tests-domain "Validation programmatique des contrats" ticket (both moved to En cours by this ADR's work) <!-- lang-audit-ignore: literal ticket status, French by board convention -->

---

## Context

A comparative analysis of [Design System Documentation Schema (DSDS)](https://designsystemdocspec.org/)
v0.15.2 against this repository's existing Markdown/JSON conventions concluded that a full
migration to the DSDS format was not warranted: DSDS is a pre-1.0 draft with no third-party
tooling or adopters, it has no entity for architectural decision records (the core of this
repo's governance model), and this repo is already DTCG-aligned for token values (ADR-052).

That analysis did surface two concepts worth borrowing on their own terms, without adopting
DSDS's format:

1. **Typed `relationships`** between entities (DSDS: `depends-on`, `composes`, `extends`, …) —
   this repo already encodes relations, but scattered across three places that were never
   linked: token `$extensions["com.agentica.usage"].decision` / `.doNotUse` /
   `$metadata.contract` fields, token `$value` aliases (`{semantic.color.action.primary}`), and
   the free-prose `**Relations:**` header on every `guidelines/` and `.claude/rules/` file.
   There was no way to ask "what depends on this token?" without a repo-wide grep.
2. **Programmatic (deterministic) validation** of the documentation layer, as a complement to
   the qualitative, agent-driven pipelines in `.claude/skills/pipelines/`.

## Decision

1. **`scripts/extract-relationships.js`** walks the existing sources above and writes a single
   generated index (`relationships-report.json`, gitignored, run via `npm run relationships`),
   with edges typed `depends-on`, `excludes`, `governed-by`, `documented-in`, and a looser
   `related` type for the free-prose header case. `excludes` is an Agentica-specific addition
   (e.g. `button.primary` ↔ `button.critical` mutual exclusion) — DSDS has no equivalent.
2. **`scripts/validate-contracts.js`** adds deterministic checks for the governance layer,
   deliberately scoped to NOT duplicate `scripts/audit-tokens.js` (which already checks
   code-layer drift — hardcoded values, orphaned/phantom tokens, primitive→semantic→component
   alias resolution): DTCG shape ($value requires $type), ADR reference integrity
   (`$extensions.decision` → a real file in `decisions/`), contract path integrity
   (`$metadata.contract` → a real guideline file), token/guideline sync (a `component.*`
   reference in a guideline still exists in `tokens/component.json`), and presence of the
   `## UX Patterns Reference` section mandated by `.claude/rules/ux-patterns-sources.md`.
   Wired into `npm test` via `npm run validate:contracts`.
3. **`scripts/lib/contracts.js`** — shared parsing helpers (both scripts need the same token
   tree walk and Relations-header parsing; a single module avoids duplicating that logic).
4. **A minor, related governance addendum**: `.claude/rules/project-overview.md` now requires
   moving a GitHub Projects ticket to `En cours` when work actually starts on it (observed:
   0/144 items had ever used that status — work always jumped straight from `Backlog` to
   `Terminé`). <!-- lang-audit-ignore: literal Status field values, French by board convention -->
   Bundled into this ADR rather than given its own, since it's a one-line process
   rule decided in the same session, not an architectural decision on its own.

### Credits

Both concepts are borrowed from DSDS v0.15.2
(https://designsystemdocspec.org/, https://github.com/somerandomdude/design-system-documentation-schema).
Credited contributors: **PJ Onori** (maintainer), **Afyia Smith** (governance and `docOrigin`
metadata schemas, introduced in v0.12.1), **Suleiman Ali Shakir** (documentation copy-edits).
This repository does not consume or validate against the DSDS schema itself — the scripts above
generate and check our own index over our own Markdown/JSON, applying the same *principles*
DSDS documents, not its format.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Migrate documentation to the DSDS JSON format | Pre-1.0 draft spec, no third-party tooling consumes it, no entity for ADRs (this repo's governance core) — see the prior comparative analysis |
| Validate `tokens/*.json` against DTCG's official JSON Schema via `ajv` | Adds a new runtime dependency for one check; the existing scripts in `scripts/` have zero external dependencies by convention — a manual `$value`/`$type` presence check gets the same practical signal without the dependency |
| Enforce one fixed set of required `##` sections across every `guidelines/components/*.md` | The 17 existing files do not share a single template today (e.g. `tabs.md` has no `## Intent`; `feature-card.md`/`icon.md`/`tabs.md`/`top-nav.md` have no `## Governance`) — enforcing this would invent a rule not actually in force, rather than check one that is. Only `## UX Patterns Reference` is universal and explicitly mandated (`ux-patterns-sources.md`), so only that is checked |
| A separate ADR for the `En cours` status-discipline rule | Too small on its own (one line, no architectural weight) to warrant a dedicated ADR; bundled here since it was decided in the same session |

## Consequences

- `package.json`: `relationships` and `validate:contracts` scripts added; `validate:contracts`
  now runs as part of `npm test`.
- `.gitignore`: `relationships-report.json` added (generated artifact, same convention as
  `audit-report.json`).
- `relationships-report.json` is not committed — regenerate on demand via `npm run relationships`
  before any TCR impact assessment.
- No new runtime dependency added.
- GitHub Projects: both tickets moved to `En cours` (per the new status-discipline rule) when
  this work started, to be moved to `Terminé` once this ADR merges. <!-- lang-audit-ignore: literal Status field values, French by board convention -->
- `scripts/audit-tokens.js` is unaffected — its scope (code-layer drift) and this ADR's scope
  (governance-layer contracts) are deliberately disjoint.
