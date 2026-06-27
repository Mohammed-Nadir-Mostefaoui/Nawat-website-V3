/* ================================================================
   NAWAT STUDIO — script.js
   Digital Product Design Studio | نواة ستوديو
   ================================================================ */

'use strict';

/* ── Utility ────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Module-level state ─────────────────────────────────────────── */
let manifestoProcessed = false;

/* ================================================================
   THEME TOGGLE (Light / Dark)
   ================================================================ */
const THEME_KEY = 'nawat-theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || 'light');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ================================================================
   LANGUAGE SWITCHER (AR / EN / FR)
   ================================================================ */
const LANG_KEY = 'nawat-lang';

function initLang() {
  const saved = localStorage.getItem(LANG_KEY) || 'ar';
  applyLang(saved, false);
}

function applyLang(lang, save = true) {
  const html = document.documentElement;

  // Set HTML attributes
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  html.setAttribute('data-lang', lang);

  // Update language buttons
  $$('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langBtn === lang);
  });

  // Update font for body
  document.body.style.fontFamily = lang === 'ar'
    ? "'IBM Plex Sans Arabic', sans-serif"
    : "'IBM Plex Sans', sans-serif";

  // Update localised <select> options
  $$('select[data-opts-' + lang + ']').forEach(sel => {
    const opts = sel.getAttribute('data-opts-' + lang).split(',');
    [...sel.options].forEach((opt, i) => {
      if (opts[i] !== undefined) opt.text = opts[i];
    });
  });

  // Re-build manifesto words in the new language
  if (manifestoProcessed) {
    $$('.word').forEach(w => w.classList.remove('revealed'));
    processManifesto();
    // If manifesto is currently visible, reveal new words immediately
    const manifestoEl = $('.manifesto');
    if (manifestoEl) {
      const rect = manifestoEl.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        $$('.word', manifestoEl).forEach(w => w.classList.add('revealed'));
      }
    }
  }

  if (save) localStorage.setItem(LANG_KEY, lang);

  // Rebuild ticker in the new language
  buildTicker(lang);

  // Slide the lang pill to the new active button
  requestAnimationFrame(() => {
    const pill   = document.getElementById('langPill');
    const active = document.querySelector('.lang-btn.active');
    if (!pill || !active) return;
    const swRect    = active.closest('.lang-switcher').getBoundingClientRect();
    const btnRect   = active.getBoundingClientRect();
    pill.style.left  = (btnRect.left - swRect.left) + 'px';
    pill.style.width = btnRect.width + 'px';
  });
}

/* ================================================================
   NAVIGATION — Scroll behaviour
   ================================================================ */
function initNav() {
  const nav = $('.nav');
  if (!nav) return;

  const onScroll = () => {
    // Frosted glass state
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ================================================================
   WORK NAV DROPDOWN
   ================================================================ */
function initNavWork() {
  const wrap    = $('#navWork');
  const panel   = $('#navWorkPanel');
  const trigger = $('#navWorkTrigger');
  if (!wrap || !panel || !trigger) return;

  // Close panel when user clicks outside the dropdown
  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('open');
    }
  });

  // Escape key closes panel
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') wrap.classList.remove('open');
  });

  // "View All Work" link in footer closes panel and scrolls
  const viewAll = panel.querySelector('.nwp-view-all');
  if (viewAll) {
    viewAll.addEventListener('click', () => wrap.classList.remove('open'));
  }

  // Trigger link also closes panel when clicked
  trigger.addEventListener('click', () => wrap.classList.remove('open'));
}

/* ================================================================
   MOBILE MENU
   ================================================================ */
function initMobileMenu() {
  const toggle = $('#mobileToggle');
  const menu   = $('#mobileMenu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on any link click inside the mobile menu
  $$('.mobile-menu a').forEach(el => {
    el.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
}

/* ================================================================
   LANG PILL — animated sliding indicator
   ================================================================ */
function initLangPill() {
  const pill = $('#langPill');
  if (!pill) return;

  function movePill() {
    const active = document.querySelector('.lang-btn.active');
    if (!active) return;
    const switcher   = active.closest('.lang-switcher');
    const swRect     = switcher.getBoundingClientRect();
    const btnRect    = active.getBoundingClientRect();
    pill.style.left  = (btnRect.left - swRect.left) + 'px';
    pill.style.width = btnRect.width + 'px';
  }

  // Move on every lang change
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => requestAnimationFrame(movePill));
  });

  // Initial position (after layout)
  requestAnimationFrame(movePill);
}

