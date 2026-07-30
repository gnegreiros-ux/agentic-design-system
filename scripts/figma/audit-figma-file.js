/**
 * Agentica — Figma file health audit
 *
 * NOT a Node.js script. Paste into the `use_figma` tool (or the Figma desktop
 * plugin console) and run per-page — see "How to run" below. Mirrors the
 * convention of the other scripts in this folder (figma-phase3-plugin.js,
 * figma-segmented-plugin.js): hand-pasted, not part of any npm/CI pipeline,
 * because Figma has no first-party way to run a script on save.
 *
 * Consolidates every regression class found during the 2026-07-23 audit
 * session (see .claude/instructions/figma-components.md §26 for the full
 * incident writeups) into one canonical, versioned check instead of five
 * scattered snippets living only in agent memory.
 *
 * Checks:
 *   1. Orphaned/broken variable bindings on fills & strokes (§26.5 + the
 *      2026-07-23 "Agentica — Tokens" ghost-collection incident — ~1600
 *      bindings were found pointing at a collection no longer enumerated by
 *      getLocalVariableCollectionsAsync()).
 *   2. Unbound layout properties (padding/itemSpacing/cornerRadius) inside
 *      COMPONENT / COMPONENT_SET subtrees — these must always resolve to a
 *      component/semantic token, never a raw number (tokens-system.md).
 *   3. Text Style AND raw-node lineHeight unit sanity (§26.1 — PIXELS with a tiny
 *      value is the broken-copy-of-a-unitless-multiplier bug, not a real setting;
 *      extended 2026-07-27 to also scan any TEXT node with a Variable-bound
 *      lineHeight, not just published Text Styles — see the function for why).
 *   4. clipsContent cascading over any node carrying a DROP_SHADOW effect or
 *      an OUTSIDE-aligned stroke, up to the nearest ComponentSet/page.
 *   5. findOverflows — any non-decorative child whose bounds exceed its
 *      direct parent's (§21.A / §25), extended to the whole page-wrapper.
 *   6. Stale text references (§26.9) — any text on any page still spelling
 *      out an OLD name after a rename (e.g. a breadcrumb, eyebrow tag, or
 *      prose mention still saying "INTRO" after the page was renamed to
 *      "GETTING STARTED"). Driven by the KNOWN_RENAMES map below — update it
 *      every time something canonically named (a page, a component, a
 *      pattern) gets renamed as part of the 2026-07 redesign.
 *   7. Broken internal hyperlinks (§26.9) — any text hyperlink of type NODE
 *      whose target node no longer exists (deleted or the ID changed).
 *   8. findWidthMismatches (§26.11) — any top-level page child whose width
 *      doesn't match the page's established main-container width (the mode
 *      across all top-level siblings). Catches a node left at its OLD,
 *      narrower width after being reparented/moved to the page's top level —
 *      the inverse of findOverflows (too NARROW, not too wide), which
 *      findOverflows cannot detect since a narrower child never "exceeds"
 *      its parent's bounds. 2026-07-30 incident: a `note` frame moved from a
 *      nested 1280px content wrapper to the bare page top level kept its old
 *      1280px width instead of the page's 1440px container width, exposing
 *      the #535353 canvas gray on both sides (§13).
 *
 * How to run:
 *   - One page per `use_figma` call (page-switch-once rule). Call
 *     `auditPage(pageId)` after `figma.setCurrentPageAsync(page)`.
 *   - Fan out across all pages in ONE assistant message (N parallel
 *     use_figma calls) per the figma-use skill's multi-page rule — do not
 *     loop pages inside a single script.
 *   - A clean page returns { orphanedVariables: [], unboundComponentProps: [],
 *     brokenLineHeights: [], clippedEffects: [], overflows: [],
 *     staleNameReferences: [], brokenLinks: [], widthMismatches: [] } — every
 *     array empty. Anything else is a regression to fix before calling the
 *     page "done".
 *
 * Example invocation (inside a use_figma script):
 *   const page = await figma.getNodeByIdAsync('35:8');
 *   await figma.setCurrentPageAsync(page);
 *   return await auditPage(page);
 *   // (paste the function bodies below above this call in the same script —
 *   // use_figma does not persist state between calls)
 *
 * Updating references after a rename — applyKnownRenames():
 *   Detection alone doesn't fix anything. Once staleNameReferences flags a
 *   node, either fix it by hand (preferred for anything with mixed styling
 *   or a hyperlink label that needs rewording, not just find/replace) or —
 *   for a simple plain-text swap — call applyKnownRenames(page) to rewrite
 *   every flagged node in one pass. Always re-run auditPage() after to
 *   confirm staleNameReferences is empty, and screenshot anything with
 *   mixed text styling before trusting an automated rewrite.
 */

