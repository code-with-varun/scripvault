// index.js (Backend Entry Point)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Required for frontend to communicate with backend
const dotenv = require('dotenv'); // To load environment variables
const fs = require('fs').promises; // For asynchronous file system operations
const path = require('path');     // For resolving file paths

// Load environment variables from .env file.
// If .env is in the same directory as index.js, dotenv.config() is sufficient.
// If it's in a parent directory, use { path: '../.env' }.
dotenv.config(); // Assumes .env is in the current working directory (server folder)

const app = express();
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware
app.use(cors()); // Enable CORS for all incoming requests from your frontend
app.use(express.json()); // Replaces body-parser for parsing JSON request bodies

// --- DEBUGGING: Log MONGODB_URI to check if it's loaded ---
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded (contains value)' : 'Undefined or empty');
// --- END DEBUGGING ---

// Import your route files
const { router: authRoutes } = require('./routes/auth'); // Destructure 'router' from the authRoutes import
const profileRouter = require('./routes/profile');
const portfolioRouter = require('./routes/portfolio');
const investmentRouter = require('./routes/investment');
const exploreRouter = require('./routes/explore');
const askExpertsRouter = require('./routes/askExperts');
const watchlistRouter = require('./routes/watchlist');

// Import your Stock model for seeding
const Stock = require('./models/Stock');

// --- Data Seeding Logic for Stocks from explore.json ---
const seedStocks = async () => {
  try {
    const stockCount = await Stock.countDocuments();
    if (stockCount === 0) {
      console.log('Stock collection is empty. Seeding initial data from explore.json...');

      // Construct the path to explore.json.
      // This assumes 'data' folder is a sibling to the 'server' folder.
      // E.g., project-root/data/explore.json if index.js is in project-root/server/
      const exploreJsonPath = path.join(__dirname, '..', 'server/data', 'explore.json');

      const rawData = await fs.readFile(exploreJsonPath, 'utf8');
      const exploreData = JSON.parse(rawData);

      // Map the frontend JSON data structure to match the backend Stock model fields
      const formattedData = exploreData.map(item => ({
        // Ensure a symbol exists; generate one if missing from the name
        symbol: item.symbol || item.name.substring(0, Math.min(item.name.length, 5)).toUpperCase().replace(/[^A-Z0-9]/g, ''),
        name: item.name,
        // Map frontend plural types to backend singular enum values
        type: item.type === "Mutual Funds" ? "Mutual Fund" : item.type === "Stocks" ? "Stock" : item.type === "ETFs" ? "ETF" : item.type === "NFOs" ? "NFO" : item.type,
        subType: item.subType,
        risk: item.risk,
        // Parse numeric values, removing currency symbols and percentage signs
        currentPrice: parseFloat(item.currentPrice?.replace(/[₹,]/g, '')) || parseFloat(item.marketValue?.replace(/[₹,]/g, '')) || 0,
        dayChange: parseFloat(item.dayChange?.replace(/[%+]/g, '')) || 0,
        oneYearReturn: parseFloat(item.oneYearCAGR?.replace(/[%]/g, '')) || parseFloat(item.oneYearReturn?.replace(/[%]/g, '')) || 0,
        threeYearReturn: parseFloat(item.threeYearCAGR?.replace(/[%]/g, '')) || parseFloat(item.threeYearReturn?.replace(/[%]/g, '')) || 0,
        fiveYearReturn: parseFloat(item.fiveYearCAGR?.replace(/[%]/g, '')) || parseFloat(item.fiveYearReturn?.replace(/[%]/g, '')) || 0,
        logo: item.logo,
        trendData: item.trendData || [] // Ensure trendData is an array
      }));

      await Stock.insertMany(formattedData);
      console.log('Initial stock data seeded successfully!');
    } else {
      console.log('Stock collection already contains data. Skipping seeding.');
    }
  } catch (err) {
    console.error("Error seeding stock data:", err);
    // If the file is not found, or there's a parsing error, the app should still start
    // but log a clear message.
    if (err.code === 'ENOENT') {
      console.error(`Error: explore.json not found at expected path. Please ensure it's at '${path.join(__dirname, '..', 'data', 'explore.json')}'`);
    }
  }
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI) // Use environment variable for the connection string
  .then(() => {
    console.log("Connected to MongoDB database.");
    // Call seed function after successful database connection
    seedStocks();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit the process if database connection fails
  });

// Mount your routes
app.use('/auth', authRoutes); // Authentication routes (e.g., /auth/register, /auth/login)
app.use('/api/profile', profileRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/investment', investmentRouter);
app.use('/api/explore', exploreRouter);
app.use('/api/ask-experts', askExpertsRouter);
app.use('/api/watchlist', watchlistRouter);

// Basic root route for testing if the server is running
app.get('/', (req, res) => {
  res.send('ScripVault Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
