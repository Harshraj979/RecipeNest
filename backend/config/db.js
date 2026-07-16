// MongoDB connection & auto-seeding default recipes


const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/recipenest';

const defaultRecipes = [
  {
    title: "Smashed Avocado Toast with Poached Egg",
    description: "Creamy avocado on toasted sourdough, topped with a perfectly poached egg.",
    category: "breakfast",
    difficulty: "easy",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    ingredients: [
      { amount: "2 slices", name: "sourdough bread" },
      { amount: "1", name: "ripe avocado" },
      { amount: "2", name: "fresh eggs" },
      { amount: "1 tsp", name: "lemon juice" },
      { amount: "to taste", name: "salt, pepper, chili flakes" }
    ],
    steps: [
      "Toast the sourdough bread slices until golden brown.",
      "Mash the avocado with lemon juice, salt, and pepper in a small bowl.",
      "Poach the eggs in simmering water with a splash of vinegar for 3 minutes.",
      "Spread the smashed avocado over the toast, top with poached eggs, and sprinkle chili flakes."
    ],
    tags: ["breakfast", "easy", "avocado"],
    image: "assets/images/recipe1.png",
    author: { name: "Sarah Chen" }
  },
  {
    title: "Molten Chocolate Lava Cake",
    description: "Warm, gooey chocolate cake with a runny molten centre.",
    category: "dessert",
    difficulty: "medium",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { amount: "100g", name: "dark chocolate" },
      { amount: "50g", name: "butter" },
      { amount: "2", name: "eggs" },
      { amount: "50g", name: "sugar" },
      { amount: "30g", name: "flour" }
    ],
    steps: [
      "Preheat oven to 200°C (400°F). Grease 2 ramekins.",
      "Melt the chocolate and butter together and let cool slightly.",
      "Whisk eggs and sugar until thick, then fold in melted chocolate and flour.",
      "Divide between ramekins and bake for 12-14 minutes until edges are firm but centers soft."
    ],
    tags: ["chocolate", "dessert", "lava-cake"],
    image: "assets/images/recipe2.png",
    author: { name: "Marco Rossi" }
  },
  {
    title: "Authentic Thai Green Curry",
    description: "Fragrant curry made with homemade green paste and coconut milk.",
    category: "dinner",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    ingredients: [
      { amount: "6", name: "green bird's eye chillies" },
      { amount: "2", name: "stalks lemongrass" },
      { amount: "4", name: "kaffir lime leaves" },
      { amount: "1", name: "thumb galangal" },
      { amount: "400ml", name: "full-fat coconut milk" },
      { amount: "500g", name: "chicken thighs" },
      { amount: "2 tbsp", name: "fish sauce" },
      { amount: "1 tbsp", name: "palm sugar" }
    ],
    steps: [
      "Pound chillies, lemongrass, galangal, and lime leaves in a mortar to form a paste.",
      "Fry the paste in a wok with half of the coconut milk until fragrant.",
      "Add chicken thighs and stir to coat, then pour in remaining coconut milk and simmer.",
      "Season with fish sauce and palm sugar, stir through Thai basil, and serve with jasmine rice."
    ],
    tags: ["curry", "thai", "spicy"],
    image: "assets/images/recipe3.png",
    author: { name: "Arisa Tan" }
  },
  {
    title: "Rustic Sourdough Loaf",
    description: "Crusty sourdough using a 100% hydration starter. Worth every minute.",
    category: "baking",
    difficulty: "hard",
    prepTime: 10,
    cookTime: 110,
    servings: 8,
    ingredients: [
      { amount: "500g", name: "bread flour" },
      { amount: "350g", name: "water" },
      { amount: "100g", name: "sourdough starter" },
      { amount: "10g", name: "salt" }
    ],
    steps: [
      "Mix flour, water, and starter and let autolyse for 30 minutes, then add salt.",
      "Perform stretch and folds every 30 minutes for 2 hours.",
      "Bulk ferment until doubled, then shape and proof in a banneton basket.",
      "Bake in a preheated Dutch oven at 230°C (450°F) for 20 minutes covered, then 25 minutes uncovered."
    ],
    tags: ["bread", "sourdough", "baking"],
    image: "assets/images/recipe4.png",
    author: { name: "James Park" }
  },
  {
    title: "Mediterranean Chickpea Bowl",
    description: "Vibrant bowl with roasted chickpeas, feta and lemony tahini dressing.",
    category: "lunch",
    difficulty: "easy",
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    ingredients: [
      { amount: "1 can", name: "chickpeas, drained" },
      { amount: "50g", name: "feta cheese" },
      { amount: "1", name: "cucumber, sliced" },
      { amount: "2 tbsp", name: "tahini" },
      { amount: "1 tbsp", name: "lemon juice" }
    ],
    steps: [
      "Rinse and dry the chickpeas, toss with olive oil and spices, and lightly warm or roast.",
      "Assemble bowls with chickpeas, crumbled feta, sliced cucumbers, and olives.",
      "Whisk tahini with lemon juice and a splash of water to make a smooth dressing.",
      "Drizzle dressing over the bowls and garnish with parsley."
    ],
    tags: ["lunch", "vegetarian", "healthy"],
    image: "assets/images/recipe5.png",
    author: { name: "Leila Hassan" }
  },
  {
    title: "Cacio e Pepe Pasta",
    description: "The Roman classic — just three ingredients done perfectly.",
    category: "dinner",
    difficulty: "easy",
    prepTime: 5,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { amount: "200g", name: "spaghetti" },
      { amount: "1 cup", name: "Pecorino Romano cheese, grated" },
      { amount: "1 tbsp", name: "black peppercorns, crushed" }
    ],
    steps: [
      "Boil spaghetti in salted water until very al dente, saving the pasta water.",
      "Toast crushed black pepper in a dry pan until fragrant, then ladle in some pasta water.",
      "Add pasta to the pan and toss, then remove from heat and stir in Pecorino cheese rapidly.",
      "Keep stirring and adding pasta water as needed to create a glossy, creamy sauce."
    ],
    tags: ["pasta", "italian", "dinner"],
    image: "assets/images/recipe3.png",
    author: { name: "Riya Sharma" }
  }
];

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB at:', MONGO_URL);

    const count = await Recipe.countDocuments();
    if (count === 0) {
      console.log('Seeding database with default recipes...');
      await Recipe.insertMany(defaultRecipes);
      console.log('Database successfully seeded!');
    }
  } 
  catch (err) {
    console.error('MongoDB connection failed:', err.message);
    
    process.exit(1);
  }
}

module.exports = connectDB;
