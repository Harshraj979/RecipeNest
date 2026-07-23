//recipes db logic

const Recipe = require('../models/Recipe');
const User = require('../models/User');

const DIETARY_KEYWORDS = {
  vegetarian: ['vegetarian'],
  vegan: ['vegan'],
  'gluten-free': ['gluten-free', 'gluten free'],
  'dairy-free': ['dairy-free', 'dairy free'],
  'nut-free': ['nut-free', 'nut free'],
  'non-vegetarian': ['non-vegetarian', 'non vegetarian', 'chicken', 'beef', 'pork', 'lamb', 'fish', 'seafood', 'shrimp', 'salmon', 'tuna', 'turkey', 'bacon', 'sausage']
};

function getRecipeText(recipe) {
  const parts = [recipe.title, recipe.description, ...(recipe.tags || []), ...(recipe.dietary || [])];
  (recipe.ingredients || []).forEach((ingredient) => {
    if (ingredient?.amount) parts.push(ingredient.amount);
    if (ingredient?.name) parts.push(ingredient.name);
  });
  return parts.join(' ').toLowerCase();
}

function matchesDietaryFilter(recipe, diet) {
  if (!diet) return true;

  const normalizedDiet = String(diet).toLowerCase();
  const keywords = DIETARY_KEYWORDS[normalizedDiet] || [normalizedDiet];
  const text = getRecipeText(recipe);

  if (normalizedDiet === 'non-vegetarian') {
    return keywords.some((keyword) => text.includes(keyword));
  }

  if (Array.isArray(recipe.dietary) && recipe.dietary.map((item) => String(item).toLowerCase()).includes(normalizedDiet)) {
    return true;
  }

  if (Array.isArray(recipe.tags) && recipe.tags.map((item) => String(item).toLowerCase()).includes(normalizedDiet)) {
    return true;
  }

  return keywords.some((keyword) => text.includes(keyword));
}

// GET /api/recipes
exports.getRecipes = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    const filteredRecipes = req.query.diet
      ? recipes.filter((recipe) => matchesDietaryFilter(recipe, req.query.diet))
      : recipes;

    res.json({ recipes: filteredRecipes });
  } catch (err) {
    console.error('Get recipes error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/recipes/:id
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/recipes
exports.createRecipe = async (req, res) => {
  try {
    const { title, description, category, difficulty, prepTime, cookTime, servings, ingredients, steps, tags, dietary, image } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Recipe title is required.' });
    }

    const author = await User.findById(req.session.userId).select('name');

    const recipe = await Recipe.create({
      title,
      description,
      category:    category    || 'dinner',
      difficulty:  difficulty  || 'easy',
      prepTime:    Number(prepTime)  || 0,
      cookTime:    Number(cookTime)  || 0,
      servings:    Number(servings)  || 4,
      ingredients: ingredients || [],
      steps:       steps       || [],
      tags:        tags        || [],
      dietary:     dietary     || [],
      image:       image       || '',
      author: { id: req.session.userId, name: author ? author.name : 'Anonymous' }
    });

    res.status(201).json({ recipe });
  } catch (err) {
    console.error('Create recipe error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