/* ================================================================
   ACTIVE SECTION TRACKER — highlights nav link for visible section
   ================================================================ */
function initSectionTracker() {
  // Map section IDs → nav link hrefs
  const sectionMap = {
    'services'  : '[href="#services"]',
    'work'      : '[href="#work"], .nav-work-trigger',
    'process'   : '[href="#process"]',
    'manifesto' : '[href="#manifesto"]',
  };

  const navLinks = $$('.nav-links .nav-link, .nav-links .nav-work-trigger');

  function setActive(id) {
    navLinks.forEach(l => l.classList.remove('active'));
    if (!id || !sectionMap[id]) return;
    document.querySelectorAll(sectionMap[id]).forEach(l => l.classList.add('active'));
  }

  const sections = Object.keys(sectionMap)
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    // Find the section most visible in the viewport
    let best = null, bestRatio = 0;
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > bestRatio) {
        bestRatio = e.intersectionRatio;
        best      = e.target.id;
      }
    });
    if (best) setActive(best);
  }, {
    threshold: [0.2, 0.5],
    rootMargin: '-10% 0px -10% 0px'
  });

  sections.forEach(s => observer.observe(s));
}

/* ================================================================
   HERO PARTICLES
   ================================================================ */
function initParticles() {
  const container = $('#heroParticles');
  if (!container) return;

  const count = 8;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 20}%;
      --dur: ${6 + Math.random() * 10}s;
      --delay: ${Math.random() * 8}s;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    container.appendChild(p);
  }
}

/* ================================================================
   SCROLL REVEAL — Intersection Observer
   ================================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$('.reveal, .reveal-left').forEach(el => observer.observe(el));

  // Service cards — observe the grid, reveal all at once with CSS delays
  const servicesGrid = $('.services-grid');
  if (servicesGrid) {
    const serviceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            $$('.service-card').forEach(el => el.classList.add('visible'));
            serviceObserver.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    serviceObserver.observe(servicesGrid);
  }

  // Work cards — observe the work grid, reveal all at once with CSS delays
  const workGrid = $('.work-grid');
  if (workGrid) {
    const workObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            $$('.work-card').forEach(el => el.classList.add('visible'));
            workObserver.disconnect();
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -60px 0px' }
    );
    workObserver.observe(workGrid);
  }

  // Other staggered cards (team, etc.)
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const idx = parseInt(el.dataset.idx || 0);
          setTimeout(() => el.classList.add('visible'), idx * 80);
          cardObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.team-card').forEach((el, i) => {
    el.dataset.idx = i;
    el.classList.add('reveal');
    cardObserver.observe(el);
  });
}

/* ================================================================
   MANIFESTO — Word-by-Word Reveal
   ================================================================ */
function processManifesto() {
  const lines = $$('.manifesto-line');
  if (!lines.length) return;

  const lang = document.documentElement.getAttribute('data-lang') || 'ar';

  lines.forEach((line, lineIdx) => {
    const isAccent = line.classList.contains('accent');
    const text = line.dataset[lang] || line.dataset.ar || '';
    const words = text.split(' ').filter(Boolean);

    line.innerHTML = '';

    const lineDelay = lineIdx * 150;

    words.forEach((word, wordIdx) => {
      const span = document.createElement('span');
      span.className = 'word';
      if (isAccent) span.classList.add('word-accent');
      span.textContent = word;
      if (wordIdx > 0) {
        line.appendChild(document.createTextNode(' '));
      }
      span.style.transitionDelay = `${lineDelay + wordIdx * 70}ms`;
      line.appendChild(span);
    });
  });

  manifestoProcessed = true;
}

