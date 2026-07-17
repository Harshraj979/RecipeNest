//recipes db logic

const Recipe = require('../models/Recipe');
const User = require('../models/User');

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
    res.json({ recipes });
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
    const { title, description, category, difficulty, prepTime, cookTime, servings, ingredients, steps, tags, image } = req.body;

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
      image:       image       || '',
      author: { id: req.session.userId, name: author ? author.name : 'Anonymous' }
    });

    res.status(201).json({ recipe });
  } catch (err) {
    console.error('Create recipe error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
