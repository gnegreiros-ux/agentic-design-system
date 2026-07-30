'use strict';
/**
 * WCAG 2.2 audit functions shared between audit-a11y.js (CLI) and build.js (the /audit page).
 * Runs nothing — exports pure functions only.
 */

const fs   = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');

function getSiteCSS() {
  return fs.readFileSync(path.join(DIST, 'site.css'), 'utf8');
}

// ─── CONTRAST ───────────────────────────────────────────────────────────────
function lum(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function cr(a, b) {
  const [L1, L2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return +((L1 + 0.05) / (L2 + 0.05)).toFixed(2);
}

// Literal resolved hex, not CSS var() references — intentional, not drift. This
// runs headless in Node (no browser, no CSS cascade) to compute WCAG contrast
// ratios via lum()/cr() above, which need concrete RGB math; a var(--x) string
// has no meaning here. Keep these values in sync with tokens/semantic.json by
// hand when a referenced color changes.
const CONTRAST_PAIRS = [
  ['#ffffff', '#007a68', 'Button primary — text on background (action.primary)',  4.5], // audit-ignore
  ['#202020', '#fcfcfc', 'Body text on page background',                         4.5], // audit-ignore
  ['#202020', '#ffffff', 'Body text on surface',                                 4.5], // audit-ignore
  ['#646464', '#ffffff', 'Secondary text on surface',                            4.5], // audit-ignore
  ['#646464', '#fcfcfc', 'Secondary text on page background',                    4.5], // audit-ignore
  ['#ffffff', '#ce2c31', 'Critical button — text on background',                 4.5], // audit-ignore
  ['#0d74ce', '#ffffff', 'Link / active sidebar — text on surface',              4.5], // audit-ignore
  ['#0d74ce', '#fcfcfc', 'Link on page background',                             4.5], // audit-ignore
  ['#0d74ce', '#fafafa', 'Link on hovered row',                                 4.5], // audit-ignore
  ['#18794e', '#ecfdf5', 'Success badge — text on background (UI 1.4.11)',      3.0], // audit-ignore
  ['#0d74ce', '#e8e8e8', 'Focus ring on default border (1.4.11)',               3.0], // audit-ignore
  ['#202020', '#f0f0f0', 'Text on subtle background',                           4.5], // audit-ignore
  ['#646464', '#f0f0f0', 'Secondary text on subtle background',                 4.5], // audit-ignore
  ['#767676', '#ffffff', 'Disabled text on surface',                            4.5], // audit-ignore
  ['#767676', '#fcfcfc', 'Disabled text on page background — 1.4.3 exempt',    1.0], // audit-ignore
];

// ─── MINIMAL HTML PARSER ────────────────────────────────────────────────────
function allTags(html, tag) {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>|<${tag}(\\s[^>]*)?/?>`, 'gi');
  return [...html.matchAll(re)].map(m => m[0]);
}
function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  return m ? m[1] : null;
}
function hasAttr(tag, name) {
  return new RegExp(`\\b${name}(?:="[^"]*"|\\b)`, 'i').test(tag);
}
function innerText(tag) {
  return tag.replace(/<[^>]+>/g, '').trim();
}

// ─── SINGLE-PAGE ANALYSIS ───────────────────────────────────────────────────
function auditPage(html, file, SITE_CSS) {
  const violations = [];
  const warnings   = [];
  const passed     = [];

  function fail(criterion, msg) { violations.push({ criterion, msg, file }); }
  function warn(criterion, msg) { warnings.push({ criterion, msg, file }); }
  function pass(criterion, msg) { passed.push({ criterion, msg }); }

  // 3.1.1 Language
  const langMatch = html.match(/<html[^>]+lang="([^"]*)"/i);
  if (!langMatch) fail('3.1.1', 'Missing lang attribute on <html>');
  else if (!langMatch[1]) fail('3.1.1', 'Empty lang attribute on <html>');
  else pass('3.1.1', `lang="${langMatch[1]}"`);

  // 2.4.2 Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) fail('2.4.2', 'Missing or empty <title>');
  else pass('2.4.2', `title="${titleMatch[1].trim().slice(0, 60)}"`);

  // 2.4.1 Skip link
  if (!html.includes('skip-link')) fail('2.4.1', 'No skip link');
  else pass('2.4.1', 'Skip link present');

  // 4.1.1 Landmarks
  if (!html.match(/<main[\s>]/i)) fail('4.1.1', 'No <main> element');
  else pass('4.1.1', '<main> present');
  if (!html.match(/<header[\s>]/i)) warn('1.3.1', 'No <header> element');
  if (!html.match(/<nav[\s>]/i))    warn('1.3.1', 'No <nav> element');

  const mainEl = html.match(/<main[^>]*>/i)?.[0] || '';
  if (mainEl && !mainEl.includes('role')) pass('4.1.2', '<main> provides implicit role=main');

  // 1.1.1 Alt text
  const imgs = html.match(/<img[^>]*>/gi) || [];
  imgs.forEach(img => {
    if (!hasAttr(img, 'alt')) fail('1.1.1', `<img> with no alt: ${img.slice(0, 80)}`);
  });
  if (imgs.length === 0) pass('1.1.1', 'No images — N/A');

  // 4.1.2 Buttons
  const buttons = allTags(html, 'button');
  buttons.forEach(btn => {
    const text            = innerText(btn);
    const ariaLabel       = attr(btn, 'aria-label');
    const ariaLabelledBy  = attr(btn, 'aria-labelledby');
    if (!text && !ariaLabel && !ariaLabelledBy) {
      fail('4.1.2', `<button> with no accessible name: ${btn.slice(0, 80)}`);
    }
  });
  if (buttons.length > 0) pass('4.1.2', `${buttons.length} button(s) checked`);

  // 4.1.2 Links
  const links = allTags(html, 'a');
  let ambiguousLinks = 0;
  links.forEach(a => {
    const text      = innerText(a).toLowerCase();
    const ariaLabel = attr(a, 'aria-label');
    if (!text && !ariaLabel && !hasAttr(a, 'aria-labelledby')) {
      fail('4.1.2', `<a> with no text or aria-label: ${a.slice(0, 80)}`);
    }
    const AMBIGUOUS = ['cliquez ici', 'ici', 'en savoir plus', 'lire la suite', 'click here'];
    if (!ariaLabel && AMBIGUOUS.includes(text)) {
      warn('2.4.4', `Ambiguous link text: "${text}"`);
      ambiguousLinks++;
    }
  });
  if (ambiguousLinks === 0 && links.length > 0) pass('2.4.4', `${links.length} link(s) — unambiguous text`);

  // 2.4.6 Heading hierarchy
  const headings = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map(m => parseInt(m[1]));
  let prevLevel = 0;
  let headingErrors = 0;
  headings.forEach(level => {
    if (level > prevLevel + 1 && prevLevel !== 0) {
      warn('2.4.6', `Level skip: h${prevLevel} → h${level}`);
      headingErrors++;
    }
    prevLevel = level;
  });
  if (headingErrors === 0 && headings.length > 0) pass('2.4.6', `${headings.length} heading(s) — correct hierarchy`);

  // 1.3.1 Tables
  const tables = allTags(html, 'table');
  tables.forEach(table => {
    if (!table.includes('<th') && table.includes('<td')) warn('1.3.1', 'Table with no <th>');
  });
  if (tables.length > 0) pass('1.3.1', `${tables.length} table(s) checked`);

  // 3.3.2 Labels
  const inputs = html.match(/<input[^>]*>/gi) || [];
  inputs.forEach(input => {
    const type = attr(input, 'type') || 'text';
    if (['hidden', 'submit', 'reset', 'button', 'image'].includes(type)) return;
    const id            = attr(input, 'id');
    const ariaLabel     = attr(input, 'aria-label');
    const ariaLabelledBy= attr(input, 'aria-labelledby');
    const hasLabel      = id && html.includes(`for="${id}"`);
    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      warn('3.3.2', `<input type="${type}"> with no label (id=${id || 'missing'})`);
    }
  });

  // 2.4.7 Focus visible
  if (SITE_CSS.includes(':focus-visible')) pass('2.4.7', ':focus-visible defined in site.css');
  else fail('2.4.7', ':focus-visible missing from CSS');

  // 2.4.11 Focus not obscured
  const stickyHeader = SITE_CSS.match(/\.site-header\s*\{[^}]*position:\s*fixed/s);
  if (stickyHeader) {
    if (SITE_CSS.includes('scroll-padding') || SITE_CSS.includes('scroll-margin')) {
      pass('2.4.11', 'Fixed header + scroll-padding present');
    } else {
      warn('2.4.11', 'Fixed header with no scroll-padding-top — focus potentially obscured');
    }
  }

  // 2.4.13 Focus appearance
  const focusOutline = SITE_CSS.match(/focus-visible\s*\{[^}]*outline:\s*(\d+)px/);
  if (focusOutline) {
    const px = parseInt(focusOutline[1]);
    if (px >= 2) pass('2.4.13', `outline: ${px}px on :focus-visible (≥ 2px required)`);
    else fail('2.4.13', `outline: ${px}px — below the 2px required by WCAG 2.2`);
  } else {
    warn('2.4.13', ':focus-visible outline not detected — manual check required');
  }

  // 2.5.8 Target size
  const btnPaddingY = SITE_CSS.match(/\.ds-btn\s*\{[^}]*padding/s);
  if (btnPaddingY) pass('2.5.8', '.ds-btn buttons: height ≈ 36px (> 24px minimum)');

  // 2.5.3 Label in name
  const btnsWithAriaLabel = [...html.matchAll(/<button[^>]+aria-label="([^"]*)"[^>]*>([^<]*)</gi)];
  btnsWithAriaLabel.forEach(m => {
    const ariaLabel   = m[1].toLowerCase();
    const visibleText = m[2].toLowerCase().trim();
    if (visibleText && !ariaLabel.includes(visibleText)) {
      warn('2.5.3', `aria-label "${m[1]}" doesn't contain the visible text "${m[2].trim()}"`);
    }
  });

  // 4.1.2 Valid ARIA
  const ariaSelectedElems = [...html.matchAll(/aria-selected="([^"]*)"/gi)];
  ariaSelectedElems.forEach(m => {
    if (!['true', 'false'].includes(m[1])) {
      fail('4.1.2', `aria-selected="${m[1]}" — must be "true" or "false"`);
    }
  });

  // Unique IDs — strip <pre>/<code> to avoid false positives in code examples
  const htmlForIds = html
    .replace(/<pre[\s\S]*?<\/pre>/gi, '<pre></pre>')
    .replace(/<code[\s\S]*?<\/code>/gi, '<code></code>');
  const idMatches = [...htmlForIds.matchAll(/\bid="([^"]*)"/gi)].map(m => m[1]);
  const idCounts = {};
  idMatches.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
  Object.entries(idCounts).forEach(([id, count]) => {
    if (count > 1) fail('4.1.1', `id="${id}" duplicated (${count} times)`);
  });
  const uniqueIds = Object.keys(idCounts).filter(k => idCounts[k] === 1);
  if (uniqueIds.length > 0 && Object.values(idCounts).every(c => c === 1)) {
    pass('4.1.1', `${uniqueIds.length} ID(s) — all unique`);
  }

  return { violations, warnings, passed };
}