// ── KNOWN_RENAMES — maintain this whenever something canonically named is
// renamed (page, component, pattern). Old name -> new name. Empty by default;
// add an entry the moment a rename happens, remove it once every reference in
// the file has been confirmed updated (findStaleNameReferences returns clean).
const KNOWN_RENAMES = {
  // 'INTRO': 'GETTING STARTED', // executed + swept clean 2026-07-24 (Phase 0bis, 22/22 pages) — entry retired
};

// ── 1. Orphaned variable bindings ────────────────────────────────────────
async function findOrphanedVariables(page, knownGoodCollectionIds) {
  const cache = new Map();
  async function check(varId) {
    if (cache.has(varId)) return cache.get(varId);
    let result;
    try {
      const v = await figma.variables.getVariableByIdAsync(varId);
      result = !v
        ? { broken: true, reason: 'variable resolves to null (deleted)' }
        : { broken: knownGoodCollectionIds && !knownGoodCollectionIds.has(v.variableCollectionId), name: v.name, collectionId: v.variableCollectionId };
    } catch (e) {
      result = { broken: true, reason: String(e) };
    }
    cache.set(varId, result);
    return result;
  }

  const found = [];
  const allNodes = page.findAll(() => true);
  for (const n of allNodes) {
    for (const prop of ['fills', 'strokes']) {
      if (prop in n && Array.isArray(n[prop])) {
        for (const paint of n[prop]) {
          if (paint.boundVariables && paint.boundVariables.color) {
            const varId = paint.boundVariables.color.id;
            const result = await check(varId);
            if (result.broken) {
              found.push({ nodeId: n.id, nodeName: n.name, prop, varId, reason: result.reason || result.name });
            }
          }
        }
      }
    }
  }
  return found;
}

// ── 2. Unbound layout properties inside components ───────────────────────
function findUnboundComponentProps(page) {
  const found = [];
  const componentRoots = page.findAll((n) => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent?.type !== 'COMPONENT_SET'));
  for (const root of componentRoots) {
    // Exclude the COMPONENT_SET root's own layout — that governs how variants
    // are arranged in Figma's editor canvas, never part of the rendered/
    // instanced design. Only its descendants (the actual variant frames and
    // anything nested inside them, e.g. a "pill" wrapper) count.
    const nodes = root.type === 'COMPONENT_SET' ? root.findAll(() => true) : [root, ...root.findAll(() => true)];
    for (const n of nodes) {
      if (!('layoutMode' in n) || n.layoutMode === 'NONE') continue;
      const bv = n.boundVariables || {};
      const propsToCheck = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
      for (const prop of propsToCheck) {
        const value = n[prop];
        if (typeof value === 'number' && value !== 0 && !bv[prop]) {
          found.push({ nodeId: n.id, nodeName: n.name, componentRoot: root.name, prop, value });
        }
      }
    }
  }
  return found;
}

