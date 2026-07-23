/* ─── Browse Page JS ──────────────────────────────────────── */

let currentCategory = 'all';
let currentSearch = '';
let currentDiet = '';
let currentTimeFilter = '';
let currentPage = 1;
let allRecipes = [];
const recipesPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  fetchAndRenderRecipes();

  // Category pill filter
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.filter;
      currentPage = 1;
      fetchAndRenderRecipes(currentCategory, currentSearch, currentDiet, currentTimeFilter);
    });
  });

  // Handle search input
  const searchInput = document.getElementById('recipe-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      currentPage = 1;
      fetchAndRenderRecipes(currentCategory, currentSearch, currentDiet, currentTimeFilter);
    });
  }

  const dietFilter = document.getElementById('diet-filter');
  if (dietFilter) {
    dietFilter.addEventListener('change', (e) => {
      currentDiet = e.target.value;
      currentPage = 1;
      fetchAndRenderRecipes(currentCategory, currentSearch, currentDiet, currentTimeFilter);
    });
  }

  const timeFilter = document.getElementById('time-filter');
  if (timeFilter) {
    timeFilter.addEventListener('change', (e) => {
      currentTimeFilter = e.target.value;
      currentPage = 1;
      fetchAndRenderRecipes(currentCategory, currentSearch, currentDiet, currentTimeFilter);
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
      const label = this.textContent.trim();
      if (label === '…') return;
      if (label === '← Prev') {
        if (currentPage > 1) {
          currentPage -= 1;
          renderRecipes();
        }
        return;
      }
      if (label === 'Next →') {
        const totalPages = Math.max(1, Math.ceil(allRecipes.length / recipesPerPage));
        if (currentPage < totalPages) {
          currentPage += 1;
          renderRecipes();
        }
        return;
      }
      const page = Number(label);
      if (!Number.isNaN(page)) {
        currentPage = page;
        renderRecipes();
      }
    });
  });
});

// Fetch recipes from modular backend and render
async function fetchAndRenderRecipes(category = 'all', search = '', diet = '', timeFilter = '') {
  try {
    let url = '/api/recipes';
    const params = [];

    if (category && category !== 'all') {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (diet) {
      params.push(`diet=${encodeURIComponent(diet)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    allRecipes = Array.isArray(data.recipes) ? data.recipes : [];
    currentTimeFilter = timeFilter;
    renderRecipes();
  } catch (err) {
    console.error('Failed to fetch recipes:', err);
    showToast('Failed to load recipes', 'error');
  }
}

function applyTimeFilter(recipes, timeFilter) {
  if (!timeFilter) return recipes;
  const maxMinutes = Number(timeFilter);
  if (Number.isNaN(maxMinutes)) return recipes;
  return recipes.filter((recipe) => Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0) <= maxMinutes);
}

function renderPagination(totalPages) {
  const pagination = document.querySelector('.pagination');
  if (!pagination) return;

  const createPageButton = (label, page, options = {}) => {
    const button = document.createElement('button');
    button.className = 'page-btn';
    if (options.wide) button.classList.add('wide');
    if (options.active) button.classList.add('active');
    button.textContent = label;
    if (typeof page === 'number') {
      button.dataset.page = String(page);
    }
    if (options.disabled) button.disabled = true;
    return button;
  };

  pagination.innerHTML = '';
  pagination.appendChild(createPageButton('← Prev', currentPage - 1, { wide: true, disabled: currentPage === 1 }));

  const pagesToShow = [];
  if (totalPages <= 5) {
    for (let page = 1; page <= totalPages; page += 1) {
      pagesToShow.push(page);
    }
  } else {
    pagesToShow.push(1);
    if (currentPage > 3) pagesToShow.push('ellipsis-start');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let page = start; page <= end; page += 1) {
      pagesToShow.push(page);
    }

    if (currentPage < totalPages - 2) pagesToShow.push('ellipsis-end');
    pagesToShow.push(totalPages);
  }

  pagesToShow.forEach((item) => {
    if (item === 'ellipsis-start' || item === 'ellipsis-end') {
      const ellipsis = document.createElement('span');
      ellipsis.style.cssText = 'display:flex;align-items:center;padding:0 4px;color:var(--ink-muted);';
      ellipsis.textContent = '…';
      pagination.appendChild(ellipsis);
      return;
    }

    pagination.appendChild(createPageButton(String(item), item, { active: item === currentPage }));
  });

  pagination.appendChild(createPageButton('Next →', currentPage + 1, { wide: true, disabled: currentPage === totalPages }));

  pagination.querySelectorAll('.page-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const page = Number(button.dataset.page);
      if (Number.isNaN(page) || page === currentPage) return;
      currentPage = Math.max(1, Math.min(page, totalPages));
      renderRecipes();
    });
  });
}

function renderRecipes() {
  const gridContainer = document.getElementById('grid-container');
  const listContainer = document.getElementById('list-container');
  const resultCount = document.getElementById('result-count');

  if (!gridContainer || !listContainer) return;

  const filteredRecipes = applyTimeFilter(allRecipes, currentTimeFilter);
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / recipesPerPage));
  currentPage = Math.min(currentPage, totalPages);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const pageRecipes = filteredRecipes.slice(startIndex, startIndex + recipesPerPage);

  if (resultCount) {
    resultCount.textContent = `Showing ${pageRecipes.length} of ${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? '' : 's'}`;
  }

  gridContainer.innerHTML = '';
  listContainer.innerHTML = '';

  if (filteredRecipes.length === 0) {
    gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--ink-muted); margin-top: 24px;">No recipes found. Try a different filter.</p>';
    listContainer.innerHTML = '<p style="text-align: center; color: var(--ink-muted); margin-top: 24px;">No recipes found. Try a different filter.</p>';
    renderPagination(1);
    return;
  }

  pageRecipes.forEach((recipe) => {
    const imgUrl = recipe.image || 'assets/images/recipe3.png';
    const difficulty = recipe.difficulty || 'easy';
    const categoryLabel = (recipe.category || 'dinner').charAt(0).toUpperCase() + (recipe.category || 'dinner').slice(1);
    const categoryTagClass = recipe.category === 'breakfast' ? 'tag--sage' : (recipe.category === 'dessert' ? 'tag--rust' : '');
    const authorName = recipe.author?.name || 'Anonymous';
    const authorInitial = authorName.charAt(0).toUpperCase();
    const totalTime = Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0);
    const dietTag = Array.isArray(recipe.dietary) && recipe.dietary.length ? recipe.dietary[0].replace(/-/g, ' ') : '';

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
          <span class="tag">${totalTime} min</span>
          ${dietTag ? `<span class="tag">${dietTag}</span>` : ''}
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

    const listCard = document.createElement('div');
    listCard.className = 'recipe-list-item';
    listCard.dataset.category = recipe.category;
    listCard.innerHTML = `
      <img src="${imgUrl}" alt="${recipe.title}" />
      <div class="recipe-list-item__body">
        <div class="recipe-card__meta">
          <span class="tag ${categoryTagClass}">${categoryLabel}</span>
          <span class="tag" style="text-transform: capitalize;">${difficulty}</span>
          <span class="tag">${totalTime} min</span>
          ${dietTag ? `<span class="tag">${dietTag}</span>` : ''}
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

  renderPagination(totalPages);

  if (window.RecipeNestUI && window.RecipeNestUI.initDynamicElements) {
    window.RecipeNestUI.initDynamicElements();
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