// ─── CONTRAST AUDIT ─────────────────────────────────────────────────────────
function auditContrast() {
  return CONTRAST_PAIRS.map(([fg, bg, label, required]) => ({
    fg, bg, label, required,
    ratio: cr(fg, bg),
    pass:  cr(fg, bg) >= required,
  }));
}

// ─── PAGE COLLECTION ────────────────────────────────────────────────────────
function collectPages(excludeFile) {
  const pages = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
      const fp = path.join(dir, f);
      if (fs.statSync(fp).isDirectory()) walk(fp);
      else if (f.endsWith('.html') && fp !== excludeFile) pages.push(fp);
    });
  }
  walk(DIST);
  return pages;
}

// ─── FULL RUN ───────────────────────────────────────────────────────────────
function runAudit({ excludeFile } = {}) {
  const SITE_CSS = getSiteCSS();
  const pages    = collectPages(excludeFile);
  const timestamp = new Date();

  let totalViolations = 0;
  let totalWarnings   = 0;
  let totalPassed     = 0;
  const allViolations = [];
  const allWarnings   = [];

  pages.forEach(fp => {
    const html   = fs.readFileSync(fp, 'utf8');
    const rel    = path.relative(DIST, fp);
    const result = auditPage(html, rel, SITE_CSS);

    totalViolations += result.violations.length;
    totalWarnings   += result.warnings.length;
    totalPassed     += result.passed.length;
    allViolations.push(...result.violations.map(v => ({ ...v, file: rel })));
    allWarnings.push(...result.warnings.map(w => ({ ...w, file: rel })));
  });

  // Contrast
  const contrastResults = auditContrast();
  const failedContrast  = contrastResults.filter(r => !r.pass);
  totalViolations += failedContrast.length;

  // Focus info
  const focusRule      = SITE_CSS.match(/\*:focus-visible\s*\{([^}]*)\}/s)?.[1] || '';
  const focusOutlinePx = focusRule.match(/outline:\s*(\d+)px/)?.[1] ?? null;
  const focusOutlineColor = focusRule.match(/outline:[^;]*solid\s+(var\([^)]+\)|#[0-9a-f]+)/i)?.[1] ?? null;

  return {
    timestamp,
    pageCount: pages.length,
    totalViolations,
    totalWarnings,
    totalPassed,
    allViolations,
    allWarnings,
    contrastResults,
    focusOutlinePx: focusOutlinePx ? parseInt(focusOutlinePx) : null,
    focusOutlineColor,
  };
}