// ── 3. Text Style AND raw-node lineHeight sanity ──────────────────────────
// Extended 2026-07-27 (ADR-090 follow-up): the original check only scanned published
// Text Styles. It missed `semantic/marketing/typography/display/line-height` — a
// Variable-bound lineHeight on an ad-hoc TEXT node (doc/page-frame's title, built the
// same day) — because Figma always resolves a Variable-bound lineHeight as PIXELS, even
// when the variable stores a unitless multiplier (1.0). That token had never been
// exercised before, so no prior audit ever saw it. Any text node with a lineHeight bound
// to a Variable is equally at risk, not just Text Styles — scan both.
async function findBrokenLineHeights(page) {
  const styles = await figma.getLocalTextStylesAsync();
  const brokenStyles = styles
    .filter((s) => s.lineHeight.unit === 'PIXELS' && s.lineHeight.value < 10)
    .map((s) => ({ kind: 'textStyle', styleId: s.id, styleName: s.name, lineHeight: s.lineHeight }));

  const brokenNodes = [];
  if (page) {
    const textNodes = page.findAll((n) => n.type === 'TEXT' && n.boundVariables && n.boundVariables.lineHeight);
    for (const n of textNodes) {
      if (n.lineHeight && n.lineHeight.unit === 'PIXELS' && n.lineHeight.value < 10) {
        brokenNodes.push({ kind: 'boundNode', nodeId: n.id, nodeName: n.name, lineHeight: n.lineHeight });
      }
    }
  }
  return [...brokenStyles, ...brokenNodes];
}

// ── 4. clipsContent cascading over effects/outside-strokes ───────────────
function findClippedEffects(page) {
  const found = [];
  const withEffectOrOutsideStroke = page.findAll((n) => {
    const hasEffect = 'effects' in n && n.effects && n.effects.some((e) => e.visible !== false);
    const hasOutsideStroke = 'strokes' in n && n.strokes && n.strokes.length && n.strokeAlign === 'OUTSIDE';
    return hasEffect || hasOutsideStroke;
  });
  for (const n of withEffectOrOutsideStroke) {
    let cur = n.parent;
    while (cur && cur.type !== 'PAGE') {
      if ('clipsContent' in cur && cur.clipsContent) {
        found.push({ nodeId: n.id, nodeName: n.name, clippingAncestorId: cur.id, clippingAncestorName: cur.name });
        break;
      }
      cur = cur.parent;
    }
  }
  return found;
}

// ── 5. Overflow (parent/child bounds) ─────────────────────────────────────
function findOverflows(root) {
  const overflows = [];
  function walk(n) {
    if (!('children' in n)) return;
    for (const child of n.children) {
      if (child.visible === false) continue;
      if ('absoluteBoundingBox' in child && 'absoluteBoundingBox' in n) {
        const cb = child.absoluteBoundingBox;
        const pb = n.absoluteBoundingBox;
        if (cb && pb) {
          const overflowsRight = cb.x + cb.width > pb.x + pb.width + 0.5;
          const overflowsBottom = cb.y + cb.height > pb.y + pb.height + 0.5;
          if ((overflowsRight || overflowsBottom) && n.type !== 'GROUP') {
            overflows.push({ nodeId: child.id, nodeName: child.name, parentId: n.id, parentName: n.name, overflowsRight, overflowsBottom });
          }
        }
      }
      walk(child);
    }
  }
  walk(root);
  return overflows;
}

// ── 6. Stale text references after a rename ───────────────────────────────
function findStaleNameReferences(page, renameMap) {
  renameMap = renameMap || KNOWN_RENAMES;
  const oldNames = Object.keys(renameMap).filter(Boolean);
  if (oldNames.length === 0) return [];

  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = oldNames.map((oldName) => ({
    oldName,
    newName: renameMap[oldName],
    re: new RegExp('(^|[^\\p{L}\\p{N}_])' + escapeRe(oldName) + '([^\\p{L}\\p{N}_]|$)', 'iu'),
  }));

  const found = [];
  const textNodes = page.findAll((n) => n.type === 'TEXT');
  for (const n of textNodes) {
    const text = n.characters || '';
    for (const p of patterns) {
      if (p.re.test(text)) {
        found.push({ nodeId: n.id, nodeName: n.name, oldName: p.oldName, newName: p.newName, text: text.slice(0, 120) });
      }
    }
  }
  return found;
}

