/* ─── Create Recipe Page JS ─────────────────────────────────── */

/* ── Photo preview ── */
function previewPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const previewImg = document.getElementById('preview-img');
    const placeholder = document.getElementById('upload-placeholder');
    const previewContainer = document.getElementById('photo-preview');

    if (previewImg) previewImg.src = e.target.result;
    if (placeholder) placeholder.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'block';
    
    updateProgress();
  };
  reader.readAsDataURL(input.files[0]);
}

function removePhoto(e) {
  e.stopPropagation();
  const previewImg = document.getElementById('preview-img');
  const placeholder = document.getElementById('upload-placeholder');
  const previewContainer = document.getElementById('photo-preview');
  const coverPhoto = document.getElementById('cover-photo');

  if (previewImg) previewImg.src = '';
  if (placeholder) placeholder.style.display = 'block';
  if (previewContainer) previewContainer.style.display = 'none';
  if (coverPhoto) coverPhoto.value = '';
  
  updateProgress();
}

/* ── Progress tracker ── */
function updateProgress() {
  const previewImg = document.getElementById('preview-img');
  const titleInput = document.getElementById('recipe-title');
  const descInput = document.getElementById('recipe-desc');
  const catInput = document.getElementById('recipe-category');
  
  const dotPhoto = document.getElementById('dot-photo');
  const dotTitle = document.getElementById('dot-title');
  const dotCategory = document.getElementById('dot-category');
  const dotIngredients = document.getElementById('dot-ingredients');
  const dotSteps = document.getElementById('dot-steps');

  // Photo check
  const hasPhoto = previewImg && previewImg.src && previewImg.src !== '' && !previewImg.src.endsWith('create.html');
  if (dotPhoto) dotPhoto.classList.toggle('done', hasPhoto);

  // Title & description check
  const title = titleInput ? titleInput.value.trim() : '';
  const desc = descInput ? descInput.value.trim() : '';
  if (dotTitle) dotTitle.classList.toggle('done', title.length > 2 && desc.length > 5);

  // Category check
  const cat = catInput ? catInput.value : '';
  if (dotCategory) dotCategory.classList.toggle('done', cat !== '');

  // Ingredients check
  let hasIngredients = false;
  const ingredientInputs = document.querySelectorAll('#ingredient-rows .ingredient-row input[placeholder*="Ingredient"], #ingredient-rows .ingredient-row input[placeholder*="ingredient"]');
  ingredientInputs.forEach(input => {
    if (input.value.trim().length > 0) hasIngredients = true;
  });
  if (dotIngredients) dotIngredients.classList.toggle('done', hasIngredients);

  // Steps check
  let hasSteps = false;
  const stepTextareas = document.querySelectorAll('#step-rows .step-row textarea');
  stepTextareas.forEach(textarea => {
    if (textarea.value.trim().length > 0) hasSteps = true;
  });
  if (dotSteps) dotSteps.classList.toggle('done', hasSteps);
}

