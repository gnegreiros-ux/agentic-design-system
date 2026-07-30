# How-to — Developers (design system team)

> This guide is for the team that **maintains** the system, not product teams.
> The human always has the final word. Agents propose, you approve.
> **Type:** instruction
> **Logical path:** How-to-devs.md
> **Author:** Guilherme Negreiros
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** tokens/semantic.json, tokens/component.json, .eslintrc-ds.json, AGENTS.md, How-to-without-agents.md (fallback if agents are unavailable)

---

## 1. Initial setup

### Clone and install
```bash
git clone [REPO_URL]
cd agentica-design-system
npm install
```

### Compile the tokens
```bash
npx style-dictionary build --config style-dictionary/config.json
# Generates: dist/tokens/css/, dist/tokens/js/, dist/tokens/ios/, dist/tokens/android/, …
```

### Generate the site
```bash
node site/build.js
# Generates site/dist/ (99 HTML files + site.css + agtc.js)
```

### Where product-facing npm docs live

If a product team asks how to consume Agentica (not maintain it), point them to:
- `get-started.html` (site) — the npm install flow, one step at a time
- `starter-kit/` (repo root) — a ready-to-copy minimal project (`npm install && npm run dev`)
- `packages/tokens/README.md` and `packages/components/README.md` — per-package reference

---

## 2. Daily workflow

### Modifying an existing token

**Rule:** any change to a semantic or component token = TCR.

```
1. Create a branch: token/[short-name]  (git-workflow.md convention)
2. Edit the relevant JSON file (semantic.json or component.json)
3. Submit a PR → Principal Designer review required
4. After merge: compile tokens + rebuild the site + communicate to teams
```

### Adding a component

```
1. Create the contract: guidelines/components/[name].md
2. Add the tokens: tokens/component.json  (TCR required)
3. Implement the Web Component (Lit): components/agtc-[name].js
4. Add metadata: .claude/skills/ai-component-metadata.md
5. Update guidelines/components/overview.md
6. Rebuild the site: node site/build.js
```

### Checking for drift before a PR
```bash
# Orphaned tokens / ghost CSS variables
node site/build.js   # validateCssVars() runs during the build, flags ghosts

# English-only content policy (ADR-070/071/075) — active CI gate
npm run lang-audit
npx playwright test tests/functional/language.spec.js --project=chromium

# WCAG accessibility — active CI pipeline (axe-core)
# Triggers automatically on every push; check GitHub Actions runs

# Visual regressions — Playwright (replaces Chromatic, ADR-066)
# Run visual tests locally before pushing:
npx playwright test --project=chromium

# CSS naming — absolute rule (ADR-2026-06-30)
# Zero version prefixes (v2-, ds-), zero hardcoded values
# See .claude/rules/code-style.md
```

---

## 3. Visual and functional tests (Playwright)

> Two distinct scopes — see ADR-066.

### Scope 1: DS tests (this repo)

These tests validate the site's pages and the `agtc-*` components. They run in CI on every
push to `main` via `.github/workflows/playwright.yml`.

```bash
# Prerequisite: site generated
node site/build.js

# Run all tests
npx playwright test

# Run a single file
npx playwright test tests/visual/home.spec.js

# Single browser (faster locally)
npx playwright test --project=chromium

# View the HTML report after a failure
npx playwright show-report
```

### Updating reference snapshots

When a visual change is **intentional** (new token, redesign):

```bash
# 1. Confirm the change is expected
npx playwright test --project=chromium

# 2. Regenerate the snapshots (human approval required — ADR-066)
npx playwright test --update-snapshots --project=chromium

# 3. Check the updated PNGs in tests/visual/snapshots/
git diff tests/visual/snapshots/

# 4. Commit the new snapshots along with the change that explains them
git add tests/visual/snapshots/
```

> ❌ Never commit updated snapshots without visually inspecting the diffs.

### Pre-push hook — automatic reminder

Enable the hook after cloning (one time only):

```bash
git config core.hooksPath .githooks
```

The hook displays a message if `components/` or `tokens/` changed since the last commit.

### Scope 2: product tests (your consuming repos)

See `guidelines/foundations/testing.md` — starter kit for testing your product with the DS.

### After finishing a chunk of work: `/document`

Once a change is functionally done, run `/document` (`.claude/skills/document/SKILL.md`)
to catch up the documentation surfaces that live outside the files you just
touched — GitHub Projects and the site changelog above all. It checks every row
of `pipelines/docs.md`, writes the relevant ones, re-runs the build/tests, and
proposes a commit — it never commits or pushes on its own.

---

## 4. Files to know

| File | Role | When to change it |
|---------|------|-------------------|
| `tokens/semantic.json` | Source of truth for UX intentions | Via TCR only |
| `tokens/component.json` | UI contracts | Via TCR + approval |
| `site/build.js` | Static site generator (CSS, HTML, JS) | On every layout or site component change |
| `scripts/audit-language.js` | English-only content policy audit (`npm run lang-audit`) | If new French content is suspected outside the site's bilingual spans |
| `.claude/rules/code-style.md` | CSS/HTML conventions — naming rules | If a new style rule is decided |
| `.claude/rules/` | Rules and constraints for AI agents | If a new governance decision is made |
| `AGENTS.md` | Agent router | If a new agent type is added |

---

## 5. Non-negotiable rules

- ❌ Never a hardcoded hex or px value in code
- ❌ Never a primitive token in a component
- ❌ Never an invented token (not defined in semantic.json)
- ❌ Never a version prefix in CSS class names (`v2-`, `ds-`) — see `code-style.md`
- ✅ Every semantic token change = TCR
- ✅ `node site/build.js` before every commit touching the site
- ✅ Agent rules live in `.claude/rules/` — read them before changing the architecture
