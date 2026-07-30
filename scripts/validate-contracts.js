#!/usr/bin/env node

/**
 * validate-contracts.js — deterministic checks on the governance layer
 * Design system team — internal use
 *
 * Principle borrowed from Design System Documentation Schema (DSDS) v0.15.2
 * (https://designsystemdocspec.org/, https://github.com/somerandomdude/design-system-documentation-schema)
 * — programmatic validation of documentation instead of relying only on qualitative
 * review. Credits: PJ Onori (maintainer), Afyia Smith (governance/docOrigin schemas,
 * v0.12.1), Suleiman Ali Shakir (documentation copy-edits). This does not validate
 * against the DSDS schema — it applies the same principle to our own Markdown/JSON.
 *
 * Deliberately scoped to NOT duplicate scripts/audit-tokens.js, which already checks
 * code-layer drift (hardcoded values, orphaned/phantom tokens, primitive→semantic→
 * component alias resolution). This script checks the governance layer instead:
 *   1. DTCG shape        — every token leaf ($value) also has a $type
 *   2. ADR references     — every $extensions.decision points at a real decisions/ADR-*.md
 *   3. Contract paths      — every $extensions.contract points at a real guideline file
 *   4. Token/guideline sync — tokens named in a guideline's Markdown still exist in
 *                             tokens/component.json (catches a renamed/removed token
 *                             left stale in prose)
 *   5. UX Patterns Reference — every guidelines/components/*.md has this section,
 *                              per .claude/rules/ux-patterns-sources.md's 6-surface rule
 *
 * A "required sections" check beyond #5 was considered and dropped: the 17 existing
 * guideline files do NOT share one fixed template (e.g. tabs.md has no "## Intent",
 * feature-card.md/icon.md/tabs.md/top-nav.md have no "## Governance") — enforcing a
 * single template would be inventing a rule that isn't actually in force, not checking
 * one that is. "UX Patterns Reference" is the one section explicitly mandated for every
 * component guideline, so it's the one checked here.
 *
 * Usage:
 *   node scripts/validate-contracts.js         → console report
 *   node scripts/validate-contracts.js --ci     → exit 1 on any violation
 */

import fs from 'fs';
import path from 'path';
import { REPO_ROOT, loadJSON, flattenTokens, walkTokenNodes, resolveAdrPath, resolveRelationTarget, findDottedTokenRefs, listMarkdownFiles, looksLikeAdrRef } from './lib/contracts.js';

const CI_MODE = process.argv.includes('--ci');

const RESET = '\x1b[0m', RED = '\x1b[31m', YELLOW = '\x1b[33m', GREEN = '\x1b[32m', CYAN = '\x1b[36m', BOLD = '\x1b[1m';
function log(msg)       { console.log(msg); }
function ok(msg)        { console.log(`${GREEN}  ✓${RESET} ${msg}`); }
function warn(msg)      { console.log(`${YELLOW}  ⚠${RESET} ${msg}`); }
function error(msg)     { console.log(`${RED}  ✗${RESET} ${msg}`); }
function section(title) { console.log(`\n${BOLD}${CYAN}── ${title} ${RESET}`); }

function checkDtcgShape() {
  section('1. DTCG shape ($value requires $type)');
  const issues = [];
  for (const file of ['primitives.json', 'semantic.json', 'component.json']) {
    const tree = loadJSON(`tokens/${file}`);
    for (const leaf of flattenTokens(tree)) {
      if (!leaf.type) issues.push({ file, token: leaf.key });
    }
  }
  if (issues.length === 0) ok('Every token leaf has a $type');
  else issues.forEach(i => error(`${i.file}: "${i.token}" has $value but no $type`));
  return issues;
}

