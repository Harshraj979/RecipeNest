// Recipe Router mapping endpoints to recipe controller methods
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const authCheck = require('../middleware/authCheck');
const upload = require('../middleware/upload');

// Handle Multer upload errors gracefully
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ message: err.message || 'Error processing image file.' });
    }
    next();
  });
};

router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);
router.post('/', authCheck, handleUpload, recipeController.createRecipe);
router.delete('/:id', authCheck, recipeController.deleteRecipe);

module.exports = router;

