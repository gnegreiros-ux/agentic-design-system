// Automated accessibility audit (axe-core via Playwright) — applies ADR-007.
// Scans every generated page in site/dist/ across 3 contexts:
//   desktop-light (1280×900), mobile-light (375×812), desktop-dark (1280×900 + dark theme)
// Blocks (exit 1) on any violation with `critical` or `serious` impact.
// `moderate`/`minor` violations are reported but non-blocking.
// Full report written to axe-report.json.
//
// WHY this "site" level: the generated site is the living artifact that consumes
// the tokens and components (dogfooding principle) — a contrast or ARIA defect
// is observable there under real rendering conditions. Would have automatically
// detected the teal contrast regression fixed by ADR-048.
//
// CLI:
//   node scripts/axe-audit.js                           → 3 contexts (default)
//   node scripts/axe-audit.js --desktop                 → desktop-light only
//   node scripts/axe-audit.js --mobile                  → mobile-light only
//   node scripts/axe-audit.js --dark                    → desktop-dark only
//   node scripts/axe-audit.js --dist <path>              → alternate dist directory
//   node scripts/axe-audit.js --ci                      → block on violation (default)
//   node scripts/axe-audit.js --report-only             → report with no blocking
//   node scripts/axe-audit.js --exclude ".sel1,.sel2"   → extra selectors to exclude

import { chromium } from 'playwright';
import axePkg from '@axe-core/playwright';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const AxeBuilder = axePkg.default || axePkg;

const _distArg       = process.argv.indexOf('--dist');
const DIST           = _distArg !== -1
  ? join(process.cwd(), process.argv[_distArg + 1])
  : join(process.cwd(), 'site', 'dist');
const BLOCKING       = new Set(['critical', 'serious']);
const WCAG_TAGS      = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const _excludeArg    = process.argv.indexOf('--exclude');
const EXTRA_EXCLUDES = _excludeArg !== -1
  ? process.argv[_excludeArg + 1].split(',').map(s => s.trim())
  : [];

// ── Test contexts ───────────────────────────────────────────────────────────
const ALL_CONTEXTS = [
  { id: 'desktop-light', label: 'Desktop 1280px — Light', viewport: { width: 1280, height: 900 }, theme: 'light' },
  { id: 'mobile-light',  label: 'Mobile  375px  — Light', viewport: { width: 375,  height: 812 }, theme: 'light' },
  { id: 'desktop-dark',  label: 'Desktop 1280px — Dark',  viewport: { width: 1280, height: 900 }, theme: 'dark'  },
];

const onlyDesktop = process.argv.includes('--desktop');
const onlyMobile  = process.argv.includes('--mobile');
const onlyDark    = process.argv.includes('--dark');
const CONTEXTS = onlyDesktop ? [ALL_CONTEXTS[0]]
               : onlyMobile  ? [ALL_CONTEXTS[1]]
               : onlyDark    ? [ALL_CONTEXTS[2]]
               : ALL_CONTEXTS;

// ── HTML pages ───────────────────────────────────────────────────────────────
function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out.sort();
}

const pages = htmlFiles(DIST);
console.log(`axe-core — ${pages.length} pages × ${CONTEXTS.length} context(s) (ADR-007)\n`);

const browser = await chromium.launch();
const report  = { generatedAt: new Date().toISOString(), contexts: [], summary: {} };
let blockingTotal = 0;
let moderateTotal = 0;
let skippedTotal  = 0;

