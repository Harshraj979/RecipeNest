/* ─── Browse Page JS ──────────────────────────────────────── */

let currentCategory = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  fetchAndRenderRecipes();

  // Category pill filter
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.filter;
      fetchAndRenderRecipes(currentCategory, currentSearch);
    });
  });

  // Handle search input
  const searchInput = document.getElementById('recipe-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      fetchAndRenderRecipes(currentCategory, currentSearch);
    });
  }

  // Handle category query parameter on load (e.g., browse.html?cat=breakfast)
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    const pill = document.querySelector(`.cat-pill[data-filter="${catParam}"]`);
    if (pill) {
      pill.click();
    }
  }

  // Pagination buttons styling
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.textContent === '← Prev' || this.textContent === 'Next →' || this.textContent === '…') return;
      document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

// Fetch recipes from modular backend and render
async function fetchAndRenderRecipes(category = 'all', search = '') {
  try {
    let url = '/api/recipes';
    const params = [];
    if (category && category !== 'all') {
      params.push(`category=${category}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    const res = await fetch(url);
    const data = await res.json();
    const recipes = data.recipes || [];

    const gridContainer = document.getElementById('grid-container');
    const listContainer = document.getElementById('list-container');
    const resultCount = document.getElementById('result-count');

    if (resultCount) {
      resultCount.textContent = `Showing ${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`;
    }

    if (!gridContainer || !listContainer) return;

    gridContainer.innerHTML = '';
    listContainer.innerHTML = '';

    if (recipes.length === 0) {
      gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--ink-muted); margin-top: 24px;">No recipes found. Be the first to publish one!</p>';
      listContainer.innerHTML = '<p style="text-align: center; color: var(--ink-muted); margin-top: 24px;">No recipes found. Be the first to publish one!</p>';
      return;
    }

    recipes.forEach(recipe => {
      const imgUrl = recipe.image || 'assets/images/recipe3.png';
      const difficulty = recipe.difficulty || 'easy';
      const categoryLabel = (recipe.category || 'dinner').charAt(0).toUpperCase() + (recipe.category || 'dinner').slice(1);
      const categoryTagClass = recipe.category === 'breakfast' ? 'tag--sage' : (recipe.category === 'dessert' ? 'tag--rust' : '');
      const authorName = recipe.author?.name || 'Anonymous';
      const authorInitial = authorName.charAt(0).toUpperCase();

      // Render Grid card
      const gridCard = document.createElement('article');
      gridCard.className = 'recipe-card fade-in';
      gridCard.dataset.category = recipe.category;
      gridCard.innerHTML = `
        <div class="recipe-card__img-wrap">
          <img src="${imgUrl}" alt="${recipe.title}" class="recipe-card__img" />
          <button class="recipe-card__bookmark">♡</button>
        </div>
        <div class="recipe-card__body">
          <div class="recipe-card__meta">
            <span class="tag ${categoryTagClass}">${categoryLabel}</span>
            <span class="tag" style="text-transform: capitalize;">${difficulty}</span>
            <span class="tag">${recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <a href="recipe.html?id=${recipe._id}"><h3 class="recipe-card__title">${recipe.title}</h3></a>
          <p class="recipe-card__desc">${recipe.description}</p>
          <div class="recipe-card__footer">
            <div class="recipe-card__author">
              <div class="avatar">${authorInitial}</div>
              <span>${authorName}</span>
            </div>
            <div class="recipe-card__rating"><span class="stars">★★★★★</span> 5.0</div>
          </div>
        </div>
      `;
      gridContainer.appendChild(gridCard);

      // Render List card
      const listCard = document.createElement('div');
      listCard.className = 'recipe-list-item';
      listCard.dataset.category = recipe.category;
      listCard.innerHTML = `
        <img src="${imgUrl}" alt="${recipe.title}" />
        <div class="recipe-list-item__body">
          <div class="recipe-card__meta">
            <span class="tag ${categoryTagClass}">${categoryLabel}</span>
            <span class="tag" style="text-transform: capitalize;">${difficulty}</span>
            <span class="tag">${recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <a href="recipe.html?id=${recipe._id}"><h3 class="recipe-list-item__title">${recipe.title}</h3></a>
          <div class="stat-row mt-8">
            <div class="recipe-card__author">
              <div class="avatar">${authorInitial}</div>
              <span>${authorName}</span>
            </div>
            <div class="recipe-card__rating"><span class="stars">★★★★★</span> 5.0</div>
            <button class="recipe-card__bookmark" style="position:static;width:auto;height:auto;background:none;border:none;font-size:1.2rem;">♡</button>
          </div>
        </div>
      `;
      listContainer.appendChild(listCard);
    });

    if (window.RecipeNestUI && window.RecipeNestUI.initDynamicElements) {
      window.RecipeNestUI.initDynamicElements();
    }

  } catch (err) {
    console.error('Failed to fetch recipes:', err);
    showToast('Failed to load recipes', 'error');
  }
}

/* View toggle (Grid / List) */
function setView(view) {
  const grid = document.getElementById('grid-container');
  const list = document.getElementById('list-container');
  const gridBtn = document.getElementById('grid-view-btn');
  const listBtn = document.getElementById('list-view-btn');
  if (!grid || !list || !gridBtn || !listBtn) return;

  if (view === 'grid') {
    grid.style.display = 'grid';
    list.style.display = 'none';
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  } else {
    grid.style.display = 'none';
    list.style.display = 'block';
    gridBtn.classList.remove('active');
    listBtn.classList.add('active');
  }
}

/* Difficulty filter */
function filterDiff(btn) {
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast('Filter applied: ' + btn.textContent, 'success');
}
