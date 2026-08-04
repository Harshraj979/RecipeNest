/* ─── Profile Page JS ───────────────────────────────────────── */

// Define switchTab globally BEFORE script.js loads, so script.js won't overwrite it
window.switchTab = function switchTab(tabId) {
  document.querySelectorAll('.profile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === `tab-${tabId}`);
  });

  // Lazy-load saved recipes when tab is first opened
  if (tabId === 'saved') {
    loadSavedRecipes();
  }
};

async function confirmDeleteRecipe(id) {
  if (!id) return;
  if (confirm('Delete this recipe? This cannot be undone.')) {
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Failed to delete recipe', 'error');
        return;
      }
      showToast('Recipe deleted successfully', 'success');
      loadUserProfile();
    } catch (err) {
      showToast('Error deleting recipe', 'error');
    }
  }
}

// Fetch user data and update UI on load
async function loadUserProfile() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      showToast('Please sign in first', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      return;
    }

    const data = await res.json();
    const user = data.user;

    // Update UI elements with the logged-in user's details
    const nameDisplay = document.querySelector('.profile-name');
    const bioDisplay = document.querySelector('.profile-bio');
    const locDisplay = document.querySelector('.profile-location span:nth-child(2)');
    const avatarDisplay = document.querySelector('.profile-avatar');

    if (nameDisplay) {
      nameDisplay.textContent = user.name || 'Your Profile';
      document.title = `${user.name || 'My'} — RecipeNest Profile`;
    }
    if (bioDisplay) bioDisplay.textContent = user.bio || 'No bio written yet.';
    if (locDisplay) locDisplay.textContent = user.location || 'Location not set';
    if (avatarDisplay && user.name) {
      avatarDisplay.textContent = user.name.charAt(0).toUpperCase();
    }

    // Populate the profile edit inputs
    const parts = (user.name || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const firstNameInput = document.getElementById('profile-first-name');
    const lastNameInput = document.getElementById('profile-last-name');
    const bioInput = document.getElementById('profile-bio');
    const locInput = document.getElementById('profile-location');
    const emailInput = document.getElementById('profile-email');

    if (firstNameInput) firstNameInput.value = firstName;
    if (lastNameInput) lastNameInput.value = lastName;
    if (bioInput) bioInput.value = user.bio || '';
    if (locInput) locInput.value = user.location || '';
    if (emailInput) emailInput.value = user.email || '';

    // Load recipes published by this user
    loadUserRecipes(user);

  } catch (err) {
    console.error('Failed to load user profile:', err);
    showToast('Error loading profile', 'error');
  }
}

// Load recipes published by this user
async function loadUserRecipes(user) {
  try {
    const res = await fetch('/api/recipes');
    const data = await res.json();
    const recipes = data.recipes || [];

    const userId = String(user._id || user.id || '');
    const userName = (user.name || '').trim().toLowerCase();
    const myRecipes = recipes.filter(r => {
      const authorId = String(r.author?.id || '');
      const authorName = (r.author?.name || '').trim().toLowerCase();
      return (userId && authorId === userId) || (userName && authorName && authorName === userName);
    });

    const grid = document.querySelector('#tab-my-recipes .recipe-grid');
    const countSpan = document.querySelector('#tab-my-recipes .collection-header h2 span');

    if (countSpan) countSpan.textContent = `(${myRecipes.length})`;

    // Update recipe count in profile stats
    const statsRecipeCount = document.querySelector('.profile-stat__num');
    if (statsRecipeCount) statsRecipeCount.textContent = myRecipes.length;

    if (!grid) return;
    grid.innerHTML = '';

    if (myRecipes.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--ink-muted); margin-top: 24px;">You haven\'t published any recipes yet.</p>';
      return;
    }

    myRecipes.forEach(recipe => {
      const imgUrl = recipe.image || 'https://res.cloudinary.com/szrk0qwp/image/upload/v1784990515/recipenest/assets/recipe3.jpg';
      const categoryLabel = (recipe.category || 'dinner').charAt(0).toUpperCase() + (recipe.category || 'dinner').slice(1);
      const categoryTagClass = recipe.category === 'breakfast' ? 'tag--sage' : (recipe.category === 'dessert' ? 'tag--rust' : '');
      const totalTime = (Number(recipe.prepTime) || 0) + (Number(recipe.cookTime) || 0);

      const article = document.createElement('article');
      article.className = 'recipe-card fade-in visible';
      article.innerHTML = `
        <div class="recipe-card__img-wrap">
          <img src="${imgUrl}" alt="${recipe.title}" class="recipe-card__img" />
          <button class="recipe-card__bookmark saved" style="background:var(--rust);color:white;">♥</button>
        </div>
        <div class="recipe-card__body">
          <div class="recipe-card__meta">
            <span class="tag ${categoryTagClass}">${categoryLabel}</span>
            <span class="tag">${totalTime} min</span>
          </div>
          <a href="recipe.html?id=${recipe._id}"><h3 class="recipe-card__title">${recipe.title}</h3></a>
          <p class="recipe-card__desc">${recipe.description || ''}</p>
          <div class="recipe-card__footer">
            <div style="display:flex;gap:6px;">
              <button class="btn btn--ghost btn--sm" onclick="showToast('Edit mode coming soon','success')">Edit</button>
              <button class="btn btn--ghost btn--sm" style="color:var(--rust);" onclick="confirmDeleteRecipe('${recipe._id}')">Delete</button>
            </div>
            <div class="recipe-card__rating"><span class="stars">★★★★★</span> 5.0</div>
          </div>
        </div>
      `;
      grid.appendChild(article);
    });

  } catch (err) {
    console.error('Failed to load user recipes:', err);
  }
}

