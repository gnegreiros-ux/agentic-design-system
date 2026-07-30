# Rule: git-workflow

> Git conventions for this project. Read before opening a PR or making a commit.
> **Type:** rule
> **Logical path:** .claude/rules/git-workflow.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/development.md, .claude/rules/tokens-system.md

---

## Branch structure

```
main          ← stable production, protected
develop       ← integration, testing
feature/[xx]  ← new feature
fix/[xx]      ← bug fix
token/[xx]    ← token change (approval required)
docs/[xx]     ← documentation only
chore/[xx]    ← maintenance, configuration
```

---

## Commit convention (Conventional Commits)

Format: `[type]([scope]): [short description]`

| Type | Usage |
|------|-------|
| `feat` | New component or feature |
| `fix` | Bug fix |
| `token` | Token change (triggers mandatory review) |
| `docs` | Documentation only |
| `a11y` | Accessibility improvement |
| `style` | Style change with no functional impact |
| `refactor` | Refactor with no behavior change |
| `test` | Adding or modifying tests |
| `chore` | Maintenance, dependencies |
| `ci` | CI/CD configuration |

### Valid examples
```
feat(button): add ghost variant with hover/focus states
fix(input): fix contrast ratio in error state (4.2 → 4.5)
token(semantic): add color.feedback.warning for alerts
docs(button): update the contract with escalation rules
a11y(modal): add focus trap and aria-modal handling
```

---

## PR rules

### PR title
Same format as commits: `[type]([scope]): [description]`

### PR description
```markdown
## Change
[Describe what changes and why]

## Token impact
- [ ] No token modified
- [ ] Primitive tokens modified → list which ones
- [ ] Semantic tokens modified → list which ones
- [ ] Component tokens modified → PRINCIPAL DESIGNER APPROVAL REQUIRED

## Accessibility
- [ ] axe-core: 0 critical violations
- [ ] Focus visibility tested
- [ ] Contrast verified

## Tests
- [ ] Storybook story created/updated
- [ ] Chromatic: captures approved
- [ ] Unit tests pass
```

---

## Protection rules

**Current state (configured 2026-07-20, ADR-076 + ADR-077):** `main` and `develop`
both require a PR — **no direct push, not even by the admin** (`enforce_admins: true`,
ADR-077) — the `lang-audit` status check green (runs on `pull_request` and on `push`
to either `main` or `develop`), and block force-push/branch deletion. **0 approving
reviews required** on both, since `gnegreiros-ux` is currently the repository's sole
collaborator and GitHub cannot self-approve a PR.

**Target state once a second collaborator exists** (the rule this section originally
described, restore verbatim per ADR-076's trigger clause):
- `main`: merge only via PR + 2 approvals + green CI
- `develop`: merge only via PR + 1 approval + green CI

Other CI checks (`Playwright`, `build-and-deploy`) are not yet required checks — they
only trigger on `push` to `main` today, not on `pull_request` (see ADR-076). Making them
blocking pre-merge gates requires first adding a `pull_request` trigger to
`playwright.yml`, a separate decision not yet made.

There is no bypass for an emergency: if branch protection ever blocks a genuinely
urgent fix (e.g. CI itself is broken), the fix is to temporarily disable the rule in
repository settings, explicitly and visibly — not a per-push shortcut (ADR-077, after
an accidental silent bypass during this same session).

- Any PR modifying `tokens/component.json` requires Principal Designer approval

---

## Rule for agents

An agent can:
- ✅ Create a `fix/` or `docs/` branch
- ✅ Make commits on a feature branch
- ✅ Open a PR with a complete description
- ❌ Merge a PR without human approval
- ❌ Push directly to `main` or `develop`
- ❌ Modify `tokens/component.json` without explicit approval
