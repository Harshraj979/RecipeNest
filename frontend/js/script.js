/* ─── RecipeNest Core App & UI Script ───────────────────────── */

(function () {
  'use strict';

  /* ── Toast Notifications ── */
  function ensureToastContainer() {
    let container = document.getElementById('rn-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rn-toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'info') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `rn-toast rn-toast--${type}`;

    const bgColor = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#3b82f6');
    toast.style.cssText = `
      background: ${bgColor};
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.25s ease, transform 0.25s ease;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ── Modal Handling ── */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('open');
      modal.classList.add('is-open');
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('open');
      modal.classList.remove('is-open');
    }
  }

  let currentAuthTab = 'signin';

  function switchAuthTab(tabId) {
    currentAuthTab = tabId;
    const signinTab = document.getElementById('tab-signin');
    const signupTab = document.getElementById('tab-signup');
    const signupFields = document.getElementById('signup-fields');
    const submitBtn = document.getElementById('auth-submit-btn');
    const errEl = document.getElementById('auth-error');

    if (errEl) errEl.style.display = 'none';

    if (tabId === 'signup') {
      if (signinTab) { signinTab.className = 'btn w-full auth-tab-inactive'; }
      if (signupTab) { signupTab.className = 'btn w-full auth-tab-active'; }
      if (signupFields) signupFields.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Create account';
    } else {
      if (signinTab) { signinTab.className = 'btn w-full auth-tab-active'; }
      if (signupTab) { signupTab.className = 'btn w-full auth-tab-inactive'; }
      if (signupFields) signupFields.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Sign in';
    }
  }

  /* ── Authentication Handlers ── */
  async function handleAuth(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('auth-name');
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    const errEl = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!email || !password || (currentAuthTab === 'signup' && !name)) {
      if (errEl) { errEl.textContent = 'Please fill in all required fields.'; errEl.style.display = 'block'; }
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Please wait…'; }

    try {
      const endpoint = currentAuthTab === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = currentAuthTab === 'signup' ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (errEl) { errEl.textContent = data.message || 'Authentication failed.'; errEl.style.display = 'block'; }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = currentAuthTab === 'signup' ? 'Create account' : 'Sign in'; }
        return;
      }

      closeModal('auth-modal');
      showToast(currentAuthTab === 'signup' ? 'Account created successfully! 🎉' : 'Welcome back! 👋', 'success');

      localStorage.setItem('rn-user', JSON.stringify(data.user));
      updateNavForUser(data.user);

      setTimeout(() => {
        if (window.location.pathname.endsWith('create.html')) {
          window.location.reload();
        } else {
          window.location.href = 'profile.html';
        }
      }, 1000);

    } catch (err) {
      if (errEl) { errEl.textContent = 'Server error. Please try again.'; errEl.style.display = 'block'; }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = currentAuthTab === 'signup' ? 'Create account' : 'Sign in'; }
    }
  }

  /* ── Navbar User State Update ── */
  function updateNavForUser(user) {
    const signinBtn = document.getElementById('signin-btn');
    const joinBtn = document.getElementById('joinbtn');
    const navActions = document.querySelector('.nav__actions');

    if (user) {
      if (signinBtn) signinBtn.style.display = 'none';
      if (joinBtn) joinBtn.style.display = 'none';

      let logoutBtn = document.getElementById('logout-btn');
      if (!logoutBtn && navActions) {
        logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'btn btn--primary btn--sm';
        logoutBtn.textContent = 'Sign Out';
        logoutBtn.onclick = async () => {
          try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
          localStorage.removeItem('rn-user');
          showToast('Signed out', 'info');
          setTimeout(() => { window.location.href = 'index.html'; }, 500);
        };
        navActions.appendChild(logoutBtn);
      }
    } else {
      if (signinBtn) signinBtn.style.display = '';
      if (joinBtn) joinBtn.style.display = '';
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) logoutBtn.remove();
    }
  }

  /* ── Save / Unsave a Recipe ── */
  async function toggleSaveRecipe(recipeId, buttonEl) {
    const userRaw = localStorage.getItem('rn-user');
    if (!userRaw) {
      showToast('Sign in to save recipes', 'info');
      openModal('auth-modal');
      return;
    }

    try {
      const res = await fetch(`/api/auth/save/${recipeId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Error saving recipe', 'error');
        return;
      }
      if (data.saved) {
        if (buttonEl) { buttonEl.textContent = '♥'; buttonEl.classList.add('saved'); }
        showToast('Saved to your collection ♥', 'success');
      } else {
        if (buttonEl) { buttonEl.textContent = '♡'; buttonEl.classList.remove('saved'); }
        showToast('Removed from collection', 'info');
      }
    } catch (err) {
      showToast('Error saving recipe', 'error');
    }
  }

  /* ── Navigation Active & Mobile Toggle & Backdrop Listener ── */
  function initNav() {
    // Mobile hamburger menu
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.querySelector('.nav__links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('is-open');
      });
    }

    // Backdrop click to close modal
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          overlay.classList.remove('is-open');
        }
      });
    });

    // Highlight active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('is-active');
      }
    });

    // Check user auth state
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          localStorage.setItem('rn-user', JSON.stringify(data.user));
          updateNavForUser(data.user);
        } else {
          localStorage.removeItem('rn-user');
          updateNavForUser(null);
        }
      })
      .catch(() => {});
  }

  /* ── Home Page: Featured & Trending from DB ── */
  async function initHomePage() {
    if (!document.querySelector('.featured-section') && !document.querySelector('.trending-section')) return;

    // Fetch all recipes once
    let allRecipes = [];
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      allRecipes = data.recipes || [];
    } catch (err) {
      console.error('Failed to fetch recipes for home page:', err);
      return;
    }

    /* — Featured This Week — */
    const featuredCard = document.querySelector('.featured-section .featured-card');
    if (featuredCard) {
      // Look for "Authentic Thai Green Curry" by title (case-insensitive)
      const featured = allRecipes.find(r =>
        r.title.toLowerCase().includes('thai green curry')
      );
      if (featured) {
        const img = featuredCard.querySelector('.featured-card__img');
        const title = featuredCard.querySelector('.featured-card__title');
        const desc = featuredCard.querySelector('.featured-card__desc');
        const viewBtn = featuredCard.querySelector('.btn--primary');
        const saveBtn = document.getElementById('featured-save');
        const metas = featuredCard.querySelectorAll('.meta-item__val');

        if (img && featured.image) img.src = featured.image;
        if (title) title.textContent = featured.title;
        if (desc) desc.textContent = featured.description || desc.textContent;
        if (viewBtn) viewBtn.href = `recipe.html?id=${featured._id}`;
        if (metas.length >= 4) {
          metas[0].textContent = `${featured.prepTime || 20} min`;
          metas[1].textContent = `${featured.cookTime || 30} min`;
          metas[2].textContent = `${featured.servings || 4} people`;
        }
        if (saveBtn) {
          saveBtn.dataset.recipeId = featured._id;
          saveBtn.onclick = () => toggleSaveRecipe(featured._id, saveBtn);
        }
        // Make the whole card clickable
        featuredCard.style.cursor = 'pointer';
      }
    }

    /* — Trending Now — */
    // Titles to match (case-insensitive substring)
    const trendingTitles = [
      'avocado',
      'molten chocolate',
      'chickpea bowl',
      'sourdough'
    ];

    const trendingCards = document.querySelectorAll('.trending-section .recipe-card');
    trendingCards.forEach((card, index) => {
      const keyword = trendingTitles[index];
      if (!keyword) return;

      const match = allRecipes.find(r => r.title.toLowerCase().includes(keyword));
      if (!match) return;

      // Update image
      const img = card.querySelector('.recipe-card__img');
      if (img && match.image) img.src = match.image;

      // Update title link
      const titleLink = card.querySelector('a[href]');
      if (titleLink) titleLink.href = `recipe.html?id=${match._id}`;

      // Wire bookmark button
      const bookmark = card.querySelector('.recipe-card__bookmark');
      if (bookmark) {
        bookmark.dataset.recipeId = match._id;
        bookmark.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSaveRecipe(match._id, bookmark);
        };
      }

      // Make whole card navigate to recipe on click (except bookmark)
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('recipe-card__bookmark')) return;
        window.location.href = `recipe.html?id=${match._id}`;
      });
    });

    /* — Mark already-saved recipes — */
    fetch('/api/auth/saved/ids')
      .then(r => r.json())
      .then(data => {
        const savedIds = data.ids || [];
        document.querySelectorAll('[data-recipe-id]').forEach(btn => {
          if (savedIds.includes(btn.dataset.recipeId)) {
            btn.textContent = '♥';
            btn.classList.add('saved');
          }
        });
      })
      .catch(() => {});
  }

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ── Export Globals ── */
  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.switchAuthTab = switchAuthTab;
  if (!window.switchTab) window.switchTab = switchAuthTab;
  window.handleAuth = handleAuth;
  window.updateNavForUser = updateNavForUser;
  window.toggleSaveRecipe = toggleSaveRecipe;

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHomePage();
  });
})();