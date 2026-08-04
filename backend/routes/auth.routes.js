// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.put('/profile', authController.updateProfile);
router.post('/save/:recipeId', authController.saveRecipe);
router.get('/saved', authController.getSavedRecipes);
router.get('/saved/ids', authController.getSavedIds);

module.exports = router;
