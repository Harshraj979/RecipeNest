// Recipe Router mapping endpoints to recipe controller methods
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const authCheck = require('../middleware/authCheck');
const upload = require('../middleware/upload');

router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);
router.post('/', authCheck, upload.single('image'), recipeController.createRecipe);
router.delete('/:id', authCheck, recipeController.deleteRecipe);

module.exports = router;