// Rewrites every plain-text occurrence flagged by findStaleNameReferences.
// Deliberate, not run automatically by auditPage() — call it yourself once
// you've confirmed a straight find/replace is safe for the flagged nodes
// (skip anything with mixed styling or a hyperlink label that needs
// rewording rather than swapping). Always screenshot + re-audit after.
async function applyKnownRenames(page, renameMap) {
  renameMap = renameMap || KNOWN_RENAMES;
  const flagged = findStaleNameReferences(page, renameMap);
  const results = [];
  for (const item of flagged) {
    const n = await figma.getNodeByIdAsync(item.nodeId);
    if (!n) { results.push({ ...item, applied: false, reason: 'node no longer exists' }); continue; }
    try {
      const fonts = n.getRangeAllFontNames(0, n.characters.length);
      for (const f of fonts) await figma.loadFontAsync(f);
      const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('(^|[^\\p{L}\\p{N}_])' + escapeRe(item.oldName) + '([^\\p{L}\\p{N}_]|$)', 'gu');
      n.characters = n.characters.replace(re, (_, pre, post) => pre + item.newName + post);
      results.push({ ...item, applied: true });
    } catch (e) {
      results.push({ ...item, applied: false, reason: String(e) });
    }
  }
  return results;
}

// ── 7. Broken internal hyperlinks ──────────────────────────────────────────
async function findBrokenLinks(page) {
  const found = [];
  const textNodes = page.findAll((n) => n.type === 'TEXT');
  for (const n of textNodes) {
    let segments;
    try {
      segments = n.getStyledTextSegments(['hyperlink']);
    } catch (e) {
      continue;
    }
    for (const seg of segments) {
      if (!seg.hyperlink || seg.hyperlink.type !== 'NODE') continue;
      const target = await figma.getNodeByIdAsync(seg.hyperlink.value);
      if (!target) {
        found.push({ nodeId: n.id, nodeName: n.name, linkText: seg.characters, targetId: seg.hyperlink.value, reason: 'target node no longer exists' });
      }
    }
  }
  return found;
}

// ── 8. Top-level width mismatches — content orphaned from the main container ─
// Never let a top-level page child sit at a width narrower (or wider) than the
// page's established main-container width. This is the under-width counterpart
// to findOverflows(): a child that is TOO NARROW never "exceeds" its parent's
// bounds, so findOverflows can't see it — but it still leaves the #535353
// canvas gray (§13) visible on the sides, exactly like an overflow does.
// Excludes `_trash`/`_`-prefixed decor (never live content) — every real
// section on this site is a full-width band per §25.
function findWidthMismatches(page) {
  const candidates = page.children.filter(
    (c) => c.visible !== false && !c.name.startsWith('_') && 'width' in c
  );
  if (candidates.length < 2) return [];

  const counts = new Map();
  for (const c of candidates) counts.set(c.width, (counts.get(c.width) || 0) + 1);
  const mainWidth = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];

  return candidates
    .filter((c) => Math.abs(c.width - mainWidth) > 0.5)
    .map((c) => ({ nodeId: c.id, nodeName: c.name, width: c.width, expectedWidth: mainWidth }));
}

// ── Orchestrator ───────────────────────────────────────────────────────────
async function auditPage(page) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const knownGoodCollectionIds = new Set(collections.map((c) => c.id));

  const rootWrapper = page.children.find((c) => /wrapper/i.test(c.name)) || page;

  return {
    pageName: page.name,
    orphanedVariables: await findOrphanedVariables(page, knownGoodCollectionIds),
    unboundComponentProps: findUnboundComponentProps(page),
    brokenLineHeights: await findBrokenLineHeights(page),
    clippedEffects: findClippedEffects(page),
    overflows: findOverflows(rootWrapper),
    staleNameReferences: findStaleNameReferences(page),
    brokenLinks: await findBrokenLinks(page),
    widthMismatches: findWidthMismatches(page),
  };
}
