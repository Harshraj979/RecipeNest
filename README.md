# RecipeNest 🍳

RecipeNest is a full-stack web application for discovering, sharing, and managing recipes.

## Project Structure
- **Backend:** Node.js, Express, and MongoDB (Mongoose).
- **Frontend:** Vanilla HTML, CSS, and JavaScript.

## Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine
- MongoDB Atlas cluster (or local MongoDB server)

## Getting Started

Follow these steps to run the application locally on your machine.

### 1. Install Dependencies
First, install the backend dependencies from the root directory:
```bash
npm install
```

### 2. Environment Variables
The project uses environment variables for configuration.

**Backend (`backend/.env`):**
Make sure you have a `backend/.env` file configured with your MongoDB connection string and Port:
```env
MONGO_URL=your_mongodb_connection_string
PORT=3000
```

**Frontend (`frontend/.env`):**
Ensure your frontend knows where the backend API is hosted:
```env
API_BASE_URL=http://localhost:3000
```

### 3. Start the Backend Server
Start the Node.js server from the root of your project:
```bash
npm run dev
```
*(This will start the backend server on `http://localhost:3000`, connect to MongoDB, and automatically restart if you make any code changes).*

### 4. Start the Frontend
Since the frontend uses vanilla HTML/JS, it needs to be served using a local web server to avoid CORS or `file://` protocol issues.

Open a **new terminal** window, navigate to the `frontend` folder, and run a static server (like `serve`):
```bash

for frontend directly type localhost:3000 in your web server (your localhost:3000 should be always be clear in case it is not type this : npx kill-port 3000 and type localhost:3000 again on web )

*(If prompted to install `serve`, type `y` to proceed. It will start a local server. If your backend is already running on port 3000, `serve` will automatically pick an open port like `3001` or `5000`).*


### 5. View the App
Open your browser and navigate to the local server URL provided by `npx serve` (e.g., `http://localhost:3001`) or Live Server to start using RecipeNest!