// Load saved/bookmarked recipes from the database
async function loadSavedRecipes() {
  const grid = document.querySelector('#tab-saved .recipe-grid');
  const countSpan = document.querySelector('#tab-saved .collection-header h2 span');
  if (!grid) return;

  // Prevent double-loading if already populated
  if (grid.dataset.loaded === 'true') return;

  grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-muted);padding:24px 0;">Loading…</p>';

  try {
    const res = await fetch('/api/auth/saved');
    if (!res.ok) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-muted);padding:24px 0;">Sign in to see your saved recipes.</p>';
      return;
    }

    const data = await res.json();
    const recipes = data.recipes || [];

    if (countSpan) countSpan.textContent = `(${recipes.length})`;
    grid.innerHTML = '';
    grid.dataset.loaded = 'true';

    if (recipes.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-muted);padding:24px 0;">No saved recipes yet. Browse and tap ♡ to save!</p>';
      return;
    }

    recipes.forEach(recipe => {
      if (!recipe || !recipe._id) return;
      const imgUrl = recipe.image || 'https://res.cloudinary.com/szrk0qwp/image/upload/v1784990515/recipenest/assets/recipe3.jpg';
      const categoryLabel = (recipe.category || 'dinner').charAt(0).toUpperCase() + (recipe.category || 'dinner').slice(1);
      const categoryTagClass = recipe.category === 'breakfast' ? 'tag--sage' : (recipe.category === 'dessert' ? 'tag--rust' : '');
      const totalTime = (Number(recipe.prepTime) || 0) + (Number(recipe.cookTime) || 0);
      const authorName = recipe.author?.name || 'Anonymous';
      const authorInitial = authorName.charAt(0).toUpperCase();

      const article = document.createElement('article');
      article.className = 'recipe-card fade-in visible';
      article.dataset.savedId = recipe._id;
      article.innerHTML = `
        <div class="recipe-card__img-wrap">
          <img loading="lazy" src="${imgUrl}" alt="${recipe.title}" class="recipe-card__img" />
          <button class="recipe-card__bookmark saved" data-recipe-id="${recipe._id}" aria-label="Unsave recipe">♥</button>
        </div>
        <div class="recipe-card__body">
          <div class="recipe-card__meta">
            <span class="tag ${categoryTagClass}">${categoryLabel}</span>
            <span class="tag">${totalTime} min</span>
          </div>
          <a href="recipe.html?id=${recipe._id}"><h3 class="recipe-card__title">${recipe.title}</h3></a>
          <p class="recipe-card__desc">${recipe.description || ''}</p>
          <div class="recipe-card__footer">
            <div class="recipe-card__author">
              <div class="avatar">${authorInitial}</div>
              <span>${authorName}</span>
            </div>
            <div class="recipe-card__rating"><span class="stars">★★★★★</span></div>
          </div>
        </div>
      `;

      // Wire unsave button: remove from UI and DB
      const bookmark = article.querySelector('.recipe-card__bookmark');
      bookmark.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const r = await fetch(`/api/auth/save/${recipe._id}`, { method: 'POST' });
          const d = await r.json();
          if (!d.saved) {
            article.remove();
            const remaining = grid.querySelectorAll('article').length;
            if (countSpan) countSpan.textContent = `(${remaining})`;
            if (remaining === 0) {
              grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-muted);padding:24px 0;">No saved recipes yet. Browse and tap ♡ to save!</p>';
            }
            showToast('Removed from collection', 'info');
          }
        } catch (_) {
          showToast('Error removing recipe', 'error');
        }
      });

      grid.appendChild(article);
    });

  } catch (err) {
    console.error('Failed to load saved recipes:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-muted);padding:24px 0;">Failed to load saved recipes.</p>';
  }
}

// Save profile updates to the database
async function saveProfile() {
  const firstName = document.getElementById('profile-first-name')?.value || '';
  const lastName = document.getElementById('profile-last-name')?.value || '';
  const bio = document.getElementById('profile-bio')?.value || '';
  const loc = document.getElementById('profile-location')?.value || '';
  const email = document.getElementById('profile-email')?.value || '';
  const password = document.getElementById('profile-new-password')?.value || '';
  const confirmPassword = document.getElementById('profile-confirm-password')?.value || '';

  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
  }

  const payload = {
    name: `${firstName} ${lastName}`.trim(),
    bio,
    location: loc,
    email
  };

  if (password) payload.password = password;

  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.message || 'Failed to update profile', 'error');
      return;
    }

    localStorage.setItem('rn-user', JSON.stringify(data.user));

    const nameDisplay = document.querySelector('.profile-name');
    const bioDisplay = document.querySelector('.profile-bio');
    const locDisplay = document.querySelector('.profile-location span:nth-child(2)');
    const avatarDisplay = document.querySelector('.profile-avatar');

    if (nameDisplay) nameDisplay.textContent = data.user.name;
    if (bioDisplay) bioDisplay.textContent = data.user.bio || 'No bio written yet.';
    if (locDisplay) locDisplay.textContent = data.user.location || 'Location not set';
    if (avatarDisplay && data.user.name) {
      avatarDisplay.textContent = data.user.name.charAt(0).toUpperCase();
    }

    const newPassInput = document.getElementById('profile-new-password');
    const confPassInput = document.getElementById('profile-confirm-password');
    if (newPassInput) newPassInput.value = '';
    if (confPassInput) confPassInput.value = '';

    showToast('Profile updated! ✓', 'success');
  } catch (err) {
    console.error('Failed to update profile:', err);
    showToast('Server error updating profile', 'error');
  }
}

// Initialise on load
document.addEventListener('DOMContentLoaded', loadUserProfile);