// ─── MANUAL CRITERIA ────────────────────────────────────────────────────────
const MANUAL_CHECKS = [
  { criterion: '1.4.1',  titleFr: 'Usage de la couleur',          titleEn: 'Use of Colour',
    descFr: 'Les erreurs ne sont pas signalées par la couleur seule (texte + icône + couleur).',
    descEn: 'Errors are not conveyed by colour alone (text + icon + colour).' },
  { criterion: '1.4.4',  titleFr: 'Redimensionnement du texte',   titleEn: 'Resize Text',
    descFr: 'Tester à 200% de zoom — pas de perte de contenu ni de fonctionnalité.',
    descEn: 'Test at 200% zoom — no content or functionality loss.' },
  { criterion: '1.4.10', titleFr: 'Redistribution (Reflow)',       titleEn: 'Reflow',
    descFr: 'Tester à 320px — pas de défilement horizontal requis.',
    descEn: 'Test at 320px — no horizontal scroll required.' },
  { criterion: '1.4.12', titleFr: 'Espacement du texte',           titleEn: 'Text Spacing',
    descFr: 'Tester avec line-height ≥ 1.5, letter-spacing ≥ 0.12em, word-spacing ≥ 0.16em.',
    descEn: 'Test with line-height ≥ 1.5, letter-spacing ≥ 0.12em, word-spacing ≥ 0.16em.' },
  { criterion: '2.1.1',  titleFr: 'Navigation clavier',            titleEn: 'Keyboard',
    descFr: 'Tester Tab / Shift+Tab / Entrée / Espace sur tous les contrôles interactifs.',
    descEn: 'Test Tab / Shift+Tab / Enter / Space on all interactive controls.' },
  { criterion: '2.1.2',  titleFr: 'Pas de piège clavier',          titleEn: 'No Keyboard Trap',
    descFr: 'Aucune zone ne bloque la navigation clavier.',
    descEn: 'No zone traps keyboard focus.' },
  { criterion: '2.3.1',  titleFr: 'Pas de flash',                  titleEn: 'Three Flashes',
    descFr: 'Aucun contenu ne clignote plus de 3 fois par seconde.',
    descEn: 'No content flashes more than 3 times per second.' },
  { criterion: '2.4.3',  titleFr: 'Ordre de focus',                titleEn: 'Focus Order',
    descFr: 'L\'ordre de tabulation suit l\'ordre visuel logique.',
    descEn: 'Tab order follows the logical visual order.' },
  { criterion: '2.4.11', titleFr: 'Focus non masqué',              titleEn: 'Focus Not Obscured',
    descFr: 'Vérifier que le header fixe ne masque pas l\'indicateur de focus.',
    descEn: 'Verify fixed header doesn\'t obscure the focus indicator.' },
  { criterion: '4.1.3',  titleFr: 'Messages de statut',            titleEn: 'Status Messages',
    descFr: 'Les messages dynamiques sont annoncés par les lecteurs d\'écran (aria-live).',
    descEn: 'Dynamic messages are announced by screen readers (aria-live).' },
];

module.exports = { runAudit, auditPage, auditContrast, collectPages, CONTRAST_PAIRS, MANUAL_CHECKS, DIST };