function checkAdrReferences() {
  section('2. ADR references ($extensions.decision)');
  const broken = [];
  const nonAdr = [];
  for (const file of ['semantic.json', 'component.json']) {
    const tree = loadJSON(`tokens/${file}`);
    // decision lives on a group node in component.json (e.g. "button.primary") but on
    // the leaf itself in semantic.json — walk every node to catch both.
    for (const node of walkTokenNodes(tree)) {
      const decision = node.extensions?.decision;
      if (!decision) continue;
      if (!looksLikeAdrRef(decision)) { nonAdr.push({ file, token: node.key, decision }); continue; }
      if (!resolveAdrPath(decision)) broken.push({ file, token: node.key, decision });
    }
  }
  if (broken.length === 0) ok('Every ADR-shaped decision reference resolves to a file in decisions/');
  else broken.forEach(i => error(`${i.file}: "${i.token}" cites ${i.decision}, no matching file in decisions/`));
  if (nonAdr.length > 0) {
    nonAdr.forEach(i => warn(`${i.file}: "${i.token}" decision is "${i.decision}" — not ADR-shaped, confirm this is intentional (no formal ADR)`));
  }
  return broken; // non-ADR tags are surfaced but don't fail the check — a human call, not a defect
}

function checkContractPaths() {
  section('3. Contract paths ($metadata.contract)');
  const issues = [];
  const tree = loadJSON('tokens/component.json');

  function walk(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;
      if (value && typeof value === 'object') {
        const contract = value.$metadata?.contract;
        if (contract && !resolveRelationTarget(contract)) issues.push({ component: key, contract });
        walk(value);
      }
    }
  }
  walk(tree);

  if (issues.length === 0) ok('Every $metadata.contract points at an existing file');
  else issues.forEach(i => error(`component "${i.component}": contract "${i.contract}" does not exist`));
  return issues;
}

function checkTokenGuidelineSync() {
  section('4. Token/guideline sync (tokens named in prose still exist)');
  const issues = [];
  const componentTree = loadJSON('tokens/component.json');
  const knownKeys = new Set(flattenTokens(componentTree).map(l => l.key));

  for (const file of listMarkdownFiles('guidelines/components')) {
    const text = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
    for (const ref of findDottedTokenRefs(text, 'component')) {
      const key = ref.replace(/^component\./, '');
      if (!knownKeys.has(key)) issues.push({ file, ref });
    }
  }

  if (issues.length === 0) ok('Every `component.*` reference in guidelines/components/ still exists in tokens/component.json');
  else issues.forEach(i => error(`${i.file}: references "${i.ref}", not found in tokens/component.json`));
  return issues;
}

function checkUxPatternsSection() {
  section('5. "UX Patterns Reference" section present (ux-patterns-sources.md)');
  const issues = [];
  for (const file of listMarkdownFiles('guidelines/components')) {
    if (path.basename(file) === 'overview.md') continue; // index page, not a component contract
    const text = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
    if (!/^##\s+UX Patterns Reference/m.test(text)) issues.push({ file });
  }
  if (issues.length === 0) ok('Every component guideline has a UX Patterns Reference section');
  else issues.forEach(i => error(`${i.file}: missing "## UX Patterns Reference"`));
  return issues;
}

function main() {
  log(`\n${BOLD}Validate — governance layer contracts${RESET}`);
  log(`${CYAN}${'─'.repeat(40)}${RESET}`);

  const results = [
    checkDtcgShape(),
    checkAdrReferences(),
    checkContractPaths(),
    checkTokenGuidelineSync(),
    checkUxPatternsSection(),
  ];

  const total = results.reduce((n, r) => n + r.length, 0);
  section('Summary');
  if (total === 0) {
    log(`\n${GREEN}${BOLD}  ✓ All contract checks passed${RESET}\n`);
  } else {
    error(`${total} violation(s) across ${results.filter(r => r.length).length} check(s)`);
    log('');
  }

  if (CI_MODE && total > 0) {
    log(`${RED}CI: failed — fix contract violations before merging.${RESET}\n`);
    process.exit(1);
  }
}

main();