function initManifesto() {
  const manifesto = $('.manifesto');
  if (!manifesto) return;

  processManifesto();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const words = $$('.word', manifesto);
        if (entry.isIntersecting) {
          words.forEach(w => w.classList.add('revealed'));
        } else {
          words.forEach(w => w.classList.remove('revealed'));
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
  );

  observer.observe(manifesto);
}

/* ================================================================
   PROCESS STEPS — Reveal
   ================================================================ */
function initProcess() {
  const grid = $('.process-grid');
  if (!grid) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.process-step', grid).forEach((step, i) => {
            setTimeout(() => step.classList.add('visible'), i * 150);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(grid);
}

/* ================================================================
   TICKER — Auto scroll
   ================================================================ */
/* Same concepts from the original ticker, translated per language */
const TICKER_ITEMS = {
  ar: ['الهوية البصرية', 'مكتبة التصميم', 'تجربة المستخدم', 'النمذجة التفاعلية', 'اختبار المستخدم', 'تصميم المنتج', 'الاستراتيجية الرقمية', 'نظام التصميم', 'nawat.studio', 'MENA · Global'],
  en: ['Visual Identity', 'Design Library', 'UX Design', 'Interactive Prototyping', 'User Testing', 'Product Design', 'Digital Strategy', 'Design System', 'nawat.studio', 'MENA · Global'],
  fr: ['Identité Visuelle', 'Bibliothèque Design', 'Expérience Utilisateur', 'Prototypage Interactif', 'Tests Utilisateurs', 'Design Produit', 'Stratégie Numérique', 'Design System', 'nawat.studio', 'MENA · Global'],
};

function buildTicker(lang) {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const items = TICKER_ITEMS[lang] || TICKER_ITEMS.ar;
  const html = items
    .map(t => `<span class="ticker-item"><span class="ticker-dot"></span>${t}</span>`)
    .join('');
  track.innerHTML = html + html; // double for seamless infinite loop
  // Restart animation cleanly
  track.style.animation = 'none';
  void track.offsetHeight;
  track.style.animation = '';
}

function initTicker() {
  const lang = document.documentElement.getAttribute('data-lang') || 'ar';
  buildTicker(lang);
}

/* ================================================================
   SERVICE CARDS — Click to contact + prefill
   ================================================================ */
function initServiceCards() {
  const select  = $('#ftype');
  const contact = $('#contact');
  if (!select || !contact) return;

  $$('.service-card[data-service]').forEach(card => {
    // Handle both click and Enter/Space for keyboard users
    const activate = () => {
      const value = card.dataset.service;

      // Set the select value
      select.value = value;

      // Dispatch a change event so any listeners (e.g. applyLang) pick it up
      select.dispatchEvent(new Event('change'));

      // Smooth scroll to contact section
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 72;
      const top = contact.getBoundingClientRect().top + window.scrollY - navH - 24;
      window.scrollTo({ top, behavior: 'smooth' });

      // After scroll settles, briefly highlight the select
      setTimeout(() => {
        select.classList.add('prefilled');
        select.focus({ preventScroll: true });
        setTimeout(() => select.classList.remove('prefilled'), 1800);
      }, 700);
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

/* ================================================================
   CONTACT FORM
   ================================================================ */
function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const lang = document.documentElement.getAttribute('data-lang') || 'ar';

    const loadingText = { ar: 'جارٍ الإرسال...', en: 'Sending...', fr: 'Envoi...' };
    const errorText   = { ar: 'حدث خطأ. حاول مجدداً.', en: 'Something went wrong. Please try again.', fr: 'Une erreur est survenue. Réessayez.' };

    btn.disabled = true;
    btn.textContent = loadingText[lang];

    try {
      // ⚠️  Replace the action URL below with your Formspree / backend endpoint
      // e.g. https://formspree.io/f/YOUR_FORM_ID
      const FORM_ENDPOINT = form.getAttribute('action') || '';

      if (!FORM_ENDPOINT) {
        // No endpoint configured — show success in dev/preview
        await new Promise(res => setTimeout(res, 800));
      } else {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error('Network response was not ok');
      }

      form.style.display = 'none';
      if (success) success.classList.add('show');

    } catch (err) {
      console.error('Form submission error:', err);
      btn.disabled = false;
      btn.textContent = errorText[lang];
      // Re-enable after 3 s so user can retry
      setTimeout(() => {
        const spans = form.querySelectorAll('.form-submit .t-ar, .form-submit .t-en, .form-submit .t-fr');
        btn.textContent = '';
        spans.forEach(s => btn.appendChild(s));
      }, 3000);
    }
  });
}

/* ================================================================
   STATS COUNTER ANIMATION
   ================================================================ */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const format = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return n.toString();
  };

  const animateCounter = (el, target, duration = 1800) => {
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(2, -10 * progress);
      const current = Math.round(target * ease);
      el.textContent = format(current) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

/* ================================================================
   BACK TO TOP
   ================================================================ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================================================================
   SMOOTH ANCHOR NAVIGATION
   ================================================================ */
function initSmoothNav() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ================================================================
   CARD HOVER — Subtle 3D tilt (desktop only)
   ================================================================ */
function initCardTilt() {
  // Skip on touch/non-hover devices
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = $$('.work-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
      card.style.transition = 'transform 0.1s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });
}

/* ================================================================
   CURSOR GLOW (Desktop only)
   ================================================================ */
function initCursorGlow() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glow = document.createElement('div');
  glow.id = 'cursorGlow';
  glow.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.5s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let visible = false;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      glow.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    visible = false;
    glow.style.opacity = '0';
  });

  const animate = () => {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    rafId = requestAnimationFrame(animate);
  };

  // Pause RAF loop when tab is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      if (!rafId) animate();
    }
  });

  animate();
}

