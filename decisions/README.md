# decisions/

> Architecture Decision Records (ADRs) registry for the design system.
> **Type:** instruction
> **Logical path:** decisions/README.md
> **Read before:** AGENTS.md, DESIGN.md
> **Relations:** .claude/instructions/session-spec.md, tokens/semantic.json, guidelines/components/

---

## Why this folder exists

A design system accumulates invisible decisions: why this token is named this way,
why this variant was rejected, why this governance rule exists.
Without this registry, agents repeat past mistakes and teams re-debate
decisions that were already settled.

> "The design system has become a dataset, not a deliverable."
> — The Design System Guide, 2026

---

## ADR format

```markdown
# ADR-[NNN] — [Short title]

> **Date:** YYYY-MM-DD
> **Status:** [proposed | active | superseded by ADR-NNN | deprecated]
> **Decision-makers:** [names or roles]

## Context

[What problem or need triggered this decision?]

## Decision

[What decision was made, in one direct sentence.]

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| [option A]  | [why not]  |

## Consequences

[What does this decision concretely mean for agents, developers, designers?]

## Incidents or triggers

[If this decision was triggered by a real incident, note it here.]
```

> Note: this template applies to every ADR from ADR-071 onward (English-only, see
> ADR-071). ADR-001 through ADR-070 predate it and still carry the original French
> field/section labels (`Date :`, `Statut :`, `Décideurs :`, `Contexte`, `Décision`, <!-- lang-audit-ignore: quoting literal field-label strings -->
> etc.) in their French section — see "Translation strategy" below.

---

## ADR index

