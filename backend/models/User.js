// backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true },  // hashed
  bio:          { type: String, default: '' },
  location:     { type: String, default: '' },
  savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