/* ================================================================
   INIT ALL
   ================================================================ */
function init() {
  initTheme();
  initLang();
  initNav();
  initNavWork();
  initMobileMenu();
  initLangPill();
  initSectionTracker();
  initParticles();
  initScrollReveal();
  initManifesto();
  initProcess();
  initTicker();
  initServiceCards();
  initContactForm();
  initCounters();
  initBackToTop();
  initSmoothNav();
  initCardTilt();
  initCursorGlow();

  // Theme toggle button
  $('#themeToggle')?.addEventListener('click', toggleTheme);

  // Language buttons — trigger radial reveal transition on direction change
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerLangTransition(btn, btn.dataset.langBtn));
  });

}

/* ================================================================
   LTR ↔ RTL RADIAL REVEAL TRANSITION
   ================================================================ */
function triggerLangTransition(btn, langCode) {
  const currentLang = document.documentElement.getAttribute('data-lang');
  const overlay = document.getElementById('langOverlay');

  // If same lang or no overlay element, just apply directly
  if (!overlay || langCode === currentLang) {
    applyLang(langCode);
    return;
  }

  // Only animate when switching direction (AR ↔ EN/FR)
  const currentIsRTL = currentLang === 'ar';
  const newIsRTL = langCode === 'ar';
  const directionChanges = currentIsRTL !== newIsRTL;

  if (!directionChanges) {
    // FR ↔ EN: no direction change, just apply
    applyLang(langCode);
    return;
  }

  // Get origin point from the clicked button
  const rect = btn.getBoundingClientRect();
  const x = Math.round(rect.left + rect.width / 2) + 'px';
  const y = Math.round(rect.top + rect.height / 2) + 'px';
  overlay.style.setProperty('--sweep-x', x);
  overlay.style.setProperty('--sweep-y', y);

  // Phase 1: expand circle to cover page
  overlay.classList.remove('lang-sweep-out');
  overlay.classList.add('lang-sweep-in');

  // Phase 2: at peak coverage, swap language (280ms = sweep-in duration)
  setTimeout(() => {
    applyLang(langCode);

    // Phase 3: contract circle to reveal new layout
    overlay.classList.remove('lang-sweep-in');
    overlay.classList.add('lang-sweep-out');

    setTimeout(() => {
      overlay.classList.remove('lang-sweep-out');
    }, 360); // slightly past the 0.35s animation
  }, 265); // slightly past the 0.28s sweep-in
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
