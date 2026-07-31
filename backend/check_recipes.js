const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const Recipe = require('./models/Recipe');
  const User = require('./models/User');

  const recipes = await Recipe.find({ title: { $regex: /om/, $options: 'i' } }).lean();
  console.log("Found omelette recipes:", recipes);
  const allRecipes = await Recipe.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log("Latest recipes:", allRecipes.map(r => ({ title: r.title, category: r.category, author: r.author })));
  
  process.exit(0);
}

check().catch(console.error);