/* ── Add ingredient ── */
function addIngredient() {
  const rows = document.getElementById('ingredient-rows');
  if (!rows) return;
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <input type="text" class="form-input" placeholder="Amount" style="text-align:center;" />
    <input type="text" class="form-input" placeholder="Ingredient name" />
    <button type="button" class="remove-btn" onclick="removeRow(this, '#ingredient-rows .ingredient-row')">−</button>
  `;
  rows.appendChild(row);
  row.querySelector('input').focus();
  updateProgress();
}

/* ── Add step ── */
function addStep() {
  const rows = document.getElementById('step-rows');
  if (!rows) return;
  const num = rows.querySelectorAll('.step-row').length + 1;
  const row = document.createElement('div');
  row.className = 'step-row';
  row.innerHTML = `
    <div class="step-num-badge">${num}</div>
    <textarea class="form-textarea" placeholder="Describe this step…" style="min-height:80px;"></textarea>
    <button type="button" class="remove-btn" style="margin-top:10px;" onclick="removeRow(this, '#step-rows .step-row');renumberSteps()">−</button>
  `;
  rows.appendChild(row);
  row.querySelector('textarea').focus();
  updateProgress();
}

/* ── Remove row ── */
function removeRow(btn, selector) {
  const allRows = document.querySelectorAll(selector);
  if (allRows.length <= 1) {
    showToast('You need at least one row', 'error');
    return;
  }
  const rowElement = btn.closest(selector.split(' ').pop());
  if (rowElement) {
    rowElement.remove();
    updateProgress();
  }
}

/* ── Renumber steps ── */
function renumberSteps() {
  document.querySelectorAll('#step-rows .step-num-badge').forEach((badge, i) => {
    badge.textContent = i + 1;
  });
}

/* ── Tag input ── */
function handleTagKey(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const val = e.target.value.trim().replace(/,$/, '');
    if (!val) return;
    const wrap = document.getElementById('tag-wrap');
    if (!wrap) return;
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    chip.innerHTML = `<span>${val}</span><button type="button" onclick="this.parentElement.remove()">✕</button>`;
    wrap.insertBefore(chip, e.target);
    e.target.value = '';
  }
}

/* ── Save draft ── */
function saveDraft() {
  showToast('Draft saved!', 'success');
}

/* ── Publish ── */
async function publishRecipe(e) {
  if (e) e.preventDefault();
  
  const titleInput = document.getElementById('recipe-title');
  const descInput = document.getElementById('recipe-desc');
  const catInput = document.getElementById('recipe-category');
  const diffInput = document.getElementById('recipe-difficulty');
  const prepInput = document.getElementById('prep-time');
  const cookInput = document.getElementById('cook-time');
  const servingsInput = document.getElementById('servings');

  if (!titleInput || !descInput) return;

  const title = titleInput.value.trim();
  if (!title) {
    showToast('Please add a recipe title', 'error');
    titleInput.focus();
    return;
  }
  const desc = descInput.value.trim();
  if (!desc) {
    showToast('Please add a description', 'error');
    descInput.focus();
    return;
  }

  // Parse ingredients
  const ingredients = [];
  document.querySelectorAll('#ingredient-rows .ingredient-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const amount = inputs[0]?.value.trim() || '';
    const name = inputs[1]?.value.trim() || '';
    if (name) {
      ingredients.push({ amount, name });
    }
  });

  // Parse steps
  const steps = [];
  document.querySelectorAll('#step-rows .step-row textarea').forEach(textarea => {
    const stepText = textarea.value.trim();
    if (stepText) {
      steps.push(stepText);
    }
  });

  // Parse tags
  const tags = [];
  document.querySelectorAll('#tag-wrap .tag-chip span').forEach(span => {
    tags.push(span.textContent.trim());
  });

  const previewImg = document.getElementById('preview-img');
  const image = (previewImg && previewImg.src && !previewImg.src.endsWith('create.html') && !previewImg.src.endsWith('create.html#')) ? previewImg.src : '';

  const payload = {
    title,
    description: desc,
    category: catInput?.value || 'dinner',
    difficulty: diffInput?.value || 'easy',
    prepTime: parseInt(prepInput?.value) || 0,
    cookTime: parseInt(cookInput?.value) || 0,
    servings: parseInt(servingsInput?.value) || 4,
    ingredients,
    steps,
    tags,
    image
  };

  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.message || 'Failed to publish recipe', 'error');
      return;
    }

    showToast('Recipe published successfully! 🎉', 'success');
    setTimeout(() => { 
      window.location.href = `recipe.html?id=${data.recipe._id}`; 
    }, 1200);

  } catch (err) {
    console.error('Failed to publish recipe:', err);
    showToast('Server error publishing recipe', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check auth state on load
  fetch('/api/auth/me').then(res => {
    if (!res.ok) {
      showToast('Please sign in first', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  });

  /* ── Title counter & progress binders ── */
  const titleInput = document.getElementById('recipe-title');
  if (titleInput) {
    titleInput.addEventListener('input', function() {
      const countEl = document.getElementById('title-count');
      if (countEl) countEl.textContent = this.value.length;
      updateProgress();
    });
  }

  const descInput = document.getElementById('recipe-desc');
  if (descInput) {
    descInput.addEventListener('input', updateProgress);
  }

  // Listen for input changes in ingredients and steps to update progress reactively
  const ingRows = document.getElementById('ingredient-rows');
  if (ingRows) {
    ingRows.addEventListener('input', updateProgress);
  }
  const stepRows = document.getElementById('step-rows');
  if (stepRows) {
    stepRows.addEventListener('input', updateProgress);
  }

  // Trigger initial progress check
  updateProgress();
});
