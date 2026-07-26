//recipes db logic

const Recipe = require('../models/Recipe');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

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

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * Uses a stream upload so the file never touches disk.
 */
function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'recipenest', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Safely parse a JSON string, returning the fallback if parsing fails.
 * Multer sends form-data fields as strings, so arrays need parsing.
 */
function safeParse(value, fallback) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
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

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 }).lean();
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
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/recipes
exports.createRecipe = async (req, res) => {
  try {
    const { title, description, category, difficulty, prepTime, cookTime, servings } = req.body;

    // Multer delivers form-data fields as strings; parse JSON arrays
    const ingredients = safeParse(req.body.ingredients, []);
    const steps       = safeParse(req.body.steps, []);
    const tags        = safeParse(req.body.tags, []);
    const dietary     = safeParse(req.body.dietary, []);

    if (!title) {
      return res.status(400).json({ message: 'Recipe title is required.' });
    }

    // Upload image to Cloudinary if a file was provided
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
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
      ingredients,
      steps,
      tags,
      dietary,
      image:       imageUrl,
      author: { id: req.session.userId, name: author ? author.name : 'Anonymous' }
    });

    res.status(201).json({ recipe });
  } catch (err) {
    console.error('Create recipe error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// DELETE /api/recipes/:id
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

    // Check ownership
    if (String(recipe.author?.id) !== String(req.session.userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe.' });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully.' });
  } catch (err) {
    console.error('Delete recipe error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