for (const ctx of CONTEXTS) {
  console.log(`\n── ${ctx.label} ${'─'.repeat(Math.max(0, 44 - ctx.label.length))}`);

  const bContext = await browser.newContext({ viewport: ctx.viewport });
  // Inject the theme before any page script runs (addInitScript executes before DOMContentLoaded)
  await bContext.addInitScript(theme => {
    try { localStorage.setItem('agtc-theme', theme); } catch (_) {}
    document.documentElement.setAttribute('data-theme', theme);
  }, ctx.theme);
  // Note: emulateMedia on BrowserContext isn't available in this Playwright version.
  // The data-theme="dark" injected via addInitScript is enough for Lit components and CSS tokens.

  const ctxReport = { context: ctx.id, label: ctx.label, pages: [] };
  let ctxBlocking = 0;
  let ctxModerate = 0;

  for (const file of pages) {
    const rel  = file.slice(DIST.length + 1);
    const page = await bContext.newPage();

    // A single slow/broken page (e.g. a page.goto timeout) must not crash the
    // entire run — every other page's results, and the final report/exit code,
    // would be lost with it. Caught here and recorded as a skipped page instead,
    // mirroring the per-check try/catch already used in scripts/smoke-test.js.
    let results;
    try {
      await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
      // .logo and .hero-name excluded: brand name / logotype (WCAG 1.4.3 exempt).
      let _builder = new AxeBuilder({ page }).exclude('.logo').exclude('.hero-name');
      for (const sel of EXTRA_EXCLUDES) _builder = _builder.exclude(sel);
      results = await _builder.withTags(WCAG_TAGS).analyze();
    } catch (e) {
      await page.close();
      skippedTotal++;
      ctxReport.pages.push({ page: rel, skipped: true, error: e.message });
      console.log(`  ⚠ ${rel}  —  SKIPPED (${e.message.split('\n')[0]})`);
      continue;
    }
    await page.close();

    const blocking = results.violations.filter(v => BLOCKING.has(v.impact));
    const moderate = results.violations.filter(v => !BLOCKING.has(v.impact));
    ctxBlocking   += blocking.length;
    ctxModerate   += moderate.length;
    blockingTotal += blocking.length;
    moderateTotal += moderate.length;

    ctxReport.pages.push({
      page: rel,
      blocking: blocking.map(v => ({
        id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => n.target).flat(),
      })),
      moderate: moderate.map(v => ({ id: v.id, impact: v.impact, help: v.help })),
    });

    if (blocking.length) {
      console.log(`  ✗ ${rel}`);
      for (const v of blocking) {
        console.log(`      [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node·s)`);
        console.log(`        ${v.helpUrl}`);
        for (const n of v.nodes.slice(0, 3)) console.log(`        → ${n.target.join(' ')}`);
      }
    } else {
      console.log(`  ✓ ${rel}${moderate.length ? `  (${moderate.length} moderate)` : ''}`);
    }
  }

  const ctxSkipped = ctxReport.pages.filter(p => p.skipped).length;
  console.log(`  — ${ctxBlocking} blocking · ${ctxModerate} moderate${ctxSkipped ? ` · ${ctxSkipped} skipped` : ''}`);
  ctxReport.summary = { pages: pages.length, blocking: ctxBlocking, moderate: ctxModerate, skipped: ctxSkipped };
  report.contexts.push(ctxReport);
  await bContext.close();
}

await browser.close();

report.summary = {
  contexts: CONTEXTS.length,
  pages: pages.length,
  blocking: blockingTotal,
  moderate: moderateTotal,
  skipped: skippedTotal,
};
writeFileSync(join(process.cwd(), 'axe-report.json'), JSON.stringify(report, null, 2));

console.log(`\n══ TOTAL — ${CONTEXTS.length} context(s) · ${pages.length} pages · ${blockingTotal} blocking · ${moderateTotal} moderate${skippedTotal ? ` · ${skippedTotal} skipped` : ''}`);
console.log('Report: axe-report.json');

const isBlocking = process.argv.includes('--report-only')
  ? false
  : process.argv.includes('--ci') || process.env.AXE_BLOCKING !== 'false';

// A skipped page was never actually audited — in CI, that's unknown coverage,
// not a clean pass, so it fails loudly instead of silently reporting "0
// violations" for a page that was never checked.
if (skippedTotal > 0 && isBlocking) {
  console.error(`\n✗ FAILED — ${skippedTotal} page(s) skipped (goto/analyze error) — coverage incomplete, investigate before retrying.`);
  process.exit(1);
}

if (blockingTotal > 0) {
  if (isBlocking) {
    console.error(`\n✗ FAILED — ${blockingTotal} critical/serious violation(s). Human fix required (ADR-007).`);
    process.exit(1);
  }
  console.warn(`\n⚠ REPORT MODE — ${blockingTotal} violation(s) to resolve.`);
  process.exit(0);
}
if (skippedTotal > 0) {
  console.warn(`\n⚠ ${skippedTotal} page(s) skipped (goto/analyze error) — coverage incomplete.`);
  process.exit(0);
}
console.log('\n✓ 0 critical/serious violations — WCAG AA respected across every context.');
