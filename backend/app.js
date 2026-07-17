// backend/app.js

const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Set up session cookie management
app.use(session({
  secret: 'recipenest-super-secret-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

app.use(express.static(path.join(__dirname, '../frontend')));

module.exports = app;