| ADR | Title | Date | Status |
|-----|-------|------|--------|
| [ADR-001](ADR-001-trois-niveaux-tokens.md) | Three-level token architecture | 2026-05-28 | ✅ Active |
| [ADR-002](ADR-002-lit-web-components.md) | Choosing Lit for Web Components | 2026-05-28 | ✅ Active |
| [ADR-003](ADR-003-style-dictionary.md) | Choosing Style Dictionary for token compilation | 2026-05-28 | ✅ Active |
| [ADR-004](ADR-004-gouvernance-humaine.md) | Human governance: the human always has the final word | 2026-05-28 | ✅ Active |
| [ADR-005](ADR-005-variante-critical-vs-danger.md) | Replacing the `danger` variant with `critical` | 2026-05-28 | ✅ Active |
| [ADR-006](ADR-006-chromatic-tests-visuels.md) | Choosing Chromatic for visual regression testing | 2026-05-28 | ✅ Active |
| [ADR-007](ADR-007-axe-core-accessibilite.md) | Choosing axe-core for accessibility testing | 2026-05-28 | ✅ Active |
| [ADR-008](ADR-008-radix-colors.md) | Choosing Radix UI Colors for the primitive palette | 2026-05-28 | ✅ Active |
| [ADR-009](ADR-009-storybook.md) | Choosing Storybook for component documentation | 2026-05-28 | ✅ Active |
| [ADR-010](ADR-010-playwright.md) | Choosing Playwright for E2E and accessibility testing | 2026-05-28 | ✅ Active |
| [ADR-011](ADR-011-tokens-studio.md) | Choosing Tokens Studio for Figma ↔ JSON sync | 2026-05-28 | ✅ Active |
| [ADR-012](ADR-012-audit-tokens-script.md) | Drift detection via audit script (audit-tokens.js) | 2026-05-28 | ✅ Active |
| [ADR-013](ADR-013-design-md-contrat-portable.md) | DESIGN.md as a portable contract versioned with the code | 2026-05-28 | ✅ Active |
| [ADR-014](ADR-014-conventional-commits.md) | Choosing Conventional Commits for commit messages | 2026-05-28 | ✅ Active |
| [ADR-015](ADR-015-hook-rappel-adr.md) | Automatic ADR reminder hook on critical modifications | 2026-05-28 | ✅ Active |
| [ADR-016](ADR-016-journal-construction.md) | Automatic kit build log | 2026-05-28 | ⚠️ Superseded by ADR-069 |
| [ADR-017](ADR-017-correction-contraste-text-disabled.md) | Disabled-text contrast value fix (4.54:1) | 2026-05-28 | ✅ Active |
| [ADR-018](ADR-018-migration-references-primitives-radix.md) | Migrating primitive references to the Radix convention | 2026-05-28 | ✅ Active |
| [ADR-019](ADR-019-resolution-dynamique-tokens-build.md) | Dynamic token resolution at build time (Style Dictionary) | 2026-05-29 | ✅ Active |
| [ADR-020](ADR-020-grille-4px.md) | 4px grid as the systemic dimensional scale | 2026-05-29 | ✅ Active |
| [ADR-021](ADR-021-atkinson-hyperlegible.md) | Atkinson Hyperlegible as the primary font | 2026-05-29 | ✅ Active |
| [ADR-022](ADR-022-lucide-icons.md) | Lucide Icons as the icon library | 2026-05-29 | ✅ Active |
| [ADR-023](ADR-023-echelle-typographique-minor-third.md) | Minor Third rem typographic scale + line-height rules | 2026-05-29 | ✅ Active |
| [ADR-024](ADR-024-brand-palette-teal-accent-secondary.md) | Brand palette: primary Teal, Accent pink, Secondary burgundy | 2026-05-29 | ✅ Active |
| [ADR-025](ADR-025-densite-espacement-math-tokens.md) | Spacing density: floor/ceil on the 4px grid via math tokens | 2026-05-29 | ✅ Active |
| [ADR-026](ADR-026-sync-figma-palettes-custom.md) | Figma sync strategy for custom brand palettes | 2026-05-29 | ✅ Active |
| [ADR-027](ADR-027-pipeline-impact-pre-commit.md) | Pre-commit impact pipeline with human approval | 2026-05-30 | ✅ Active |
| [ADR-028](ADR-028-atkinson-hyperlegible-mono.md) | Atkinson Hyperlegible Mono as the tokenized monospace font | 2026-05-30 | ✅ Active |
| [ADR-029](ADR-029-quality-gate-pre-commit.md) | Modular pre-commit quality gate (extensible pipelines) | 2026-05-30 | ✅ Active |
| [ADR-030](ADR-030-style-dictionary-build-multi-platform.md) | Style Dictionary: multi-platform build with custom formats | 2026-05-30 | ✅ Active |
| [ADR-031](ADR-031-agtc-button-implementation.md) | agtc-button: critical confirmation pattern, loading, shared tokens | 2026-05-30 | ✅ Active |
| [ADR-032](ADR-032-storybook-stories-convention.md) | Storybook stories convention for Agentica components | 2026-05-30 | ✅ Active |
| [ADR-033](ADR-033-agtc-input-implementation.md) | Implementing `agtc-input` | 2026-05-31 | ✅ Active |
| [ADR-034](ADR-034-agtc-badge-implementation.md) | Implementing `agtc-badge` | 2026-05-31 | ✅ Active |
| [ADR-035](ADR-035-agtc-card-implementation.md) | Implementing `agtc-card` | 2026-05-31 | ✅ Active |
| [ADR-036](ADR-036-ux-pattern-review-pre-composant.md) | Reference UX pattern review before publishing a component | 2026-05-31 | ✅ Active |
| [ADR-037](ADR-037-agtc-checkbox-implementation.md) | Implementing `agtc-checkbox` | 2026-06-01 | ✅ Active |
| [ADR-038](ADR-038-agtc-radio-implementation.md) | Implementing `agtc-radio` + `agtc-radio-group` | 2026-06-01 | ✅ Active |
| [ADR-039](ADR-039-agtc-toggle-implementation.md) | Implementing `agtc-toggle` | 2026-06-01 | ✅ Active |
| [ADR-040](ADR-040-agtc-table-implementation.md) | Implementing `agtc-table` | 2026-06-03 | ✅ Active |
| [ADR-041](ADR-041-agtc-code-block-implementation.md) | Implementing `agtc-code-block` | 2026-06-03 | ✅ Active |
| [ADR-042](ADR-042-agtc-banner-implementation.md) | Implementing `agtc-banner` | 2026-06-03 | ✅ Active |
| [ADR-043](ADR-043-agtc-link-implementation.md) | Implementing `agtc-link` | 2026-06-04 | ✅ Active |
| [ADR-044](ADR-044-agtc-segmented-implementation.md) | Implementing `agtc-segmented` | 2026-06-04 | ✅ Active |
| [ADR-045](ADR-045-feedback-color-family-completion.md) | Completing the `feedback` semantic color family | 2026-06-05 | ✅ Active |
| [ADR-046](ADR-046-inverse-surfaces-shadows-tokens.md) | Inverse surfaces, shadows, and decorative tokens | 2026-06-05 | ✅ Active |
| [ADR-047](ADR-047-no-visited-nav-rule.md) | System rule: no `:visited` state on navigation | 2026-06-05 | ✅ Active |
| [ADR-048](ADR-048-action-teal-wcag-contrast.md) | Accessible interactive teal: `action.primary` teal.9 → teal.11 (WCAG AA) | 2026-06-05 | ✅ Active |
| [ADR-049](ADR-049-card-shadow-token.md) | Tokenized card resting shadow: `semantic.shadow.card` (ADR-046 follow-up) | 2026-06-05 | ✅ Active |
| [ADR-050](ADR-050-action-teal-contrast-real-surface.md) | Accessible action teal on the real surface: primitive `teal.11` retuned (axe 76→0) | 2026-06-06 | ✅ Active |
| [ADR-051](ADR-051-illustration-style-palette.md) | "Tactile Tech" illustration style + `color.illustration` semantic palette | 2026-06-06 | ✅ Active |
| [ADR-052](ADR-052-dtcg-standard-conformance.md) | W3C DTCG standard conformance (designtokens.org): `$schema` in 3/3 files + site declaration | 2026-06-06 | ✅ Active |
| [ADR-053](ADR-053-mobile-sidebar-drawer.md) | Mobile navigation: sidebar as a sliding drawer | 2026-06-10 | ✅ Active |
| [ADR-054](ADR-054-tables-responsive-wrapper.md) | Responsive tables: `overflow-x:auto` wrapper | 2026-06-10 | ✅ Active |
| [ADR-055](ADR-055-focus-visible-i18n-interactive.md) | Systematic `:focus-visible` + i18n for interactive elements | 2026-06-10 | ✅ Active |
| [ADR-056](ADR-056-agtc-tabs-implementation.md) | Implementing `agtc-tabs` | 2026-06-12 | ✅ Active |
| [ADR-057](ADR-057-deux-contextes-utilisation.md) | Two usage contexts: Product (SaaS) and Marketing (Narrative) | 2026-06-12 | ✅ Active |
| [ADR-058](ADR-058-redesign-site-theme-sombre.md) | Site redesign: dark theme and CSS extension tokens | 2026-06-12 | ✅ Active |
| [ADR-059](ADR-059-semantic-tokens-hierarchy-completion.md) | Closing the three-level hierarchy: 18 intermediate semantic tokens | 2026-06-15 | ✅ Active |
| [ADR-060](ADR-060-agtc-top-nav-implementation.md) | Implementing `agtc-top-nav` — full-height visual tabs, inter-page nav | 2026-06-15 | ✅ Active |
| [ADR-061](ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md) | `agtc-top-nav` v1.1: bilingual support, mobile shadow DOM, site integration | 2026-06-15 | ✅ Active |
| [ADR-062](ADR-062-bundle-unique-wc-dogfooding-phase1.md) | Single `agtc.js` bundle + Web Components dogfooding Phase 1 | 2026-06-15 | ✅ Active |
| [ADR-063](ADR-063-agtc-feature-card.md) | `agtc-feature-card` component: architecture, variants, UX review | 2026-06-25 | ✅ Active |
| [ADR-064](ADR-064-v2-light-mode-implementation.md) | Light mode V2: implementation and dark/light decoupling fix (amends ADR-058) | 2026-06-25 | ✅ Active |
| [ADR-065](ADR-065-dark-mode-tokens-storybook-chromatic.md) | Dual-mode dark mode: `semantic.dark.json` + Style Dictionary + Storybook/Chromatic | 2026-06-29 | ✅ Active |
| [ADR-066](ADR-066-playwright-testing-strategy.md) | Playwright testing strategy: two distinct scopes | 2026-07-02 | ✅ Active |
| [ADR-067](ADR-067-letter-spacing-token-category.md) | New `letterSpacing` token category — `agtc-code-block` debt | 2026-07-08 | ✅ Active |
| [ADR-068](ADR-068-letter-spacing-scale-extension.md) | Extending the `letterSpacing` scale — resolving site `--agtc-tracking-*` debt | 2026-07-08 | ✅ Active |
| [ADR-069](ADR-069-migration-suivi-projet-github-projects.md) | Migrating project tracking to GitHub Projects (replaces ADR-016) | 2026-07-09 | ✅ Active |
| [ADR-070](ADR-070-anglais-langue-par-defaut.md) | English as the repository's default language (community translation) | 2026-07-10 | ✅ Active |
| [ADR-071](ADR-071-english-only-future-content.md) | English as the sole language for all future content (extends ADR-070) | 2026-07-14 | ✅ Active |
| [ADR-072](ADR-072-npm-package-architecture.md) | Package architecture for npm publication: `@agentica/tokens` + `@agentica/components` | 2026-07-15 | ✅ Active |
| [ADR-073](ADR-073-npm-scope-correction.md) | npm scope correction: `@agentica` → `@agentica-ds` (amends ADR-072) | 2026-07-16 | ✅ Active |
| [ADR-074](ADR-074-npm-publish-ci-workflow.md) | Automated npm publishing via `changesets/action` in CI | 2026-07-17 | ✅ Active |
| [ADR-075](ADR-075-english-filenames-retroactive-rename.md) | Retroactive English filenames for translated documents (amends ADR-070) | 2026-07-18 | ✅ Active |
| [ADR-076](ADR-076-branch-protection-solo-maintainer.md) | Branch protection on `main`/`develop` with 0 required approvals (solo maintainer) | 2026-07-20 | ✅ Active |
| [ADR-077](ADR-077-enforce-admins-after-bypass-incident.md) | Enable `enforce_admins` on `main`/`develop` (amends ADR-076, after a bypass incident) | 2026-07-20 | ✅ Active |
| [ADR-078](ADR-078-figma-tokens-studio-write-restriction.md) | Restrict Tokens Studio write access to the `agentica/proposals` branch | 2026-07-20 | ✅ Active |
| [ADR-079](ADR-079-figma-audit-scheduled-routine.md) | Weekly scheduled cloud agent for the Figma §22 full-library audit | 2026-07-21 | ✅ Active |
| [ADR-080](ADR-080-figma-community-file-content-triage.md) | Figma Community File content triage rule: brand identity stays private | 2026-07-21 | ✅ Active |
| [ADR-081](ADR-081-figma-community-file-license.md) | Figma Community File license: CC BY 4.0 | 2026-07-21 | ✅ Active |
| [ADR-082](ADR-082-figma-brand-file-separation.md) | Brand/logo separated into a dedicated Figma library file (amends ADR-080) | 2026-07-21 | ✅ Active |
| [ADR-083](ADR-083-agtc-image-implementation.md) | `agtc-image` implementation | 2026-07-21 | ✅ Active |
| [ADR-084](ADR-084-illustrations-migrated-to-agtc-image-no-wrapper.md) | Home page illustrations migrated to `agtc-image` directly, no `agtc-illustration` wrapper | 2026-07-21 | ✅ Active |
| [ADR-085](ADR-085-audit-tokens-debt-triage.md) | `audit-tokens.js` debt triage: exclusions, `audit-ignore` escape hatch, 7 promoted tokens | 2026-07-22 | ✅ Active |
| [ADR-086](ADR-086-relationships-registry-and-contract-validation.md) | Relationships registry and contract validation scripts (concepts borrowed from DSDS) | 2026-07-22 | ✅ Active |
| [ADR-087](ADR-087-top-nav-mix-architecture-confirmed.md) | `agtc-top-nav` confirmed as "mix" architecture, dead mobile-menu code removed | 2026-07-22 | ✅ Active |
| [ADR-088](ADR-088-agtc-logo-colors-retroactive.md) | Agentica logo colors formalized (retroactive) | 2026-07-22 | ✅ Active |
| [ADR-089](ADR-089-audit-tokens-debt-zero-and-dark-mode-primitives.md) | `audit-tokens.js` debt reaches zero critical; real Radix dark primitives added | 2026-07-22 | ✅ Active |
| [ADR-090](ADR-090-mandatory-figma-audit-script-per-session.md) | Consolidated Figma audit script, mandatory before ending any session that mutates the file | 2026-07-23 | ✅ Active |
| [ADR-091](ADR-091-icon-per-variant-stroke-width-and-color-tokens.md) | Per-variant stroke-width and default-color tokens for `agtc-icon` — stroke-width no longer hardcoded | 2026-07-30 | ✅ Active |

---

## Translation strategy for this folder (ADR-071, supersedes the ADR-070 phase-5 approach)

> As of 2026-07-14, ADR-001 through ADR-070 are being retroactively given a **full**
> English translation, superseding the earlier lightweight-summary approach: both the
> English and French versions live in the same source file, and the site toggles between
> them with the same `lang-fr`/`lang-en` mechanism used everywhere else on the site
> (see ADR-071). This translation is executed in batches — until an individual ADR's turn
> comes up, it may still carry only the short English summary from the earlier approach;
> that is expected transitional state, not a defect. ADR-071 and every ADR after it are
> **English-only** — no French version is produced for new decisions going forward.

---

## Rules for this registry

- An ADR is never deleted — it is marked `superseded` or `deprecated`
- An ADR is immutable once `active` — any modification = a new ADR
- Agents read this folder to understand the *why*, not just the *what*
- Every major TCR (Token Change Request) must reference or create an ADR
