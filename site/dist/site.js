
document.addEventListener('DOMContentLoaded', () => {

  // ── Theme toggle ─────────────────────────────────────────
  const prefersDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
  const savedTheme = localStorage.getItem('agtc-theme') || (prefersDark ? 'dark' : 'light');
  // Home page — always dark mode (toggle hidden)
  const isHome = document.documentElement.dataset.page === 'home';
  document.documentElement.setAttribute('data-theme', isHome ? 'dark' : savedTheme);

  function applyThemeImages(theme) {
    document.querySelectorAll('.img-theme-aware[data-src-dark][data-src-light]').forEach(img => {
      img.src = theme === 'dark' ? img.dataset.srcDark : img.dataset.srcLight;
    });
  }
  applyThemeImages(savedTheme);

  document.querySelectorAll('[data-theme-toggle], .theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('agtc-theme', next);
      applyThemeImages(next);
      btn.setAttribute('aria-label', next === 'dark' ? 'Basculer en thème clair / Switch to light theme' : 'Basculer en thème sombre / Switch to dark theme');
      if (btn.classList.contains('theme-btn')) btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
  });

  // ── Animated counters — stat-band only (functional, not decorative) ──
  const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const statBand = document.querySelector('.stat-band');
  if (statBand && 'IntersectionObserver' in window) {
    const animateCounter = (el, target, duration) => {
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const start = performance.now();
      const update = now => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (t < 1) requestAnimationFrame(update);
      };
      update(performance.now());
    };
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statBand.querySelectorAll('[data-count]').forEach(el =>
          animateCounter(el, parseInt(el.dataset.count, 10), 1200));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(statBand);
  }

  // ── Language toggle ─────────────────────────────────────
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const savedLang = urlLang || sessionStorage.getItem('agtc-lang') || 'en';
  document.documentElement.setAttribute('data-lang', savedLang);
  // Language toggle — consumes the .agtc-segmented control (ADR-044).
  // .lang-switch button selector: targets the header switcher (not <html data-lang>
  // nor the segmented demos on the component page).
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.setAttribute('aria-current', btn.dataset.lang === savedLang ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      document.documentElement.setAttribute('data-lang', lang);
      sessionStorage.setItem('agtc-lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url.toString());
      document.querySelectorAll('.lang-switch button').forEach(b => b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false'));
      // Update copy button labels when language switches
      document.querySelectorAll('.code-copy').forEach(b => { if (!b.textContent.includes('!')) b.textContent = lang === 'en' ? 'Copy' : 'Copier'; });
      buildToc();
    });
  });

  // ── Language toggle .lang-btn (Redesign/site.css) ───────────────────────
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const on = btn.dataset.lang === savedLang;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      document.documentElement.setAttribute('data-lang', lang);
      sessionStorage.setItem('agtc-lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url.toString());
      document.querySelectorAll('.lang-btn').forEach(b => {
        const a = b.dataset.lang === lang;
        b.classList.toggle('active', a);
        b.setAttribute('aria-pressed', a ? 'true' : 'false');
      });
      document.querySelectorAll('.code-copy').forEach(b => { if (!b.textContent.includes('!')) b.textContent = lang === 'en' ? 'Copy' : 'Copier'; });
      buildToc();
    });
  });

  // ── Sidebar drawer (mobile) ──────────────────────────────
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.getElementById('site-sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  if (sidebarToggle && sidebar) {
    sidebarToggle.removeAttribute('hidden');
    const openDrawer = () => {
      sidebar.classList.add('open');
      sidebarOverlay && sidebarOverlay.classList.add('active');
      sidebarToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
      sidebar.classList.remove('open');
      sidebarOverlay && sidebarOverlay.classList.remove('active');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    sidebarOverlay && sidebarOverlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeDrawer();
    });
    sidebar.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });
  }

  // ── Active sidebar links ──────────────────────────────────
  // Note: agtc-top-nav handles aria-current="page" internally (ADR-060).
  const p = window.location.pathname;
  document.querySelectorAll('.sidebar a').forEach(a => {
    if (p.endsWith(a.getAttribute('href')?.split('/').pop() || '')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // ── TOC auto-generation ──────────────────────────────────
  // A named, re-callable function: bilingual ADR pages (ADR-071) wrap each language's
  // full body — headings included — in a block-level .lang-en/.lang-fr div (unlike the
  // rest of the site's inline per-heading spans), so switching language changes which
  // <h2> elements are actually visible. offsetParent filters to only the ones currently
  // rendered, and re-running this on every language toggle (not just once at load) keeps
  // the TOC in sync instead of going stale — see ADR-071.
  const tocEl = document.getElementById('page-toc');
  let tocObserver = null;
  function buildToc() {
    if (!tocEl) return;
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    tocEl.innerHTML = '';
    const headings = Array.from(document.querySelectorAll('.content h2')).filter(h => h.offsetParent !== null);
    if (headings.length <= 1) return;
    function slugify(t) {
      return t.toLowerCase()
        .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[ïî]/g,'i')
        .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u')
        .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    }
    const title = document.createElement('span');
    title.className = 'toc-title';
    title.innerHTML = '<span class="lang-fr">Sur cette page</span><span class="lang-en">On this page</span>';
    tocEl.appendChild(title);
    headings.forEach(h => {
      const frSpan = h.querySelector('.lang-fr');
      const enSpan = h.querySelector('.lang-en');
      const frText = frSpan ? frSpan.textContent : h.textContent;
      if (!h.id) h.id = slugify(frText);
      const a = document.createElement('a');
      a.href = '#' + h.id;
      if (frSpan && enSpan) {
        a.innerHTML = '<span class="lang-fr">' + frSpan.textContent + '</span><span class="lang-en">' + enSpan.textContent + '</span>';
      } else {
        a.textContent = h.textContent;
      }
      tocEl.appendChild(a);
    });
    // Active tracking
    const tocLinks = tocEl.querySelectorAll('a');
    tocObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const active = tocEl.querySelector('a[href="#' + e.target.id + '"]');
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-10px 0px -80% 0px' });
    headings.forEach(h => tocObserver.observe(h));
  }
  buildToc();

  // ── Token search ─────────────────────────────────────────
  const search = document.getElementById('token-search');
  const searchStatus = document.getElementById('token-search-status');
  if (search) {
    let debounceTimer;
    const runFilter = () => {
      const q = search.value.trim().toLowerCase();
      let totalVisible = 0;
      document.querySelectorAll('.token-section').forEach(section => {
        let sectionVisible = 0;
        section.querySelectorAll('.token-row').forEach(row => {
          const match = !q || row.textContent.toLowerCase().includes(q);
          row.style.display = match ? '' : 'none';
          if (match) sectionVisible++;
        });
        totalVisible += sectionVisible;
        section.style.display = sectionVisible === 0 && q ? 'none' : '';
      });
      if (searchStatus) {
        if (!q) {
          searchStatus.textContent = '';
        } else {
          const lang = document.documentElement.getAttribute('data-lang') || 'en';
          searchStatus.textContent = lang === 'fr'
            ? totalVisible + ' token' + (totalVisible !== 1 ? 's' : '') + ' trouvé' + (totalVisible !== 1 ? 's' : '')
            : totalVisible + ' token' + (totalVisible !== 1 ? 's' : '') + ' found';
        }
      }
    };
    search.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runFilter, 120);
    });
    search.addEventListener('search', runFilter);
  }

  // ── Code blocks: language label + accessible copy button (ADR-041) ──────────
  // Single shared live region to announce "Copied!" to screen readers.
  let copyLive = document.getElementById('agtc-copy-live');
  if (!copyLive) {
    copyLive = document.createElement('span');
    copyLive.id = 'agtc-copy-live';
    copyLive.setAttribute('role', 'status');
    copyLive.setAttribute('aria-live', 'polite');
    Object.assign(copyLive.style, {position:'absolute',width:'1px',height:'1px',padding:'0',margin:'-1px',overflow:'hidden',clip:'rect(0 0 0 0)',whiteSpace:'nowrap',border:'0'});
    document.body.appendChild(copyLive);
  }

  document.querySelectorAll('pre.code-block').forEach(pre => {
    const code = pre.querySelector('code');

    // Language label from the lang-xxx class (CD5)
    const langClass = [...(code?.classList || [])].find(c => c.startsWith('lang-'));
    const lang = langClass ? langClass.slice(5) : '';
    if (lang) {
      const tag = document.createElement('span');
      tag.className = 'code-lang';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = lang;
      pre.classList.add('has-lang');
      pre.appendChild(tag);
    }

    // Bouton copier accessible (CD2/CD3/CD4)
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    const copyLabel = () => document.documentElement.getAttribute('data-lang') === 'en' ? 'Copy' : 'Copier';
    btn.textContent = copyLabel();
    btn.setAttribute('aria-label', (document.documentElement.getAttribute('data-lang') === 'en' ? 'Copy code' : 'Copier le code') + (lang ? ' (' + lang + ')' : ''));
    pre.appendChild(btn);
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText((code?.textContent || '').replace(/^\n+|\n+$/g, '')); }
      catch { return; }
      const copiedLabel = document.documentElement.getAttribute('data-lang') === 'en' ? 'Copied!' : 'Copié !';
      btn.textContent = copiedLabel;
      copyLive.textContent = copiedLabel;
      setTimeout(() => { btn.textContent = copyLabel(); copyLive.textContent = ''; }, 1600);
    });
  });

  // ── Reveal on scroll ──────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(el => revealObs.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  // ── Bouton retour en haut (V2 — threshold 600px, classe is-visible) ─────────
  const backToTop = document.querySelector('[data-back-to-top]');
  if (backToTop) {
    const setBackToTopState = () => {
      const visible = window.scrollY > window.innerHeight;
      backToTop.classList.toggle('is-visible', visible);
    };
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', setBackToTopState, { passive: true });
    setBackToTopState();
  }

  // ── Megapanel Documentation (V2) ─────────────────────────────────────────
  const docsTrigger = document.querySelector('[data-docs-trigger]');
  const docsPanel   = document.querySelector('[data-docs-panel]');
  if (docsTrigger && docsPanel) {
    const closeDocs = () => {
      docsTrigger.setAttribute('aria-expanded', 'false');
      docsPanel.classList.remove('is-open');
      docsPanel.hidden = true;
    };
    const openDocs = () => {
      docsTrigger.setAttribute('aria-expanded', 'true');
      docsPanel.hidden = false;
      requestAnimationFrame(() => docsPanel.classList.add('is-open'));
    };
    docsTrigger.addEventListener('click', () => {
      closeDocs(); // ferme le panel et laisse le href naviguer vers documentation.html
    });
    docsTrigger.addEventListener('mouseenter', openDocs);
    docsPanel.addEventListener('mouseenter', openDocs);
    document.addEventListener('pointerdown', e => {
      if (!docsPanel.contains(e.target) && !docsTrigger.contains(e.target)) closeDocs();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDocs(); docsTrigger.focus(); }
    });
  }

  // ── Mobile menu ───────────────────────────────────────────────────────────
  const v2MenuToggle = document.querySelector('[data-menu-toggle]');
  const v2MainNav    = document.querySelector('[data-main-nav]');
  if (v2MenuToggle && v2MainNav) {
    v2MenuToggle.addEventListener('click', () => {
      const isOpen = v2MenuToggle.getAttribute('aria-expanded') === 'true';
      v2MenuToggle.setAttribute('aria-expanded', String(!isOpen));
      v2MainNav.classList.toggle('is-open', !isOpen);
    });
    v2MainNav.addEventListener('click', e => {
      if (e.target.closest('a')) {
        v2MenuToggle.setAttribute('aria-expanded', 'false');
        v2MainNav.classList.remove('is-open');
      }
    });
  }

  // ── Scroll reveal V2 ([data-reveal] → .is-visible) ───────────────────────
  const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealItems.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObs.unobserve(e.target); }
        });
      }, { threshold: 0.16 });
      revealItems.forEach(el => revealObs.observe(el));
    } else {
      revealItems.forEach(el => el.classList.add('is-visible'));
    }
  }

  // ── Lazy-load of SVG illustrations (P1 perf — outside the initial HTML) ──
  // SVGs are loaded and injected inline → CSS custom properties (dark mode) preserved.
  const lazyIllusEls = document.querySelectorAll('.illus-lazy[data-svg]');
  if (lazyIllusEls.length && 'IntersectionObserver' in window) {
    const illusObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        fetch(el.dataset.svg)
          .then(r => r.ok ? r.text() : '')
          .then(svg => { if (svg) { el.innerHTML = svg; el.removeAttribute('data-svg'); } })
          .catch(() => {});
        illusObs.unobserve(el);
      });
    }, { rootMargin: '400px' });
    lazyIllusEls.forEach(el => illusObs.observe(el));
  }
});
