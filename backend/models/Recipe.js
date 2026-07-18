// Recipe model schema

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'dinner' },
  difficulty:  { type: String, default: 'easy' },
  prepTime:    { type: Number, default: 0 },
  cookTime:    { type: Number, default: 0 },
  servings:    { type: Number, default: 4 },
  ingredients: [{ amount: String, name: String }],
  steps:       [String],
  tags:        [String],
  dietary:     [String],
  image:       { type: String, default: '' },
  author: {
    id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', recipeSchema);
