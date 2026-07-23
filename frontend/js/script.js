(function () {
  'use strict';

  const CONFIG = {
    themeKey: 'recipenest-theme',
    savedKey: 'recipenest-saved-recipes',
    toastDuration: 3200,
    revealSelector: '.fade-in, .recipe-card, .featured-card, .how-card, .activity-item, .sidebar-card, .form-section, .comment, .category-card, .cat-pill, .step-item',
  };

  const state = {
    mouseX: 0.5,
    mouseY: 0.5,
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const debounce = (fn, delay = 160) => {
    let timer = 0;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const injectStyles = () => {
    if (qs('#rn-enhancements-styles')) return;

    const style = document.createElement('style');
    style.id = 'rn-enhancements-styles';
    style.textContent = `
      :root {
        --rn-accent: #c1440e;
        --rn-accent-soft: rgba(193, 68, 14, 0.16);
        --rn-ring: rgba(193, 68, 14, 0.24);
      }

      html { scroll-behavior: smooth; }

      body {
        transition: background-color 260ms ease, color 260ms ease;
      }

      .rn-page-loader,
      .rn-lightbox,
      .rn-toast-container,
      .rn-progress-bar,
      .rn-mobile-toggle,
      .rn-search-suggestions,
      .rn-search-spinner,
      .rn-float-icons,
      .rn-particles,
      .rn-button-ripple {
        pointer-events: none;
      }

      .rn-page-loader {
        position: fixed;
        inset: 0;
        z-index: 9998;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, rgba(255, 250, 245, 0.98), rgba(247, 241, 233, 0.98));
        transition: opacity 280ms ease, visibility 280ms ease;
      }

      .rn-page-loader.is-hidden {
        opacity: 0;
        visibility: hidden;
      }

      .rn-loader-card {
        display: grid;
        gap: 14px;
        justify-items: center;
        padding: 24px 28px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.6);
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
        backdrop-filter: blur(18px);
      }

      .rn-loader-mark {
        width: 54px;
        height: 54px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: linear-gradient(145deg, var(--rn-accent), #f59e0b);
        color: white;
        font-size: 1.35rem;
        box-shadow: 0 16px 32px var(--rn-ring);
        animation: rn-float 1.8s ease-in-out infinite;
      }

      .rn-loader-line {
        width: 180px;
        height: 4px;
        border-radius: 999px;
        background: rgba(193, 68, 14, 0.12);
        overflow: hidden;
      }

      .rn-loader-line::before {
        content: '';
        display: block;
        width: 48%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, var(--rn-accent), transparent);
        animation: rn-loader 1.2s ease-in-out infinite;
      }

      .rn-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9997;
        width: 100%;
        height: 3px;
        background: transparent;
      }

      .rn-progress-bar > span {
        display: block;
        width: 0;
        height: 100%;
        background: linear-gradient(90deg, #c1440e, #f59e0b);
        box-shadow: 0 0 18px rgba(193, 68, 14, 0.45);
      }

      .rn-toast-container {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 9999;
        display: grid;
        gap: 10px;
      }

      .rn-toast {
        min-width: 240px;
        max-width: min(360px, calc(100vw - 36px));
        padding: 12px 14px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.92);
        color: #0f172a;
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.14);
        backdrop-filter: blur(14px);
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: start;
        animation: rn-toast-in 220ms ease, rn-toast-out 240ms ease 2900ms forwards;
      }

      .rn-toast__icon {
        width: 24px;
        height: 24px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: var(--rn-accent-soft);
        color: var(--rn-accent);
        font-size: 0.85rem;
        margin-top: 1px;
      }

      .rn-toast--success .rn-toast__icon { background: rgba(22, 163, 74, 0.15); color: #16a34a; }
      .rn-toast--error .rn-toast__icon { background: rgba(220, 38, 38, 0.15); color: #dc2626; }
      .rn-toast--warning .rn-toast__icon { background: rgba(245, 158, 11, 0.15); color: #d97706; }

      .rn-back-to-top {
        position: fixed;
        right: 20px;
        bottom: 88px;
        z-index: 9998;
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: linear-gradient(145deg, #c1440e, #f59e0b);
        color: white;
        box-shadow: 0 18px 36px rgba(193, 68, 14, 0.28);
        pointer-events: auto;
        opacity: 0;
        transform: translateY(18px) scale(0.92);
        transition: opacity 180ms ease, transform 180ms ease, box-shadow 180ms ease;
      }

      .rn-back-to-top.is-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      .nav.is-sticky {
        position: sticky;
        top: 0;
        z-index: 1000;
        backdrop-filter: blur(18px);
      }

      .nav.is-scrolled {
        background: rgba(255, 250, 245, 0.85);
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      }

      .nav__links {
        transition: max-height 220ms ease, opacity 220ms ease, transform 220ms ease;
      }

      .nav__link.is-active {
        color: var(--rn-accent);
      }

      .rn-reveal {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 520ms ease, transform 520ms ease, filter 520ms ease;
        filter: blur(2px);
      }

      .rn-reveal.is-visible {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }

      .recipe-card,
      .featured-card {
        transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
      }

      .rn-card-hover {
        transform: perspective(900px) rotateX(var(--rn-tilt-x, 0deg)) rotateY(var(--rn-tilt-y, 0deg)) translateY(-4px) scale(1.01);
      }

      .recipe-card__img,
      .featured-card__img,
      .hero__img,
      .profile-banner-img {
        transition: transform 260ms ease, opacity 260ms ease;
      }

      .recipe-card:hover .recipe-card__img,
      .featured-card:hover .featured-card__img,
      .hero__img-wrap:hover .hero__img,
      .profile-banner:hover .profile-banner-img {
        transform: scale(1.05);
      }

      .recipe-card__bookmark,
      #save-btn,
      #featured-save,
      .btn {
        position: relative;
        overflow: hidden;
      }

      .recipe-card__bookmark.is-saved,
      #save-btn.is-saved,
      #featured-save.is-saved {
        animation: rn-pop 260ms ease;
      }

      .rn-heart-burst {
        position: absolute;
        inset: auto auto 0 50%;
        transform: translate(-50%, 0);
        color: #ef4444;
        font-size: 1rem;
        animation: rn-heart-burst 700ms ease-out forwards;
        pointer-events: none;
      }

      .rn-card-placeholder {
        position: relative;
        overflow: hidden;
        background: linear-gradient(100deg, rgba(148, 163, 184, 0.14) 20%, rgba(226, 232, 240, 0.5) 50%, rgba(148, 163, 184, 0.14) 80%);
        background-size: 200% 100%;
        animation: rn-shimmer 1.4s linear infinite;
      }

      .rn-search-suggestions {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        z-index: 40;
        display: none;
        padding: 8px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.12);
        backdrop-filter: blur(16px);
      }

      .rn-search-suggestions.is-open { display: grid; gap: 6px; }

      .rn-search-suggestion {
        pointer-events: auto;
        border: 0;
        border-radius: 14px;
        padding: 10px 12px;
        text-align: left;
        background: transparent;
        color: inherit;
        display: grid;
        gap: 2px;
        transition: background-color 160ms ease, transform 160ms ease;
      }

      .rn-search-suggestion:hover {
        background: rgba(193, 68, 14, 0.08);
        transform: translateX(2px);
      }

      .rn-search-spinner {
        position: absolute;
        right: 14px;
        top: 50%;
        width: 16px;
        height: 16px;
        margin-top: -8px;
        border-radius: 999px;
        border: 2px solid rgba(193, 68, 14, 0.18);
        border-top-color: var(--rn-accent);
        display: none;
        animation: rn-spin 700ms linear infinite;
      }

      .rn-search-spinner.is-visible { display: block; }

      .rn-lightbox {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: grid;
        place-items: center;
        background: rgba(15, 23, 42, 0.82);
        padding: 24px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 220ms ease, visibility 220ms ease;
      }

      .rn-lightbox.is-open {
        opacity: 1;
        visibility: visible;
      }

      .rn-lightbox img {
        max-width: min(1080px, 94vw);
        max-height: 84vh;
        border-radius: 22px;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
        transform: translateY(12px) scale(0.98);
        transition: transform 220ms ease;
      }

      .rn-lightbox.is-open img {
        transform: translateY(0) scale(1);
      }

      .rn-floating-label-wrap {
        position: relative;
      }

      .rn-floating-label-wrap .form-label {
        position: absolute;
        left: 14px;
        top: 14px;
        transition: transform 180ms ease, opacity 180ms ease;
        pointer-events: none;
      }

      .rn-floating-label-wrap.is-focused .form-label,
      .rn-floating-label-wrap.has-value .form-label {
        transform: translateY(-20px) scale(0.9);
        opacity: 0.8;
      }

      .rn-invalid {
        animation: rn-shake 360ms ease;
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
      }

      .rn-valid {
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.08);
        border-color: rgba(34, 197, 94, 0.5) !important;
      }

      .rn-floating-icons,
      .rn-particles {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      .rn-floating-icon,
      .rn-particle {
        position: absolute;
        will-change: transform, opacity;
      }

      .rn-progress-ring {
        --size: 84px;
        --value: 0;
        position: relative;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        background: conic-gradient(var(--rn-accent) calc(var(--value) * 1%), rgba(148, 163, 184, 0.18) 0);
        display: grid;
        place-items: center;
      }

      .rn-progress-ring::before {
        content: '';
        width: calc(var(--size) - 14px);
        height: calc(var(--size) - 14px);
        border-radius: inherit;
        background: var(--background, rgba(255, 255, 255, 0.94));
      }

      .rn-button-loading {
        color: transparent !important;
        pointer-events: none;
      }

      .rn-button-loading::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 14px;
        height: 14px;
        margin: -7px 0 0 -7px;
        border-radius: 999px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: white;
        animation: rn-spin 700ms linear infinite;
      }

      .rn-reply-toggle {
        border: 0;
        background: transparent;
        color: var(--ink-muted, #6b7280);
        padding: 0;
        font-size: 0.82rem;
      }

      .rn-like-pulse { animation: rn-pop 260ms ease; }
      .rn-comment-enter { animation: rn-comment-in 320ms ease; }

      .rn-button-ripple {
        position: absolute;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.35);
        transform: scale(0);
        animation: rn-ripple 600ms ease-out;
        mix-blend-mode: soft-light;
      }

      .rn-nav-links-open {
        opacity: 1 !important;
        transform: translateY(0) !important;
        max-height: 320px !important;
      }

      @keyframes rn-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes rn-loader { 0% { transform: translateX(-120%); } 100% { transform: translateX(240%); } }
      @keyframes rn-toast-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes rn-toast-out { to { opacity: 0; transform: translateY(10px) scale(0.98); } }
      @keyframes rn-pop { 0% { transform: scale(1); } 50% { transform: scale(1.14); } 100% { transform: scale(1); } }
      @keyframes rn-heart-burst { 0% { opacity: 0; transform: translate(-50%, 0) scale(0.4); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -38px) scale(1.2); } }
      @keyframes rn-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      @keyframes rn-spin { to { transform: rotate(360deg); } }
      @keyframes rn-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
      @keyframes rn-comment-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes rn-ripple { to { transform: scale(4); opacity: 0; } }

      @media (max-width: 900px) {
        .nav__actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav__links {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-6px);
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `;

    document.head.appendChild(style);
  };

  const ensureLoader = () => {
    if (qs('.rn-page-loader')) return;
    const loader = document.createElement('div');
    loader.className = 'rn-page-loader';
    loader.innerHTML = `
      <div class="rn-loader-card" role="status" aria-live="polite">
        <div class="rn-loader-mark">🍴</div>
        <div style="font-family:var(--font-serif, Georgia, serif);font-size:1.05rem;letter-spacing:-0.02em;">Loading RecipeNest</div>
        <div class="rn-loader-line"></div>
      </div>
    `;
    document.body.appendChild(loader);
    window.addEventListener('load', () => {
      window.setTimeout(() => loader.classList.add('is-hidden'), 120);
      window.setTimeout(() => loader.remove(), 520);
    }, { once: true });
  };

  const ensureProgressBar = () => {
    if (qs('.rn-progress-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'rn-progress-bar';
    bar.innerHTML = '<span></span>';
    document.body.prepend(bar);
  };

  const updateProgressBar = () => {
    const bar = qs('.rn-progress-bar > span');
    if (!bar) return;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = clamp((window.scrollY / max) * 100, 0, 100);
    bar.style.width = `${progress}%`;
  };

  const ensureToastContainer = () => {
    if (!qs('.rn-toast-container')) {
      const container = document.createElement('div');
      container.className = 'rn-toast-container';
      document.body.appendChild(container);
    }
  };

  const toastIcon = (type) => ({ success: '✓', error: '✕', warning: '!', default: 'i' }[type] || 'i');

  function showToast(message, type = 'default') {
    ensureToastContainer();
    const container = qs('.rn-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `rn-toast rn-toast--${type}`;
    toast.innerHTML = `<span class="rn-toast__icon">${toastIcon(type)}</span><div>${message}</div>`;
    container.appendChild(toast);
    window.setTimeout(() => {
      toast.remove();
      if (!container.childElementCount) container.remove();
    }, CONFIG.toastDuration);
  }
  const openModal = (id) => {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (id) => {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  const bindSmoothScrolling = () => {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const bindScrollUi = () => {
    const nav = qs('.nav');
    const backToTop = document.createElement('button');
    backToTop.className = 'rn-back-to-top';
    backToTop.type = 'button';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.textContent = '↑';
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
    document.body.appendChild(backToTop);

    const onScroll = () => {
      updateProgressBar();
      if (nav) nav.classList.toggle('is-scrolled', (window.scrollY || 0) > 18);
      backToTop.classList.toggle('is-visible', (window.scrollY || 0) > 320);
      updateParallax();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  const initStickyNav = () => {
    const nav = qs('.nav');
    if (nav) nav.classList.add('is-sticky');
  };

  const initMobileNav = () => {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.querySelector('.nav__links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('is-open', isOpen);
      });

      // Close menu when a link is clicked
      navLinks.querySelectorAll('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('open');
          hamburger.classList.remove('is-open');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove('open');
          hamburger.classList.remove('is-open');
        }
      });
    }
  };


  const highlightActiveNav = () => {
    const path = window.location.pathname.split(/[\\/]/).pop() || 'index.html';
    qsa('.nav__link').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const active = href === path;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const observeReveal = () => {
    const elements = qsa(CONFIG.revealSelector).filter((element) => !element.classList.contains('rn-revealed'));
    if (!elements.length) return;

    elements.forEach((element) => element.classList.add('rn-reveal'));

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible', 'rn-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible', 'rn-revealed');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    elements.forEach((element) => observer.observe(element));
  };

  const animateCounters = () => {
    const counters = qsa('.hero__stat-num, .profile-stat__num, .big-rating');
    if (!counters.length) return;

    const animateText = (element) => {
      const text = element.textContent.trim();
      const match = text.match(/^([\d,.]+)([a-zA-Z+%]*)$/);
      if (!match) return;

      const targetValue = Number.parseFloat(match[1].replace(/,/g, ''));
      if (Number.isNaN(targetValue)) return;

      const suffix = match[2] || '';
      const duration = 900;
      const start = performance.now();
      const decimals = (match[1].split('.')[1] || '').length;

      const step = (now) => {
        const progress = clamp((now - start) / duration, 0, 1);
        const value = targetValue * (1 - Math.pow(1 - progress, 3));
        element.textContent = `${value.toFixed(decimals)}${suffix}`.replace(/\.0+([a-zA-Z+%]*)$/, '$1');
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(animateText);
      return;
    }

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateText(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
  };

  const ensureHeroAtmosphere = (hero) => {
    if (!qs('.rn-particles', hero)) {
      const particles = document.createElement('div');
      particles.className = 'rn-particles';
      hero.appendChild(particles);
    }

    if (!qs('.rn-float-icons', hero)) {
      const icons = document.createElement('div');
      icons.className = 'rn-float-icons';
      const palette = ['🍅', '🥑', '🍓', '🧄', '🥐', '🍜'];
      for (let i = 0; i < 6; i += 1) {
        const icon = document.createElement('span');
        icon.className = 'rn-floating-icon';
        icon.textContent = palette[i % palette.length];
        icon.style.left = `${12 + ((i * 13) % 72)}%`;
        icon.style.top = `${8 + ((i * 17) % 72)}%`;
        icon.style.animationDelay = `${i * 0.35}s`;
        icons.appendChild(icon);
      }
      hero.appendChild(icons);
    }

    const particles = qs('.rn-particles', hero);
    if (particles && !particles.childElementCount) {
      for (let i = 0; i < 24; i += 1) {
        const particle = document.createElement('span');
        particle.className = 'rn-particle';
        const size = 2 + Math.random() * 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '999px';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.background = `rgba(193, 68, 14, ${0.12 + Math.random() * 0.24})`;
        particle.dataset.speed = `${0.25 + Math.random() * 0.75}`;
        particles.appendChild(particle);
      }
    }
  };

  const animateHeroHeading = () => {
    const title = qs('.hero__title');
    if (!title || title.dataset.rnTyped === 'true') return;
    const originalHtml = title.innerHTML;
    const text = title.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;

    title.dataset.rnTyped = 'true';
    title.innerHTML = '<span class="rn-typed-title"></span>';
    const typed = title.firstElementChild;
    let index = 0;

    const tick = () => {
      if (!typed) return;
      typed.textContent = text.slice(0, index);
      index += 1;
      if (index <= text.length) {
        window.setTimeout(tick, prefersReducedMotion ? 0 : 36);
      } else {
        title.innerHTML = originalHtml;
      }
    };

    tick();
  };

  const animateHeroCta = () => {
    qsa('.hero__actions .btn, .cta-section .btn').forEach((button, index) => {
      button.style.animation = `rn-fade-up 520ms ease ${140 + index * 80}ms both`;
    });
  };

  const bindHeroParallax = (hero) => {
    const floating = qs('.rn-float-icons', hero);
    const particles = qsa('.rn-particle', hero);

    const move = () => {
      if (prefersReducedMotion) return;
      const offsetX = (state.mouseX - 0.5) * 18;
      const offsetY = (state.mouseY - 0.5) * 14;
      if (floating) floating.style.transform = `translate3d(${offsetX * 0.35}px, ${offsetY * 0.35}px, 0)`;
      particles.forEach((particle) => {
        const speed = Number.parseFloat(particle.dataset.speed || '0.5');
        particle.style.transform = `translate3d(${offsetX * speed * 0.3}px, ${offsetY * speed * 0.3}px, 0)`;
      });
    };

    hero.addEventListener('mousemove', (event) => {
      const rect = hero.getBoundingClientRect();
      state.mouseX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      state.mouseY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      requestAnimationFrame(move);
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      state.mouseX = 0.5;
      state.mouseY = 0.5;
      requestAnimationFrame(move);
    }, { passive: true });

    move();
  };

  const updateParallax = () => {
    const hero = qs('.hero');
    if (!hero || prefersReducedMotion) return;
    const floatIcons = qs('.rn-float-icons', hero);
    const particles = qsa('.rn-particle', hero);
    const offset = clamp((window.scrollY || 0) / 70, 0, 10);
    if (floatIcons) floatIcons.style.transform = `translate3d(0, ${offset * 0.4}px, 0)`;
    particles.forEach((particle) => {
      const speed = Number.parseFloat(particle.dataset.speed || '0.5');
      particle.style.transform = `translate3d(0, ${offset * speed}px, 0)`;
    });
  };

  const initHeroEnhancements = () => {
    const hero = qs('.hero');
    if (!hero) return;
    ensureHeroAtmosphere(hero);
    bindHeroParallax(hero);
    animateHeroHeading();
    animateHeroCta();
  };

  const restoreSavedSet = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(CONFIG.savedKey) || '[]'));
    } catch {
      return new Set();
    }
  };

  const persistSavedSet = (set) => {
    localStorage.setItem(CONFIG.savedKey, JSON.stringify(Array.from(set)));
  };

  const getSaveKey = (button) => {
    const host = button.closest('.recipe-card, .featured-card, .recipe-main') || button.parentElement;
    const base = button.dataset.saveKey || button.id || host?.querySelector('.recipe-card__title, .featured-card__title, h1')?.textContent || button.textContent;
    return String(base).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const burstHeart = (button) => {
    const host = button.closest('.recipe-card__img-wrap, .hero__actions, .featured-card__actions, .recipe-main') || button;
    const heart = document.createElement('span');
    heart.className = 'rn-heart-burst';
    heart.textContent = '♥';
    host.style.position = host.style.position || 'relative';
    host.appendChild(heart);
    window.setTimeout(() => heart.remove(), 720);
  };

  const applySavedState = (button, saved, persist = true) => {
    const current = restoreSavedSet();
    const key = getSaveKey(button);
    if (saved) current.add(key); else current.delete(key);
    if (persist) persistSavedSet(current);

    button.dataset.saved = saved ? 'true' : 'false';
    button.classList.toggle('is-saved', saved);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', saved ? 'true' : 'false');

    if (button.id === 'save-btn') button.textContent = saved ? '♥ Saved' : '♡ Save recipe';
    else if (button.id === 'featured-save') button.textContent = saved ? '♥ Saved' : '♡ Save';
    else if (button.classList.contains('recipe-card__bookmark')) button.textContent = saved ? '♥' : '♡';

    showToast(saved ? 'Saved to your collection' : 'Removed from collection', saved ? 'success' : 'default');
    burstHeart(button);

    if (!saved && button.closest('#tab-saved')) {
      const card = button.closest('.recipe-card');
      if (card) {
        card.style.transition = 'opacity 220ms ease, transform 220ms ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        window.setTimeout(() => {
          card.remove();
          const countEl = qs('#tab-saved h2 span');
          if (countEl) {
            const savedCount = restoreSavedSet().size;
            countEl.textContent = `(${savedCount})`;
          }
        }, 220);
      }
    }
  };

  const initRecipeCardEffects = () => {
    const cards = qsa('.recipe-card, .featured-card');
    cards.forEach((card) => {
      if (card.dataset.rnCardEffectsBound === 'true') return;
      card.dataset.rnCardEffectsBound = 'true';
      card.addEventListener('pointermove', (event) => {
        if (prefersReducedMotion) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--rn-tilt-y', `${((x - 0.5) * 8).toFixed(2)}deg`);
        card.style.setProperty('--rn-tilt-x', `${((0.5 - y) * 8).toFixed(2)}deg`);
        card.classList.add('rn-card-hover');
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('rn-card-hover');
        card.style.setProperty('--rn-tilt-x', '0deg');
        card.style.setProperty('--rn-tilt-y', '0deg');
      });
    });

    qsa('.recipe-card__bookmark, #save-btn, #featured-save').forEach((button) => {
      if (button.dataset.rnBookmarkBound === 'true') return;
      button.dataset.rnBookmarkBound = 'true';
      const saved = restoreSavedSet();
      const key = getSaveKey(button);
      if (saved.has(key)) applySavedState(button, true, false);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isSaved = button.classList.contains('is-saved') || button.dataset.saved === 'true' || button.classList.contains('saved');
        applySavedState(button, !isSaved, true);
      });
    });
  };

  const initCategoryMotion = () => {
    qsa('.category-card, .cat-pill').forEach((element, index) => {
      element.style.transitionDelay = `${index * 25}ms`;
    });
  };

  const buildSearchIndex = () => qsa('.recipe-card, .recipe-list-item').map((card) => ({
    title: qs('.recipe-card__title, .recipe-list-item__title', card)?.textContent?.trim() || '',
    text: card.textContent.toLowerCase(),
    card,
  })).filter((item) => item.title);

  const applySearchResults = (query, searchIndex) => {
    const term = query.trim().toLowerCase();
    const cards = searchIndex.map((entry) => entry.card);
    let count = 0;

    cards.forEach((card) => {
      const visible = !term || card.textContent.toLowerCase().includes(term);
      card.style.transition = 'opacity 180ms ease, transform 180ms ease';
      card.style.opacity = visible ? '1' : '0';
      card.style.transform = visible ? 'translateY(0)' : 'translateY(10px)';
      window.setTimeout(() => {
        card.style.display = visible ? '' : 'none';
      }, 180);
      if (visible) count += 1;
    });

    const resultCount = qs('#result-count') || qs('.results-count');
    if (resultCount) resultCount.textContent = term ? `Showing ${count} result${count === 1 ? '' : 's'}` : resultCount.textContent;
  };

  const enhanceSearchInput = (input) => {
    const wrapper = input.parentElement;
    if (!wrapper) return;
    wrapper.style.position = wrapper.style.position || 'relative';

    let spinner = wrapper.querySelector('.rn-search-spinner');
    if (!spinner) {
      spinner = document.createElement('span');
      spinner.className = 'rn-search-spinner';
      wrapper.appendChild(spinner);
    }

    let suggestions = wrapper.querySelector('.rn-search-suggestions');
    if (!suggestions) {
      suggestions = document.createElement('div');
      suggestions.className = 'rn-search-suggestions';
      wrapper.appendChild(suggestions);
    }

    const renderSuggestions = (query) => {
      const term = query.trim().toLowerCase();
      const searchIndex = buildSearchIndex();
      const matches = term ? searchIndex.filter((entry) => entry.text.includes(term)).slice(0, 6) : searchIndex.slice(0, 6);
      suggestions.innerHTML = '';

      if (!matches.length) {
        suggestions.classList.remove('is-open');
        return;
      }

      matches.forEach((entry) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rn-search-suggestion';
        button.innerHTML = `<strong>${entry.title}</strong><span>RecipeNest</span>`;
        button.addEventListener('click', () => {
          input.value = entry.title;
          suggestions.classList.remove('is-open');
          applySearchResults(entry.title, searchIndex);
          entry.card.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        });
        suggestions.appendChild(button);
      });

      suggestions.classList.add('is-open');
    };

    const runSearch = debounce(() => {
      spinner.classList.add('is-visible');
      window.requestAnimationFrame(() => {
        const searchIndex = buildSearchIndex();
        applySearchResults(input.value, searchIndex);
        renderSuggestions(input.value);
        window.setTimeout(() => spinner.classList.remove('is-visible'), 160);
      });
    }, 150);

    if (input.dataset.rnSearchEventBound !== 'true') {
      input.dataset.rnSearchEventBound = 'true';
      input.addEventListener('input', runSearch, { passive: true });
      input.addEventListener('focus', () => renderSuggestions(input.value));
      input.addEventListener('blur', () => window.setTimeout(() => suggestions.classList.remove('is-open'), 180));
    }
    const searchIndex = buildSearchIndex();
    applySearchResults(input.value, searchIndex);
  };

  const initSearchEnhancements = () => {
    const inputs = qsa('#global-search, #recipe-search');
    if (!inputs.length) return;
    inputs.forEach((input) => enhanceSearchInput(input));
  };

  const attachCommentInteractions = (comment) => {
    if (comment.dataset.rnBound === 'true') return;
    comment.dataset.rnBound = 'true';
    const header = qs('.comment__header', comment);
    if (!header) return;
    const likeButton = document.createElement('button');
    likeButton.type = 'button';
    likeButton.className = 'rn-reply-toggle';
    likeButton.textContent = 'Like';
    likeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      likeButton.classList.add('rn-like-pulse');
      window.setTimeout(() => likeButton.classList.remove('rn-like-pulse'), 280);
      showToast('Comment liked', 'success');
    });
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '10px';
    controls.appendChild(likeButton);
    header.appendChild(controls);
  };

  const initComments = () => {
    const commentsList = qs('#comments-list');
    if (!commentsList) return;
    qsa('.comment', commentsList).forEach(attachCommentInteractions);
    window.addEventListener('comment:added', (event) => {
      const comment = event.detail;
      if (!comment) return;
      commentsList.prepend(comment);
      attachCommentInteractions(comment);
      comment.classList.add('rn-comment-enter');
      comment.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const initRatingEnhancements = () => {
    const ratingWidget = qs('#user-rating');
    if (!ratingWidget) return;
    const labels = qsa('label', ratingWidget);
    const inputs = qsa('input', ratingWidget);

    inputs.forEach((input) => {
      input.addEventListener('change', () => {
        labels.forEach((label, index) => {
          label.style.color = index < Number(input.value) ? '#f59e0b' : 'rgba(148, 163, 184, 0.55)';
          label.style.transform = index < Number(input.value) ? 'scale(1.08)' : 'scale(1)';
        });
        showToast(`Rating submitted: ${input.value} star${input.value === '1' ? '' : 's'}`, 'success');
      });
    });

    const bigRating = qs('.big-rating');
    if (bigRating) {
      const value = Number.parseFloat(bigRating.textContent);
      if (!Number.isNaN(value)) {
        bigRating.textContent = '0.0';
        const start = performance.now();
        const duration = 900;
        const step = (now) => {
          const progress = clamp((now - start) / duration, 0, 1);
          bigRating.textContent = (value * (1 - Math.pow(1 - progress, 3))).toFixed(1);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
  };

  const ensureLightbox = () => {
    let lightbox = qs('.rn-lightbox');
    if (lightbox) return lightbox;
    lightbox = document.createElement('div');
    lightbox.className = 'rn-lightbox';
    lightbox.innerHTML = '<img alt="Preview" />';
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.classList.remove('is-open');
    });
    document.body.appendChild(lightbox);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') lightbox.classList.remove('is-open');
    });
    return lightbox;
  };

  const initImageEnhancements = () => {
    const lightbox = ensureLightbox();
    qsa('img').forEach((image) => {
      if (!image.loading) image.loading = 'lazy';
      image.addEventListener('load', () => image.classList.add('is-loaded'));
      if (image.closest('.recipe-card__img-wrap, .featured-card, .hero__img-wrap, .profile-banner')) {
        image.style.cursor = 'zoom-in';
        image.addEventListener('click', () => {
          const preview = qs('img', lightbox);
          if (!preview) return;
          preview.src = image.currentSrc || image.src;
          preview.alt = image.alt || 'Image preview';
          lightbox.classList.add('is-open');
        });
      }
    });
  };

  const initForms = () => {
    qsa('.form-group').forEach((group) => {
      // Skip auth modal, create page, and profile settings — they have their own fixed layout
      if (group.closest('#auth-modal')) return;
      if (group.closest('#create-form')) return;
      if (group.closest('.create-layout')) return;
      if (group.closest('#tab-edit')) return;
      if (group.closest('.edit-profile-grid')) return;
      if (group.closest('.profile-layout')) return;

      const input = qs('.form-input, .form-textarea, .form-select', group);
      const label = qs('.form-label', group);
      if (!input || !label) return;
      group.classList.add('rn-floating-label-wrap');
      const sync = () => group.classList.toggle('has-value', Boolean(String(input.value || '').trim()));
      input.addEventListener('focus', () => group.classList.add('is-focused'));
      input.addEventListener('blur', () => {
        group.classList.remove('is-focused');
        sync();
        validateField(input);
      });
      input.addEventListener('input', () => {
        sync();
        input.classList.remove('rn-invalid');
      });
      sync();
    });

    qsa('input[type="password"]').forEach((input) => enhancePasswordToggle(input));
  };


  const enhancePasswordToggle = (input) => {
    if (!input || input.dataset.rnPwEnhanced === 'true') return;
    input.dataset.rnPwEnhanced = 'true';
    const parent = input.parentElement;
    if (!parent) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rn-reply-toggle';
    button.style.marginTop = '8px';
    button.textContent = 'Show password';
    button.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.textContent = visible ? 'Show password' : 'Hide password';
    });
    parent.appendChild(button);
  };

  const validateField = (input) => {
    const value = String(input.value || '').trim();
    const type = input.getAttribute('type') || input.tagName.toLowerCase();
    const valid = type === 'email' ? /.+@.+\..+/.test(value) : value.length > 0;
    input.classList.toggle('rn-invalid', !valid);
    input.classList.toggle('rn-valid', valid);
  };

  // Dark mode removed per user request

  const createRippleEffect = (event) => {
    const button = event.currentTarget;
    if (!button || prefersReducedMotion) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'rn-button-ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 620);
  };

  const enhanceButtons = () => {
    qsa('button, .btn, .cat-pill, .recipe-card__bookmark').forEach((button) => {
      if (button.dataset.rnButtonEnhanced === 'true') return;
      button.dataset.rnButtonEnhanced = 'true';
      button.addEventListener('click', createRippleEffect);
    });
  };

  const initRecipePageHelpers = () => {
    const saveButton = qs('#save-btn');
    if (saveButton) {
      saveButton.addEventListener('click', (event) => {
        event.preventDefault();
        const isSaved = saveButton.classList.contains('is-saved') || saveButton.dataset.saved === 'true';
        applySavedState(saveButton, !isSaved, true);
      });
    }

    const commentButton = qs('#submit-review-btn');
    if (commentButton && !commentButton.dataset.rnBound) {
      commentButton.dataset.rnBound = 'true';
      commentButton.addEventListener('click', (event) => {
        const input = qs('#comment-input');
        const rating = qs('#user-rating input:checked');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          showToast('Please write a comment first', 'error');
          input?.classList.add('rn-invalid');
          input?.focus();
          return;
        }

        const comment = document.createElement('div');
        comment.className = 'comment rn-comment-enter';
        const stars = rating ? '★'.repeat(Number(rating.value)) + '☆'.repeat(5 - Number(rating.value)) : '★★★★★';
        comment.innerHTML = `
          <div class="avatar avatar--md" style="background:var(--rust);color:white;font-size:0.9rem;">Y</div>
          <div class="comment__body">
            <div class="comment__header">
              <span class="comment__name">You</span>
              <span class="comment__date">Just now</span>
            </div>
            <div style="color:#F59E0B;font-size:0.9rem;margin-bottom:6px;">${stars}</div>
            <p class="comment__text"></p>
          </div>
        `;
        qs('.comment__text', comment).textContent = input.value.trim();
        window.dispatchEvent(new CustomEvent('comment:added', { detail: comment }));
        input.value = '';
        showToast('Review posted! Thank you 🎉', 'success');
      });
    }
  };

  const initLoadSkeletons = () => {
    qsa('.recipe-grid').forEach((grid) => {
      if (grid.children.length > 0 || grid.dataset.rnSkeleton === 'true') return;
      grid.dataset.rnSkeleton = 'true';
      for (let i = 0; i < 3; i += 1) {
        const skeleton = document.createElement('article');
        skeleton.className = 'recipe-card rn-card-placeholder';
        skeleton.style.minHeight = '320px';
        grid.appendChild(skeleton);
      }
    });
  };

  let activeTab = 'signin';

  const switchAuthTab = (tab) => {
    activeTab = tab;
    const signupFields = document.getElementById('signup-fields');
    const tabSignin    = document.getElementById('tab-signin');
    const tabSignup    = document.getElementById('tab-signup');
    const submitBtn    = document.getElementById('auth-submit-btn');
    if (!signupFields || !tabSignin || !tabSignup) return;

    if (tab === 'signup') {
      signupFields.style.display = 'block';
      tabSignup.classList.add('auth-tab-active');
      tabSignup.classList.remove('auth-tab-inactive');
      tabSignin.classList.remove('auth-tab-active');
      tabSignin.classList.add('auth-tab-inactive');
      if (submitBtn) submitBtn.textContent = 'Create account';
    } else {
      signupFields.style.display = 'none';
      tabSignin.classList.add('auth-tab-active');
      tabSignin.classList.remove('auth-tab-inactive');
      tabSignup.classList.remove('auth-tab-active');
      tabSignup.classList.add('auth-tab-inactive');
      if (submitBtn) submitBtn.textContent = 'Sign in';
    }

    const errEl = document.getElementById('auth-error');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    const email    = (document.getElementById('auth-email')    || {}).value || '';
    const password = (document.getElementById('auth-password') || {}).value || '';
    const name     = (document.getElementById('auth-name')     || {}).value || '';
    const errEl    = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (!email || !password) {
      if (errEl) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Please wait…';
    }

    try {
      const endpoint = activeTab === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body     = activeTab === 'signup'
        ? { name, email, password }
        : { email, password };

      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (errEl) { errEl.textContent = data.message || 'Something went wrong.'; errEl.style.display = 'block'; }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = activeTab === 'signup' ? 'Create account' : 'Sign in'; }
        return;
      }

      closeModal('auth-modal');
      showToast(
        activeTab === 'signin'
          ? 'Welcome back! 👋'
          : 'Account created! Welcome to RecipeNest 🎉',
        'success'
      );

      localStorage.setItem('rn-user', JSON.stringify(data.user));
      updateNavForUser(data.user);

      setTimeout(() => { window.location.href = 'profile.html'; }, 1200);

    } catch (err) {
      if (errEl) { errEl.textContent = 'Cannot reach server. Is it running?'; errEl.style.display = 'block'; }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = activeTab === 'signup' ? 'Create account' : 'Sign in'; }
    }
  };

  const updateNavForUser = (user) => {
    const signinBtn = document.getElementById('signin-btn');
    const joinBtn = document.getElementById('joinbtn');
    const navActions = qs('.nav__actions');

    if (user) {
        // Hide sign in / join buttons if they exist
        if (signinBtn) signinBtn.style.display = 'none';
        if (joinBtn) joinBtn.style.display = 'none';

        let logoutBtn = document.getElementById('logout-btn');

        if (!logoutBtn && navActions) {
            logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.className = 'btn btn--primary btn--sm';
            logoutBtn.textContent = 'Sign Out';

            logoutBtn.onclick = async () => {
                try { await fetch('/api/auth/logout', { method: 'POST' }); } catch(e) {}
                localStorage.removeItem('rn-user');
                window.location.href = 'index.html';
            };

            navActions.appendChild(logoutBtn);
        }
    } else {
        if (signinBtn) signinBtn.style.display = '';
        if (joinBtn) joinBtn.style.display = '';

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.remove();
    }
};

  const initGlobalEnhancements = () => {
    injectStyles();
    ensureLoader();
    ensureProgressBar();
    ensureToastContainer();
    bindSmoothScrolling();
    initStickyNav();
    initMobileNav();
    highlightActiveNav();
    bindScrollUi();
    observeReveal();
    animateCounters();
    initHeroEnhancements();
    initRecipeCardEffects();
    initCategoryMotion();
    initSearchEnhancements();
    initComments();
    initRatingEnhancements();
    initImageEnhancements();
    initForms();
    enhanceButtons();
    initRecipePageHelpers();
    initLoadSkeletons();
    
    // Automatically update the nav for logged-in users on load
    // Also verify the session is still valid on the backend
    try {
      const stored = localStorage.getItem('rn-user');
      if (stored) {
        updateNavForUser(JSON.parse(stored));
        // Verify session is still alive — if not, clean up localStorage
        fetch('/api/auth/me').then(res => {
          if (!res.ok) {
            localStorage.removeItem('rn-user');
            updateNavForUser(null);
          }
        }).catch(() => {});
      }
    } catch (_) {}

    window.addEventListener('resize', debounce(() => {
      observeReveal();
      initHeroEnhancements();
    }, 220), { passive: true });
  };
  const initDynamicElements = () => {
    observeReveal();
    initRecipeCardEffects();
    initSearchEnhancements();
    enhanceButtons();
  };

  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.switchAuthTab = switchAuthTab;
  // Only set window.switchTab if profile.js hasn't already defined it
  if (!window.switchTab) window.switchTab = switchAuthTab;
  window.handleAuth = handleAuth;
  window.updateNavForUser = updateNavForUser;
  window.RecipeNestUI = { showToast, initDynamicElements };

  onReady(() => {
    initGlobalEnhancements();
  });
})();