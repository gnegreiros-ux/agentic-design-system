#!/usr/bin/env node

// Populates @agentica-ds/tokens package content from the root Style Dictionary output
// (dist/tokens/) and the raw DTCG source (tokens/). Run after style-dictionary/build.cjs
// — chained via the root "tokens" npm script.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const DIST_TOKENS = path.join(ROOT, 'dist', 'tokens');
const SRC_TOKENS = path.join(ROOT, 'tokens');
const OUT = __dirname;

const ensureDir = (d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    fs.copyFileSync(path.join(src, entry.name), path.join(dest, entry.name));
  }
}

// Compiled outputs — CSS custom properties, JS ES6 exports, Tailwind config extension.
// angular/, ios/, android/ stay root-only (not npm-ecosystem consumers).
copyDir(path.join(DIST_TOKENS, 'css'), path.join(OUT, 'css'));
copyDir(path.join(DIST_TOKENS, 'js'), path.join(OUT, 'js'));
copyDir(path.join(DIST_TOKENS, 'tailwind'), path.join(OUT, 'tailwind'));

// Raw three-layer DTCG source, retained for internal tooling consumers.
// figma-text-styles.json / $metadata.json stay root-only (Tokens Studio internal bookkeeping).
ensureDir(path.join(OUT, 'tokens'));
['primitives.json', 'semantic.json', 'semantic.dark.json', 'component.json'].forEach((f) => {
  const src = path.join(SRC_TOKENS, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, 'tokens', f));
});

console.log('✓ @agentica-ds/tokens package content built (packages/tokens/{css,js,tailwind,tokens}/)');
