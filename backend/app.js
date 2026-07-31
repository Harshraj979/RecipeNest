// backend/app.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const session = require('express-session');
const compression = require('compression');

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');

const app = express();

// Gzip compress all responses (HTML, CSS, JS, JSON)
app.use(compression());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Set up session cookie management
app.use(session({
  secret: process.env.SESSION_SECRET || 'recipenest-default-secret-key-12345',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days  
}));

// Prevent API response caching
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Serve static files without browser caching so UI updates immediately
app.use(express.static(path.join(__dirname, "../frontend"), {
  maxAge: 0,
  etag: false
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

module.exports = app;
