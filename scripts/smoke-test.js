// Anti-regression smoke test — verifies that key components have their CSS tokens resolved.
// Detects regressions like "agtc-button lost all its styling" by checking
// that computed Shadow DOM CSS properties are non-empty and non-transparent.
//
// CLI:
//   node scripts/smoke-test.js
//   node scripts/smoke-test.js --report-only   → report with no blocking (exit 0)

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = join(process.cwd(), 'site', 'dist');
const REPORT_ONLY = process.argv.includes('--report-only');

// ── Component contracts — what MUST be resolved ────────────────────────────
// Each entry: { page, component, selector (inside shadow DOM), property, check }
// check: 'non-empty' | 'non-transparent' | (value) => boolean
const CONTRACTS = [
  // ── agtc-button ──────────────────────────────────────────────────────────
  {
    label: 'agtc-button primary — non-transparent background',
    page: 'components/button.html',
    host: 'agtc-button[variant="primary"]',
    shadowSelector: 'button.primary',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent',
  },
  {
    label: 'agtc-button primary — non-empty text color',
    page: 'components/button.html',
    host: 'agtc-button[variant="primary"]',
    shadowSelector: 'button.primary',
    property: 'color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  {
    label: 'agtc-button secondary — non-transparent border',
    page: 'components/button.html',
    host: 'agtc-button[variant="secondary"]',
    shadowSelector: 'button.secondary',
    property: 'border-top-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  {
    label: 'agtc-button critical — non-transparent background',
    page: 'components/button.html',
    host: 'agtc-button[variant="critical"]',
    shadowSelector: 'button.critical',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  // ── agtc-badge ───────────────────────────────────────────────────────────
  {
    label: 'agtc-badge success — non-transparent background',
    page: 'components/badge.html',
    host: 'agtc-badge[variant="success"]',
    shadowSelector: 'span.badge',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  // ── agtc-banner ──────────────────────────────────────────────────────────
  {
    label: 'agtc-banner info — non-transparent background',
    page: 'components/banner.html',
    host: 'agtc-banner[variant="info"]',
    shadowSelector: '.banner',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  // ── top nav ──────────────────────────────────────────────────────────────
  // The site does not mount the real <agtc-top-nav> custom element on
  // index.html — its navigation is a "mix" of hand-written markup styled via
  // the component's tokens (`.site-nav`), the same pattern already used for
  // table/banner/code-block (ADR-040/041/042). See ADR-087. This checks the
  // light-DOM class directly instead of a shadow DOM that doesn't exist here.
  {
    label: 'site nav (.site-nav) — display flex (desktop)',
    page: 'index.html',
    host: '.site-nav',
    shadowSelector: null,
    property: 'display',
    check: v => v === 'flex',
  },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const results = [];
let failures = 0;

console.log('smoke-test — component anti-regression\n');

for (const contract of CONTRACTS) {
  const page = await context.newPage();
  const url  = pathToFileURL(join(DIST, contract.page)).href;
  await page.goto(url, { waitUntil: 'load' });

  // Wait for the custom element to be defined and upgraded — only applies when
  // checking inside a shadow DOM; a plain light-DOM selector (shadowSelector:
  // null) isn't a custom element and has nothing to wait for.
  if (contract.shadowSelector) {
    await page.waitForFunction(
      host => customElements.get(host.split('[')[0]) !== undefined,
      contract.host,
      { timeout: 5000 }
    ).catch(() => {});
  }

  let value = '';
  let error = '';

  try {
    value = await page.evaluate(({ host, shadow, prop }) => {
      const el = document.querySelector(host);
      if (!el) return '__HOST_NOT_FOUND__';
      if (!shadow) return window.getComputedStyle(el).getPropertyValue(prop).trim();
      const shadowEl = el.shadowRoot?.querySelector(shadow);
      if (!shadowEl) return '__SHADOW_NOT_FOUND__';
      return window.getComputedStyle(shadowEl).getPropertyValue(prop).trim();
    }, { host: contract.host, shadow: contract.shadowSelector, prop: contract.property });
  } catch (e) {
    error = e.message;
    value = '__ERROR__';
  }

  await page.close();

  const pass = !error && value !== '__HOST_NOT_FOUND__' && value !== '__SHADOW_NOT_FOUND__'
    && value !== '__ERROR__' && contract.check(value);

  const status = pass ? '✓' : '✗';
  console.log(`${status} ${contract.label}`);
  if (!pass) {
    failures++;
    const reason = error || (value.startsWith('__') ? value : `value obtained: "${value}"`);
    console.log(`    → ${reason}`);
  }

  results.push({ label: contract.label, pass, value, page: contract.page });
}

await browser.close();

writeFileSync(
  join(process.cwd(), 'smoke-report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), results, failures }, null, 2)
);

console.log(`\n— ${CONTRACTS.length} contracts · ${failures} failure(s)`);
console.log('Report: smoke-report.json');

if (failures > 0) {
  if (REPORT_ONLY) {
    console.warn(`\n⚠ ${failures} component contract(s) not respected — fix before merging.`);
    process.exit(0);
  }
  console.error(`\n✗ FAILED — regression detected in ${failures} component(s).`);
  process.exit(1);
}
console.log('\n✓ All component contracts are respected.');
