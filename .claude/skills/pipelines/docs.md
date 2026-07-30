# Pipeline: docs

> Exhaustive checklist of documentation updates required after a change.
> This is the canonical, single-source-of-truth list of every documentation
> surface in this repository — referenced by `.claude/skills/document/SKILL.md`
> (the `/document` command) as well as by the full quality gate.
> **Status:** ✅ Active
> **Trigger:** every change (no exception)

---

## Documentation → trigger matrix

| Documentation | Trigger |
|--------------|------------|
| `guidelines/foundations/color.md` | Change in color tokens |
| `guidelines/foundations/typography.md` | Font or scale change |
| `guidelines/foundations/spacing.md` | Spacing or density change |
| `guidelines/components/[component].md` | Change to a component |
| `guidelines/overview.md` | New component added |
| `decisions/ADR-0XX.md` | Any architectural decision (see adr-triggers.md) |
| `decisions/README.md` | Any new ADR |
| `DESIGN.md` | Identity, governance, or principle change |
| `README.md` | Project structure change |
| `AGENTS.md` | New rule for agents |
| `.claude/rules/` | New convention or rule change |
| `.claude/instructions/` | Orchestration methodology or agent-facing process change |
| `How-to-devs.md` / `How-to-designers.md` | Workflow change for the team maintaining the system |
| `How-to-without-agents.md` + `scripts/continuity/*.sh` | Change to a tool/process that has a documented manual fallback |
| Website (`site/build.js`) | Any visible change on the site |
| **Site changelog** (`site/build.js` → `buildChangelog()`) | Any user-visible feature, fix, or decision shipped — one bilingual bullet per notable change, added to the current unreleased version block |
| **GitHub Projects (Backlog/board)** | Any chantier completed, started, or newly identified — status/domain/date fields, per ADR-069. Never tracked in a local versioned file instead |
| `packages/tokens/README.md` / `packages/components/README.md` | Change to a published npm package's API, exports, or usage |
| `starter-kit/README.md` | Change to the consumer-facing quickstart flow it demonstrates |
| `components/agtc-*.stories.js` (`parameters.docs.description`) | Component behavior or UX pattern change |
| `components/agtc-*.js` header comment (the "WHY" block) | A non-obvious constraint, workaround, or applied UX pattern changes |

---

## Documentation quality rules

### Project tracking (GitHub Projects, ADR-069)
- ✅ Effort reflected in GitHub Projects (status, domain, date)
- ✅ A ticket that finished a "chantier" spanning several sessions gets a single
  closing note, not one duplicate ticket per session
- ❌ Do not recreate a local log/journal file for this purpose

### Site changelog
- ✅ One bilingual bullet per notable user-visible change, added to the current
  `Unreleased` version block in `buildChangelog()` — not a new version block
  unless a human explicitly decides to cut a release
- ✅ Grouped under an existing section title when one already fits (e.g.
  "Internationalization"), otherwise a new section for the chantier
- ❌ Never invent a version number or release date

### FR/EN bilingual parity
- ✅ Any content added in French → English version required in `<span class="lang-en">`
- ✅ Any content added in English → French version required in `<span class="lang-fr">`
- ❌ Never visible text in only one language on the site

### Component guidelines
- ✅ `guidelines/components/[component].md` updated when behavior or tokens change
- ✅ Allowed variants exactly mirror `tokens/component.json`
- ❌ Never a variant documented but absent from the token

### Decisions
- ✅ `decisions/README.md` → line added for every new ADR
- ✅ The ADR references the files it impacts in its `Relations:`
- ✅ Rejected alternatives are documented with their rationale

---

## Partial report (example)

```
### 5. Documentation
- [x] guidelines/foundations/typography.md — updated (Mono section)
- [x] decisions/README.md — ADR-028 indexed
- [x] Bilingual parity verified (lang-fr / lang-en present)
- [ ] Site rebuild: node site/build.js → ✓ 37 files generated
- [x] DESIGN.md — up to date (no change required)
```
