// MongoDB connection config
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/recipenest';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('MongoDB Connected successfully!');
  } 
  catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;

