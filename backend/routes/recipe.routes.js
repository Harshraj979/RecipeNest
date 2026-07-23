// Recipe Router mapping endpoints to recipe controller methods
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const authCheck = require('../middleware/authCheck');

router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);
router.post('/', authCheck, recipeController.createRecipe);

module.exports = router;
