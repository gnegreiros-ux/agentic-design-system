#!/usr/bin/env node

/**
 * extract-relationships.js — typed relationships registry
 * Design system team — internal use
 *
 * Concept borrowed from Design System Documentation Schema (DSDS) v0.15.2
 * (https://designsystemdocspec.org/, https://github.com/somerandomdude/design-system-documentation-schema)
 * — its `relationships` field on entity schemas (depends-on, composes, extends…).
 * Credits: PJ Onori (maintainer), Afyia Smith (governance/docOrigin schemas, v0.12.1),
 * Suleiman Ali Shakir (documentation copy-edits). We do not consume or validate against
 * the DSDS schema itself — this generates our own index over our own Markdown/JSON.
 *
 * The relations already exist, scattered across three places that were never linked:
 *   - tokens/*.json  → $extensions["com.agentica.usage"].decision / .doNotUse / $metadata.contract
 *   - token $value aliases ("{semantic.color.action.primary}")
 *   - the "> **Relations:**" header on every guidelines/ and .claude/rules/ Markdown file
 *
 * This script walks those sources and writes a single generated index, so questions like
 * "what depends on semantic.color.feedback.danger?" are a lookup, not a repo-wide grep.
 * It does not ask anyone to fill in a new format by hand.
 *
 * Edge types:
 *   depends-on    — a token aliases another token (component → semantic → primitive)
 *   excludes      — a token's doNotUse note names another token as the correct alternative
 *   governed-by   — a token's $extensions.decision names the ADR that justifies it
 *   documented-in — a token's $metadata.contract names its guideline, or a file's
 *                   "Relations:" header names a related file (this second case is kept
 *                   untyped-ish on purpose — the header mixes several kinds of relation
 *                   in free prose; see parseRelationsHeader in lib/contracts.js)
 *
 * Usage:
 *   node scripts/extract-relationships.js               → console summary only
 *   node scripts/extract-relationships.js --fix-report   → also writes relationships-report.json
 */

import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT, loadJSON, flattenTokens, walkTokenNodes, aliasRef, resolveAdrPath,
  parseRelationsHeader, resolveRelationTarget, findTokenMentions, listMarkdownFiles,
} from './lib/contracts.js';

const CONFIG = {
  outputFile: path.resolve(REPO_ROOT, 'relationships-report.json'),
  fixReport: process.argv.includes('--fix-report'),
};

const RESET = '\x1b[0m', CYAN = '\x1b[36m', BOLD = '\x1b[1m', DIM = '\x1b[2m';
function section(title) { console.log(`\n${BOLD}${CYAN}── ${title} ${RESET}`); }
function log(msg) { console.log(msg); }

function extractTokenEdges() {
  const edges = [];
  const files = { primitive: 'primitives.json', semantic: 'semantic.json', component: 'component.json' };
  const trees = {};
  for (const [layer, file] of Object.entries(files)) trees[layer] = loadJSON(`tokens/${file}`);

  const allLeaves = Object.values(trees).flatMap(t => flattenTokens(t));
  // doNotUse notes name a group ("button.critical"), not always a specific leaf
  // ("button.critical.background") — candidates for mention-matching must include
  // both leaf and group keys. Bare top-level names ("button", "card", "input") are
  // excluded: they're common English words that show up incidentally in unrelated
  // doNotUse prose, producing noise rather than a real cross-reference — a genuine
  // mention is always at least "component.variant".
  const allKeys = [...new Set([
    ...allLeaves.map(l => l.key),
    ...Object.values(trees).flatMap(t => walkTokenNodes(t).map(n => n.key)),
  ])].filter(k => k.includes('.'));

  // Alias edges only make sense between leaves (a group node has no $value to alias).
  for (const tree of Object.values(trees)) {
    for (const leaf of flattenTokens(tree)) {
      const ref = aliasRef(leaf.value);
      if (ref) edges.push({ type: 'depends-on', from: leaf.key, to: ref });
    }
  }

  // decision/doNotUse/contract can live on a group node (component.json) or a leaf
  // (semantic.json) — walk every node, not just leaves, to catch both.
  for (const tree of Object.values(trees)) {
    for (const node of walkTokenNodes(tree)) {
      if (node.metadata?.contract) {
        const resolved = resolveRelationTarget(node.metadata.contract);
        edges.push({ type: 'documented-in', from: node.key, to: node.metadata.contract, resolved: !!resolved });
      }
      const usage = node.extensions;
      if (!usage) continue;
      if (usage.decision) {
        const adrPath = resolveAdrPath(usage.decision);
        edges.push({ type: 'governed-by', from: node.key, to: adrPath || usage.decision, resolved: !!adrPath });
      }
      if (usage.doNotUse) {
        const mentioned = findTokenMentions(usage.doNotUse, allKeys.filter(k => k !== node.key));
        for (const target of mentioned) edges.push({ type: 'excludes', from: node.key, to: target });
      }
    }
  }
  return edges;
}

function extractHeaderEdges() {
  const edges = [];
  const dirs = ['guidelines/components', 'guidelines/foundations', '.claude/rules', '.claude/rules/components', '.claude/instructions', '.claude/skills'];
  const seen = new Set();
  for (const dir of dirs) {
    for (const file of listMarkdownFiles(dir)) {
      if (seen.has(file)) continue;
      seen.add(file);
      const text = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
      for (const raw of parseRelationsHeader(text)) {
        const resolved = resolveRelationTarget(raw);
        edges.push({ type: 'related', from: file, to: resolved || raw, resolved: !!resolved });
      }
    }
  }
  return edges;
}

function main() {
  log(`\n${BOLD}Relationships registry${RESET}`);
  log(`${CYAN}${'─'.repeat(40)}${RESET}`);

  const tokenEdges = extractTokenEdges();
  const headerEdges = extractHeaderEdges();
  const edges = [...tokenEdges, ...headerEdges];

  section('Summary');
  const byType = edges.reduce((acc, e) => ((acc[e.type] = (acc[e.type] || 0) + 1), acc), {});
  for (const [type, count] of Object.entries(byType)) log(`  ${type}: ${count}`);

  const unresolved = edges.filter(e => e.resolved === false);
  if (unresolved.length > 0) {
    section(`Unresolved targets (${unresolved.length}) — informational, not fatal`);
    unresolved.forEach(e => log(`  ${DIM}${e.type}${RESET}  ${e.from}  →  ${e.to}`));
  }

  if (CONFIG.fixReport) {
    const report = { generatedAt: new Date().toISOString(), edges };
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
    log(`\n${CYAN}Report written:${RESET} relationships-report.json (${edges.length} edges)\n`);
  } else {
    log(`\n${DIM}Run with --fix-report to write relationships-report.json (${edges.length} edges).${RESET}\n`);
  }
}

main();
