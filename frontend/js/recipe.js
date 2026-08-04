/* ─── Recipe Detail Page JS ─────────────────────────────────── */

let servings = 4;
let baseServings = 4;

function changeServings(delta) {
  servings = Math.max(1, Math.min(12, servings + delta));
  const servingsCount = document.getElementById('servings-count');
  if (servingsCount) servingsCount.textContent = servings;
  
  document.querySelectorAll('.ingredient-amount').forEach(el => {
    const base = parseFloat(el.dataset.base);
    if (!isNaN(base)) {
      const scaled = (base / baseServings) * servings;
      // Format number nicely
      el.textContent = scaled % 1 === 0 ? scaled : scaled.toFixed(1);
    }
  });
}

function toggleIngredient(li) {
  const cb = li.querySelector('input[type="checkbox"]');
  if (cb) {
    cb.checked = !cb.checked;
    li.classList.toggle('checked', cb.checked);
  }
}

function shareRecipe() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  }
}

function printRecipe() {
  window.print();
}

// Fetch and render recipe dynamically on load
async function loadRecipeDetails() {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get('id');
  if (!recipeId) {
    // No ID in URL — keep static default content (Thai Green Curry)
    setupCheckboxListeners();
    wireSaveButton(null);
    return;
  }

  try {
    const res = await fetch(`/api/recipes/${recipeId}`);
    if (!res.ok) {
      showToast('Recipe not found', 'error');
      return;
    }

    const data = await res.json();
    const recipe = data.recipe;
    wireSaveButton(recipe._id);

    // Update Servings configuration
    baseServings = recipe.servings || 4;
    servings = baseServings;
    const servingsCount = document.getElementById('servings-count');
    if (servingsCount) servingsCount.textContent = servings;

    // Update Hero elements
    const heroTitle = document.querySelector('.recipe-hero__content h1');
    const heroImage = document.querySelector('.recipe-hero__img');
    const heroCategory = document.querySelector('.recipe-hero__content .tag');
    const heroBreadcrumbCat = document.querySelector('.recipe-hero__content a[href="browse.html"] + span + span');

    if (heroTitle) heroTitle.textContent = recipe.title;
    if (heroImage && recipe.image) heroImage.src = recipe.image;
    if (heroCategory) {
      heroCategory.textContent = recipe.category;
      heroCategory.style.textTransform = 'capitalize';
    }
    if (heroBreadcrumbCat) {
      heroBreadcrumbCat.textContent = recipe.category;
      heroBreadcrumbCat.style.textTransform = 'capitalize';
    }

    // Update Meta boxes
    const metaVals = document.querySelectorAll('.recipe-meta-bar .meta-box__val');
    if (metaVals.length >= 5) {
      metaVals[0].textContent = `${recipe.prepTime} min`;
      metaVals[1].textContent = `${recipe.cookTime} min`;
      metaVals[2].textContent = `${recipe.prepTime + recipe.cookTime} min`;
      metaVals[3].textContent = `${recipe.servings} people`;
      metaVals[4].textContent = recipe.difficulty || 'Easy';
      metaVals[4].style.textTransform = 'capitalize';
    }

    // Update Author card
    const authorName = recipe.author?.name || 'Anonymous';
    const authorAvatar = document.querySelector('.author-card .avatar');
    const authorHeroAvatar = document.querySelector('.recipe-hero__content .avatar');
    const authorCardName = document.querySelector('.author-card__name');
    const authorCardBio = document.querySelector('.author-card__bio');

    if (authorAvatar) authorAvatar.textContent = authorName.charAt(0).toUpperCase();
    if (authorHeroAvatar) authorHeroAvatar.textContent = authorName.charAt(0).toUpperCase();
    if (authorCardName) authorCardName.textContent = authorName;
    if (authorCardBio) authorCardBio.textContent = `Published creator · ${recipe.category} expert`;

    // Update Intro
    const introEl = document.querySelector('.recipe-intro');
    if (introEl) introEl.textContent = recipe.description || 'Delicious homemade recipe.';

    // Render Ingredients
    const ingContainer = document.getElementById('recipe-ingredients-container');
    if (ingContainer && recipe.ingredients) {
      ingContainer.innerHTML = '';
      const ul = document.createElement('ul');
      ul.className = 'ingredient-list';
      recipe.ingredients.forEach(ing => {
        const li = document.createElement('li');
        li.className = 'ingredient-item';
        li.onclick = function() { toggleIngredient(this); };
        li.innerHTML = `
          <input type="checkbox" />
          <span class="ingredient-amount" data-base="${parseFloat(ing.amount) || ing.amount}">${ing.amount}</span>
          <span>${ing.name}</span>
        `;
        ul.appendChild(li);
      });
      ingContainer.appendChild(ul);
    }

    // Render Instructions
    const stepsContainer = document.getElementById('recipe-steps-container');
    if (stepsContainer && recipe.steps) {
      stepsContainer.innerHTML = '';
      const ol = document.createElement('ol');
      ol.className = 'steps-list';
      recipe.steps.forEach((step, index) => {
        const li = document.createElement('li');
        li.className = 'step-item';
        li.innerHTML = `
          <div class="step-num">${index + 1}</div>
          <div class="step-content">
            <p>${step}</p>
          </div>
        `;
        ol.appendChild(li);
      });
      stepsContainer.appendChild(ol);
    }

    // Render Tags
    const tagsContainer = document.querySelector('.sidebar-card:nth-child(3) div');
    if (tagsContainer && recipe.tags) {
      tagsContainer.innerHTML = '';
      recipe.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        tagsContainer.appendChild(span);
      });
    }

    setupCheckboxListeners();

  } catch (err) {
    console.error('Failed to load recipe details:', err);
    showToast('Failed to load recipe details', 'error');
  }
}

function setupCheckboxListeners() {
  document.querySelectorAll('.ingredient-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('click', (e) => {
      e.stopPropagation();
      cb.parentElement.classList.toggle('checked', cb.checked);
    });
  });
}

function wireSaveButton(recipeId) {
  const saveBtn = document.getElementById('save-btn');
  if (!saveBtn) return;

  if (!recipeId) {
    // No real ID — just show a sign-in prompt
    saveBtn.addEventListener('click', () => {
      if (window.toggleSaveRecipe) {
        window.toggleSaveRecipe(null, saveBtn);
      }
    });
    return;
  }

  saveBtn.dataset.recipeId = recipeId;

  // Check if already saved
  fetch('/api/auth/saved/ids')
    .then(r => r.json())
    .then(data => {
      const savedIds = data.ids || [];
      if (savedIds.includes(String(recipeId))) {
        saveBtn.textContent = '♥ Saved';
        saveBtn.classList.add('saved');
      }
    })
    .catch(() => {});

  saveBtn.addEventListener('click', async () => {
    if (window.toggleSaveRecipe) {
      await window.toggleSaveRecipe(recipeId, saveBtn);
      // Update button label based on saved state
      if (saveBtn.classList.contains('saved')) {
        saveBtn.textContent = '♥ Saved';
      } else {
        saveBtn.textContent = '♡ Save recipe';
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecipeDetails();
});
