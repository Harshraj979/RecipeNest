require('dotenv').config({ path: './backend/.env' });
// Entry point: Connects to Database and starts the modular server

const app = require('./backend/app');
const connectDB = require('./backend/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`RecipeNest is running!`);
  });
}

startServer();
