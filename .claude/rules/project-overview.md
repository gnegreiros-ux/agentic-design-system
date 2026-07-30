# Rule: project-overview

> General context for this project — read first by any agent working in this repository.
> **Type:** rule
> **Logical path:** .claude/rules/project-overview.md
> **Read before:** AGENTS.md, DESIGN.md
> **Relations:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/instructions/codebase-context.md

---

## What this project is

This repository contains an **agentic design system**: a design system built to be
understood and used by both humans and AI agents.

It encodes interface decisions as structured tokens, component contracts, and
machine-readable rules — so agents can correctly apply the decisions defined by
teams, without improvising.

---

## Core principle

> **The human always has the final word.**

Agents observe, analyze, propose. Humans approve, decide, deploy.

---

## What this system is NOT

- ❌ A self-administering autonomous system
- ❌ A system that replaces designers
- ❌ A decision-making system — agents apply human-defined rules
- ❌ A purely technological project — it is first and foremost governance

---

## Key elements

| Element | Role |
|---------|------|
| `DESIGN.md` | Portable brand contract — human + agent readable |
| `AGENTS.md` | Agent router — mandatory first read |
| `tokens/` | Three levels: primitive → semantic → component |
| `.claude/rules/` | Project constraints and decisions |
| `.claude/instructions/` | Orchestration methodology |
| `.claude/skills/` | Reusable executable capabilities |
| `guidelines/` | Component and foundation documentation |

---

## Non-negotiable values

1. **Digital sovereignty** — Data, decisions, and tools stay under organizational control.
2. **Accessibility** — WCAG 2.1 AA minimum. Non-negotiable.
3. **Auditability** — Every decision is traceable, versioned, justified.
4. **Guided self-healing** — Drift is detected automatically, corrected with human approval.

---

## Project management

Task tracking (statuses, backlog, dependencies) lives exclusively in
[GitHub Projects](https://github.com/users/gnegreiros-ux/projects/1) — never in a
versioned file in the repository. Don't recreate a local log/journal file for this
purpose (see [ADR-069](../../decisions/ADR-069-migration-suivi-projet-github-projects.md),
which replaces [ADR-016](../../decisions/ADR-016-journal-construction.md)).

The public changelog (documentation of shipped versions, `site/dist/changelog.html`)
stays in the repository and is separate from project management — it is not covered by
this rule.

### Status discipline

> **Always move a ticket to `En cours` the moment work actually starts on it — never
> jump straight from `Backlog` to `Terminé`.** <!-- lang-audit-ignore: verbatim GitHub Projects Status option values -->

Skipping `En cours` was an observed pattern (0/144 items ever used that status as of
2026-07-22) that hides real-time progress from anyone else looking at the board. Any
agent picking up a GitHub Projects ticket must set its `Status` field to `En cours`
before starting the work, and only move it to `Terminé` once the work is actually done. <!-- lang-audit-ignore: verbatim GitHub Projects Status option values -->
