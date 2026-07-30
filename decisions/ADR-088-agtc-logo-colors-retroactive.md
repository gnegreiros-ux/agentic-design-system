# ADR-088 — Agentica logo colors formalized (retroactive)

> **Date:** 2026-07-22
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-088-agtc-logo-colors-retroactive.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-024-brand-palette-teal-accent-secondary.md
> **Relations:** tokens/primitives.json (`primitive.color.brand.black`/`.gray`), tokens/semantic.json (`semantic.color.brand.logo-black`/`logo-gray`), ADR-024-brand-palette-teal-accent-secondary.md, GitHub Projects — Gouvernance-domain "logo-identity decision" ticket (resolved by this ADR)

---

## Context

`scripts/validate-contracts.js` (ADR-086) flags `semantic.color.brand.logo-black` and
`semantic.color.brand.logo-gray` as citing `"decision": "logo-identity"` — a value that doesn't
match the `ADR-XXX` shape every other `decision` field in the token system uses.

Investigation found this wasn't a stand-in for an existing ADR: **no ADR ever formally
established the logo colors.** ADR-024 defines the brand *palette* (Teal/Rose/Bordeaux) but does
not mention the logo's black (`#000000`) / gray (`#6B7280`) values at all. Per
`.claude/skills/pipelines/adr-triggers.md`, adding a new color is one of the changes that always
requires an ADR ("New color palette" row) — this one was added without one.

`tokens/primitives.json`'s own `primitive.color.brand._readme` already states the governance
intent informally: *"Agentica logo colors — fixed brand values, do not modify without Design
approval. Only these brand tokens are allowed to reference `#000000` and `#6B7280` directly."*
This ADR makes that existing, already-enforced intent official instead of introducing a new rule.

## Decision

1. **`primitive.color.brand.black` (`#000000`) and `primitive.color.brand.gray` (`#6B7280`) are
   the two officially reserved colors of the Agentica wordmark/logo** — the only primitives
   allowed to hold a literal `#000000`/`#6B7280` value, per the existing `_readme` note.
2. **`semantic.color.brand.logo-black` / `logo-gray`** are the semantic layer over them, reserved
   for logo/wordmark/brand-icon use only (`doNotUse`: regular text, page background, any generic
   UI component — already encoded in `$extensions.doNotUse`, unchanged by this ADR).
3. **`tokens/semantic.json`'s `decision` field for both tokens is updated from `"logo-identity"`
   to `"ADR-088"`**, resolving the `validate-contracts.js` warning.
4. Any future change to these two specific values (not new logo-adjacent tokens, the values
   themselves) requires Principal Designer approval, consistent with the `_readme`'s existing
   "do not modify without Design approval" note — this ADR does not loosen that.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Leave `"decision": "logo-identity"` as a documented, permanent exception to the ADR-shaped convention | Would mean this project's own trigger matrix ("new color → ADR required") doesn't actually apply to every color — better to close the real gap than carve out an exception for it |
| Fold this into ADR-024 (amend the brand palette ADR) | ADR-024 is `✅ Active` and, per `decisions/README.md`'s own rule, "immutable once active — any modification = a new ADR"; amending it would violate that rule |

## Consequences

- `tokens/semantic.json`: `decision` field on both tokens now reads `"ADR-088"`.
- `npm run validate:contracts` (once merged with PR #46/ADR-086): the `logo-identity` warning
  disappears — every `decision` field is now ADR-shaped and resolves to a real file.
- No value, alias, or `$extensions.doNotUse` change — this ADR documents an existing, already
  correctly-enforced constraint, it does not alter it.
- GitHub Projects: the linked ticket moved to Terminé. <!-- lang-audit-ignore: literal Status field value, French by board convention -->
