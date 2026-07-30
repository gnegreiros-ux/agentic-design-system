#!/usr/bin/env node

/**
 * audit-tokens.js — Token system audit
 * Design system team — internal use
 *
 * Detects:
 *   1. Orphaned tokens  — defined in component.json but never used in code
 *   2. Phantom tokens   — used in code but not defined in semantic.json
 *   3. Hardcoded values — arbitrary hex, rgb, px in code (AI drift vectors)
 *   4. Direct references to primitives in components
 *
 * Usage:
 *   node scripts/audit-tokens.js
 *   node scripts/audit-tokens.js --fix-report          → generates a JSON report
 *   node scripts/audit-tokens.js --ci                  → exit 1 on critical violations
 *   node scripts/audit-tokens.js --src-dir <path>       → analyzes a specific source directory
 *
 * Escape hatch: a line containing `audit-ignore` is skipped — use sparingly, only for
 * a genuine, reviewed false positive already justified by its own surrounding comment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Configuration ────────────────────────────────────────────────────────────

const TOKEN_PREFIXES = {
  primitive: '--agtc-primitive-',
  semantic:  '--agtc-semantic-',
  component: '--agtc-component-',
};

const _srcArgIdx = process.argv.indexOf('--src-dir');

const CONFIG = {
  tokensDir:   path.resolve(__dirname, '../tokens'),
  sourceDir:   _srcArgIdx !== -1 ? path.resolve(process.cwd(), process.argv[_srcArgIdx + 1]) : null,
  outputFile:  path.resolve(__dirname, '../audit-report.json'),
  ciMode:      process.argv.includes('--ci'),
  fixReport:   process.argv.includes('--fix-report'),
};

// Source file extensions to analyze
const SOURCE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.md'];

// Drift patterns to detect in source code
const DRIFT_PATTERNS = [
  { name: 'hex-color',       regex: /#[0-9a-fA-F]{3,8}\b/g,           severity: 'error',   message: 'Hardcoded hex color' },
  { name: 'rgb-color',       regex: /rgb\s*\([^)]+\)/g,                severity: 'error',   message: 'Hardcoded rgb() value' },
  { name: 'hsl-color',       regex: /hsl\s*\([^)]+\)/g,                severity: 'error',   message: 'Hardcoded hsl() value' },
  { name: 'tailwind-arbitrary', regex: /(?:p|m|text|bg|border)-\[[\d.]+(?:px|rem|em)[^\]]*\]/g, severity: 'error', message: 'Tailwind arbitrary value' },
  { name: 'inline-px',       regex: /(?:padding|margin|font-size|gap|border-radius)\s*:\s*\d+px/g, severity: 'warning', message: 'Inline px value with no token' },
  { name: 'primitive-direct', regex: new RegExp('var\\(' + TOKEN_PREFIXES.primitive, 'g'), severity: 'warning', message: 'Primitive token used directly' },
];

// ─── Utilities ──────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';

function log(msg)        { console.log(msg); }
function ok(msg)         { console.log(`${GREEN}  ✓${RESET} ${msg}`); }
function warn(msg)       { console.log(`${YELLOW}  ⚠${RESET} ${msg}`); }
function error(msg)      { console.log(`${RED}  ✗${RESET} ${msg}`); }
function section(title)  { console.log(`\n${BOLD}${CYAN}── ${title} ${RESET}`); }

// Load a tokens JSON file
function loadTokens(filename) {
  const filepath = path.join(CONFIG.tokensDir, filename);
  if (!fs.existsSync(filepath)) {
    warn(`Tokens file not found: ${filename}`);
    return {};
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

// Recursively extract every token key (dotted path)
function extractTokenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // metadata
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && value.$value !== undefined) {
      keys.push(fullKey);
    } else if (value && typeof value === 'object') {
      keys.push(...extractTokenKeys(value, fullKey));
    }
  }
  return keys;
}

// Collects the generated CSS variable names for a token tree, reproducing
// Style Dictionary's kebab transform (path segments joined by '-'). Built
// in the forward direction (tree → variable name) because the reverse
// conversion is ambiguous: a hyphen in the generated name can be a segment
// boundary OR a hyphen internal to a segment's name (e.g. "label-bold",
// "line-height" are each a SINGLE segment).
function collectCssVarNames(obj, cssPrefix, pathParts = []) {
  const names = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const parts = [...pathParts, key];
    if (value && typeof value === 'object' && value.$value !== undefined) {
      names.push(cssPrefix + parts.join('-'));
    } else if (value && typeof value === 'object') {
      names.push(...collectCssVarNames(value, cssPrefix, parts));
    }
  }
  return names;
}

// Recursively fetch all source files
function getSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.claude', 'storybook-static', 'playwright-report', 'test-results', 'Temp'].includes(entry.name)) {
      files.push(...getSourceFiles(fullPath));
    } else if (entry.isFile() && SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

// ─── Audits ───────────────────────────────────────────────────────────────────

function auditOrphanedTokens(componentTokens, sourceFiles) {
  section('1. Orphaned tokens (defined but never used)');
  const allComponentKeys = extractTokenKeys(componentTokens);
  const orphaned = [];

  for (const tokenKey of allComponentKeys) {
    // Convert to CSS var pattern: button.primary.background → --agtc-component-button-primary-background
    const cssVar = TOKEN_PREFIXES.component + tokenKey.replace(/\./g, '-');
    const used = sourceFiles.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(cssVar) || content.includes(tokenKey);
    });
    if (!used) orphaned.push({ token: tokenKey, cssVar });
  }

  if (orphaned.length === 0) {
    ok(`No orphaned tokens detected (${allComponentKeys.length} tokens checked)`);
  } else {
    orphaned.forEach(t => warn(`Orphaned: ${t.token}  →  ${t.cssVar}`));
  }
  return orphaned;
}

function auditPhantomTokens(semanticTokens, sourceFiles) {
  section('2. Phantom tokens (used in code but not defined)');
  // semantic.json nests everything under a top-level "semantic" key (DTCG $schema/$metadata
  // wrapper) — collectCssVarNames strips it via semanticTokens.semantic.
  const definedVars = new Set(collectCssVarNames(semanticTokens.semantic || semanticTokens, TOKEN_PREFIXES.semantic));
  const phantoms = [];

  // Search for every --agtc-semantic-* reference in the sources
  const semanticVarRegex = new RegExp('var\\(' + TOKEN_PREFIXES.semantic + '([\\w-]+)\\)', 'g');
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = semanticVarRegex.exec(content)) !== null) {
      const cssVar = TOKEN_PREFIXES.semantic + match[1];
      if (!definedVars.has(cssVar) && !phantoms.find(p => p.cssVar === cssVar)) {
        phantoms.push({ cssVar, file: path.relative(process.cwd(), file) });
      }
    }
  }

  if (phantoms.length === 0) {
    ok('No phantom tokens detected');
  } else {
    phantoms.forEach(p => error(`Phantom: ${p.cssVar}  in  ${p.file}`));
  }
  return phantoms;
}

// Documented, human-approved fallback shapes where a literal color sits next to its
// token reference on purpose — not drift. See .claude/rules/no-visited-nav.md (ADR-047/059
// Safari :visited exception), the var(--x, #fallback) CSS resilience pattern used
// throughout site/build.js, and the vFill(token, fallback) Figma-plugin equivalent
// (.claude/instructions/figma-components.md §0) — Figma Plugin API has no CSS var()
// concept, so a resolved literal fallback next to the token name is the correct pattern.
const COLOR_EXCEPTION_LINE = /vFill\(|var\(--[\w-]+\s*,\s*#|:visited\s*(,|\{)|\w*[Tt]ok:\s*["']|["'](color|component)\/[\w-]+["']/;

// Functions whose ENTIRE body is pedagogical/reference content (explaining the
// token hierarchy to a human or AI reader) rather than applied styling — same
// category as docs/*.md, just embedded inline in site/build.js instead of a
// separate file. Scoped by name + brace-depth so individual lines inside don't
// each need their own audit-ignore comment (many are markdown table rows,
// where a trailing HTML comment would visibly break the table).
const PEDAGOGICAL_FUNCTIONS = ['aiBriefContent'];

function pedagogicalLineRanges(content) {
  const ranges = [];
  for (const name of PEDAGOGICAL_FUNCTIONS) {
    const startMatch = content.match(new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`));
    if (!startMatch) continue;
    const startIdx = startMatch.index;
    let depth = 0, end = content.length;
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    const startLine = content.slice(0, startIdx).split('\n').length;
    const endLine   = content.slice(0, end).split('\n').length;
    ranges.push([startLine, endLine]);
  }
  return ranges;
}

function auditHardcodedValues(sourceFiles) {
  section('3. Hardcoded values (AI drift vectors)');
  const violations = [];
  const colorPatternNames = new Set(['hex-color', 'rgb-color', 'hsl-color']);

  for (const file of sourceFiles) {
    const content  = fs.readFileSync(file, 'utf8');
    const lines    = content.split('\n');
    const relFile  = path.relative(process.cwd(), file);
    const pedagogicalRanges = pedagogicalLineRanges(content);

    for (const pattern of DRIFT_PATTERNS) {
      lines.forEach((line, idx) => {
        const lineNo = idx + 1;
        if (pedagogicalRanges.some(([s, e]) => lineNo >= s && lineNo <= e)) return;
        // Escape hatch for a genuine, reviewed false positive — mirrors
        // lang-audit-ignore in scripts/audit-language.js. Use sparingly, and only
        // for a line already justified by its own surrounding comment.
        if (line.includes('audit-ignore')) return;
        // A line documenting an anti-pattern (guidelines/*.md "❌ Never a hardcoded
        // px value" style examples) is showing the violation on
        // purpose, as the thing to avoid — not committing it. Doesn't need a
        // per-line audit-ignore comment, which would show up as literal visible
        // text in a plain fenced checklist block (not parsed as HTML there).
        if (/^\s*❌/.test(line)) return;
        // Same anti-pattern-example intent as the ❌ check above, but rendered via
        // the icon('circle-x'|'x', …) helper (site/build.js's own DOs/DON'Ts
        // sections) instead of the literal emoji.
        if (/icon\(\s*['"](circle-x|x)['"]/.test(line)) return;
        // The var(--x, fallback-color) CSS-resilience pattern is just as
        // legitimate when x is a primitive reference as when the whole thing is
        // a bare color — same site/build.js pattern, same reasoning either way.
        if ((colorPatternNames.has(pattern.name) || pattern.name === 'primitive-direct') && COLOR_EXCEPTION_LINE.test(line)) return;
        const matches = [...line.matchAll(new RegExp(pattern.regex.source, 'g'))];
        for (const match of matches) {
          violations.push({
            severity: pattern.severity,
            type:     pattern.name,
            message:  pattern.message,
            file:     relFile,
            line:     idx + 1,
            value:    match[0].trim(),
          });
        }
      });
    }
  }

  const errors   = violations.filter(v => v.severity === 'error');
  const warnings = violations.filter(v => v.severity === 'warning');

  if (violations.length === 0) {
    ok('No hardcoded values detected');
  } else {
    errors.forEach(v =>
      error(`[${v.type}] ${v.file}:${v.line}  →  "${v.value}"  (${v.message})`)
    );
    warnings.forEach(v =>
      warn(`[${v.type}] ${v.file}:${v.line}  →  "${v.value}"  (${v.message})`)
    );
  }
  return violations;
}

function auditTokenStructure(primitives, semantic, component) {
  section('4. Token structure (three-layer consistency)');
  const issues = [];

  // Verify that semantic tokens do reference existing primitives
  const primitiveKeys = extractTokenKeys(primitives);
  const semanticEntries = extractTokenKeys(semantic);

  // Verify that component tokens reference existing semantics
  const componentKeys = extractTokenKeys(component);
  const semanticKeys  = extractTokenKeys(semantic);

  let refErrors = 0;
  function checkRefs(obj, layer) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;
      if (value && typeof value === 'object' && typeof value.$value === 'string') {
        const ref = value.$value.match(/^\{(.+)\}$/);
        if (ref) {
          const refKey = ref[1];
          const isDefined = layer === 'semantic'
            ? primitiveKeys.some(k => k === refKey)
            : (semanticKeys.some(k => k === refKey) || refKey === 'transparent');
          if (!isDefined) {
            warn(`Unresolved reference in ${layer}: {${refKey}}`);
            issues.push({ layer, ref: refKey });
            refErrors++;
          }
        }
      } else if (value && typeof value === 'object') {
        checkRefs(value, layer);
      }
    }
  }

  checkRefs(semantic,   'semantic');
  checkRefs(component,  'component');

  if (refErrors === 0) {
    ok(`Consistent structure — ${semanticEntries.length} semantic tokens, ${componentKeys.length} component tokens`);
  }
  return issues;
}

// ─── Report ──────────────────────────────────────────────────────────────────

function generateReport(results) {
  const report = {
    generatedAt:  new Date().toISOString(),
    summary: {
      orphanedTokens:   results.orphaned.length,
      phantomTokens:    results.phantoms.length,
      hardcodedErrors:  results.violations.filter(v => v.severity === 'error').length,
      hardcodedWarnings:results.violations.filter(v => v.severity === 'warning').length,
      structureIssues:  results.structureIssues.length,
    },
    details: results,
  };

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
  log(`\n${CYAN}Report written:${RESET} audit-report.json`);
  return report;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  log(`\n${BOLD}Audit — Token system${RESET}`);
  log(`${CYAN}${'─'.repeat(40)}${RESET}`);

  // Load the tokens
  const primitives = loadTokens('primitives.json');
  const semantic   = loadTokens('semantic.json');
  const component  = loadTokens('component.json');

  // Fetch the source files — priority: --src-dir > src/ > root
  const srcDir     = CONFIG.sourceDir || path.resolve(__dirname, '../src');
  const rootDir    = path.resolve(__dirname, '..');
  // packages/tokens/{css,js,tailwind,tokens}/ and packages/components/agtc-*.js
  // are build output, gitignored (see .gitignore) and regenerated by `npm run
  // tokens` / `npm run build:components-package` — never hand-authored, so
  // "hardcoded hex" there isn't drift: for tokens it's the resolved primitive
  // values doing their job; for components it's a verbatim copy of components/,
  // so every hit is a pure duplicate of a violation already counted there. Same
  // category as dist/, just not named "dist" so the directory-basename skip in
  // getSourceFiles() doesn't catch it.
  const GENERATED_PATHS = [
    'packages/tokens/css/',
    'packages/tokens/js/',
    'packages/tokens/tailwind/',
    'packages/tokens/tokens/',
    'packages/components/',
  ];
  // decisions/*.md cite historical hex values as part of explaining a past
  // decision (e.g. "teal.9 -> a resolved hex") — an ADR is immutable once active
  // (decisions/README.md), so these aren't enforceable "current code" the way
  // components/site source is. scripts/figma/*.js are Figma Plugin API scripts
  // that read hex directly from tokens/*.json to apply Figma paints — the
  // Plugin API has no CSS var() concept, so a literal hex there is expected,
  // not drift (same reasoning as the vFill()/COLOR_EXCEPTION_LINE case below).
  // docs/*.md is narrative/pedagogical prose (not a component contract like
  // guidelines/ — those stay in scope, since they're meant to demonstrate
  // correct token usage) — its illustrative hex citations, including inside
  // fenced code-block diagrams where a per-line audit-ignore comment would
  // visually corrupt the diagram, aren't real drift either.
  const DOCS_AND_PLUGIN_PATHS = [
    'decisions/',
    'scripts/figma/',
    'docs/',
  ];
  const EXCLUDED_PATHS = [...GENERATED_PATHS, ...DOCS_AND_PLUGIN_PATHS];
  const sourceFiles = (CONFIG.sourceDir || fs.existsSync(srcDir))
    ? getSourceFiles(srcDir)
    : getSourceFiles(rootDir).filter(f =>
        !f.includes('node_modules') &&
        !f.includes('dist') &&
        !EXCLUDED_PATHS.some(p => f.includes(p))
      );

  log(`${CYAN}Files analyzed:${RESET} ${sourceFiles.length}`);

  // Run the audits
  const orphaned       = auditOrphanedTokens(component, sourceFiles);
  const phantoms       = auditPhantomTokens(semantic, sourceFiles);
  const violations     = auditHardcodedValues(sourceFiles);
  const structureIssues = auditTokenStructure(primitives, semantic, component);

  // Summary
  section('Summary');
  const criticalCount = phantoms.length +
    violations.filter(v => v.severity === 'error').length +
    structureIssues.length;
  const warnCount = orphaned.length +
    violations.filter(v => v.severity === 'warning').length;

  if (criticalCount === 0 && warnCount === 0) {
    log(`\n${GREEN}${BOLD}  ✓ Clean system — no drift detected${RESET}\n`);
  } else {
    if (criticalCount > 0) error(`${criticalCount} critical violation(s) detected`);
    if (warnCount > 0)     warn(`${warnCount} warning(s)`);
    log('');
  }

  // JSON report
  if (CONFIG.fixReport) {
    generateReport({ orphaned, phantoms, violations, structureIssues });
  }

  // CI mode — exit 1 on critical violations
  if (CONFIG.ciMode && criticalCount > 0) {
    log(`${RED}CI: failed — fix critical violations before merging.${RESET}\n`);
    process.exit(1);
  }
}

main();
