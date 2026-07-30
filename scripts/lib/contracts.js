/**
 * scripts/lib/contracts.js — shared helpers for the relationships/validation scripts
 * Design system team — internal use
 *
 * Parses the structures that already carry cross-references in this repo (token JSON,
 * guideline Markdown, rule/guideline headers) so extract-relationships.js and
 * validate-contracts.js don't each reimplement the same traversal.
 */

import fs from 'fs';
import path from 'path';

export const REPO_ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');

export function loadJSON(relPath) {
  const filepath = path.join(REPO_ROOT, relPath);
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

export function exists(relPath) {
  return fs.existsSync(path.join(REPO_ROOT, relPath));
}

// Recursively flattens a token tree into leaf entries: { key, value, type, extensions }.
// A leaf is any object carrying a $value — mirrors scripts/audit-tokens.js's
// extractTokenKeys, but keeps the full node (not just the dotted key) since callers
// here need $type and $extensions, not just the key name.
export function flattenTokens(obj, prefix = '') {
  const leaves = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && value.$value !== undefined) {
      leaves.push({
        key: fullKey,
        value: value.$value,
        type: value.$type,
        extensions: value.$extensions?.['com.agentica.usage'],
      });
    } else if (value && typeof value === 'object') {
      leaves.push(...flattenTokens(value, fullKey));
    }
  }
  return leaves;
}

// Walks EVERY node in a token tree, leaf or group — unlike flattenTokens, which only
// returns $value leaves. This matters because $extensions.decision/.doNotUse and
// $metadata.contract don't live at a consistent depth across files: in
// tokens/component.json they sit on a group node (e.g. "button.primary", one level
// above the actual "background"/"text" leaves), while in tokens/semantic.json a color
// entry like "brand.logo-black" carries $extensions directly on its own leaf. Callers
// that need decision/doNotUse/contract must walk all nodes, not just leaves.
export function walkTokenNodes(obj, prefix = '') {
  const nodes = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!value || typeof value !== 'object') continue;
    nodes.push({
      key: fullKey,
      metadata: value.$metadata,
      extensions: value.$extensions?.['com.agentica.usage'],
    });
    nodes.push(...walkTokenNodes(value, fullKey));
  }
  return nodes;
}

// "{semantic.color.action.primary}" -> "semantic.color.action.primary" ; null if not an alias.
export function aliasRef(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^\{(.+)\}$/);
  return match ? match[1] : null;
}

// "ADR-005" -> "decisions/ADR-005-variante-critical-vs-danger.md" (or null if not found).
// Also accepts a bare directory-style reference like "decisions/ADR-057" (no slug/extension).
export function resolveAdrPath(adrRef) {
  const idMatch = adrRef.match(/ADR-(\d+)/);
  if (!idMatch) return null;
  const id = idMatch[1];
  const decisionsDir = path.join(REPO_ROOT, 'decisions');
  if (!fs.existsSync(decisionsDir)) return null;
  const found = fs.readdirSync(decisionsDir).find(f => f.startsWith(`ADR-${id}-`) || f === `ADR-${id}.md`);
  return found ? `decisions/${found}` : null;
}

// Best-effort parse of a "> **Relations:** a, b, c" header line into individual raw
// targets. Splits on top-level commas (not commas inside a trailing parenthetical
// note), strips those notes, and drops non-path placeholders (e.g. "[impacted files]"
// in template files). This is deliberately lenient — the source convention is prose,
// not a schema — callers should treat unresolved targets as informational, not fatal.
export function parseRelationsHeader(mdText) {
  const line = mdText.match(/^>\s*\*\*Relations:\*\*\s*(.+)$/m);
  if (!line) return [];
  const raw = line[1];
  return raw
    .split(/,(?![^(]*\))/)
    .map(s => s.trim().replace(/\s*\([^)]*\)\s*$/, '').trim())
    .filter(s => s && !s.startsWith('['));
}

// Resolves a raw Relations: target to a repo-relative path that actually exists, or
// null. Handles plain paths (already relative), bare ADR references without a slug,
// and directory references (kept as-is if the directory exists).
export function resolveRelationTarget(raw) {
  if (exists(raw)) return raw;
  const adrPath = resolveAdrPath(raw);
  if (adrPath) return adrPath;
  return null;
}

// Scans free text (e.g. a $extensions.usage.doNotUse note) for mentions of other known
// token keys, as whole-word dotted paths (e.g. "button.critical" inside a button.primary
// entry). Returns the subset of knownKeys actually mentioned.
export function findTokenMentions(text, knownKeys) {
  if (!text) return [];
  return knownKeys.filter(key => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Left boundary: not preceded by a word/hyphen/dot (avoids matching inside a
    // longer dotted path). Right boundary: not immediately continued by a word char,
    // hyphen, or ".lowercase" (which would mean this is a prefix of a longer path) —
    // but a plain trailing "." (end of sentence) is allowed through.
    return new RegExp(`(?<![\\w.-])${escaped}(?![\\w-])(?!\\.[a-z0-9])`).test(text);
  });
}

// Extracts `component.x.y` / `semantic.x.y` token references from a guideline's
// "Tokens used" table (or anywhere in the file, since heading text varies across
// components — see guidelines/components/*.md).
const FILE_EXTENSIONS = /\.(json|md|js|css|ts|html)$/;

export function findDottedTokenRefs(mdText, layerPrefix) {
  const regex = new RegExp('`(' + layerPrefix + '\\.[\\w.-]+)`', 'g');
  const refs = new Set();
  let match;
  while ((match = regex.exec(mdText)) !== null) {
    // Excludes prose file references like `component.json` or `tokens/component.json`
    // (a bare filename, not a dotted token path) — a real token key never ends in a
    // file extension.
    if (!FILE_EXTENSIONS.test(match[1])) refs.add(match[1]);
  }
  return [...refs];
}

// True if a $extensions.decision value looks like it's meant to reference an ADR
// ("ADR-005") rather than being a free-form tag used when no formal ADR exists yet
// (e.g. "logo-identity").
export function looksLikeAdrRef(value) {
  return /ADR-\d+/.test(value);
}

export function listMarkdownFiles(dir) {
  const abs = path.join(REPO_ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dir, f));
}
