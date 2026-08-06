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
const transactionRouter = require('./routes/transaction');

// Import your Stock and User models for seeding
const Stock = require('./models/Stock');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const seedDemoUser = async () => {
  try {
    const existing = await User.findOne({ email: 'demo@scripvault.com' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const demoUser = new User({
        email: 'demo@scripvault.com',
        password: hashedPassword,
        fullName: 'Demo User',
        phone: '9876543210',
        address: '123 Investment Street',
        riskTolerance: 'moderate',
        networth: 150000,
        investments: 120000
      });
      await demoUser.save();
      console.log('Demo user seeded: demo@scripvault.com / password123');
    }
  } catch (err) {
    console.error('Error seeding demo user:', err.message);
  }
};

// --- Data Seeding Logic for Stocks from explore.json ---
const seedStocks = async () => {
  try {
    const exploreJsonPath = path.join(__dirname, '..', 'server/data', 'explore.json');
    const rawData = await fs.readFile(exploreJsonPath, 'utf8');
    const exploreData = JSON.parse(rawData);

    const usedSymbols = new Set();
    let newItemsCount = 0;

    for (let idx = 0; idx < exploreData.length; idx++) {
      const item = exploreData[idx];
      let sym = item.symbol || item.name.substring(0, Math.min(item.name.length, 5)).toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (usedSymbols.has(sym)) {
        sym = `${sym}_${idx}`;
      }
      usedSymbols.add(sym);

      const isMF = item.type === "Mutual Funds" || item.type === "Mutual Fund";
      const rawPrice = parseFloat(item.currentPrice?.replace(/[₹,]/g, '')) || parseFloat(item.nav?.replace(/[₹,]/g, '')) || 0;
      const defaultNav = isMF ? (Math.floor(Math.random() * 40) + 15) : 100; // Realistic NAV between ₹15 and ₹55
      const finalPrice = (rawPrice > 0 && rawPrice < 20000) ? rawPrice : defaultNav;

      const formatted = {
        symbol: sym,
        name: item.name,
        type: isMF ? "Mutual Fund" : item.type === "Stocks" ? "Stock" : item.type === "ETFs" ? "ETF" : item.type === "NFOs" ? "NFO" : item.type,
        subType: item.subType,
        risk: item.risk,
        currentPrice: finalPrice,
        dayChange: parseFloat(item.dayChange?.replace(/[%+]/g, '')) || 0,
        oneYearReturn: parseFloat(item.oneYearCAGR?.replace(/[%]/g, '')) || parseFloat(item.oneYearReturn?.replace(/[%]/g, '')) || 0,
        threeYearReturn: parseFloat(item.threeYearCAGR?.replace(/[%]/g, '')) || parseFloat(item.threeYearReturn?.replace(/[%]/g, '')) || 0,
        fiveYearReturn: parseFloat(item.fiveYearCAGR?.replace(/[%]/g, '')) || parseFloat(item.fiveYearReturn?.replace(/[%]/g, '')) || 0,
        logo: item.logo,
        trendData: item.trendData || [
          parseFloat((Math.random() * 50 + 50).toFixed(2)),
          parseFloat((Math.random() * 50 + 60).toFixed(2)),
          parseFloat((Math.random() * 50 + 70).toFixed(2)),
          parseFloat((Math.random() * 50 + 80).toFixed(2))
        ]
      };

      const result = await Stock.updateOne({ symbol: sym }, { $set: formatted }, { upsert: true });
      if (result.upsertedCount > 0) {
        newItemsCount++;
      }
    }
    console.log(`Stock database check complete. Seeded ${newItemsCount} new assets! Total: ${exploreData.length}`);
  } catch (err) {
    console.error("Error seeding stock data:", err);
  }
};

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log("Connecting to live MongoDB Atlas database...");
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB Atlas database successfully!");
    await seedStocks();
    await seedDemoUser();
    const { startMarketEngine } = require('./services/marketEngine');
    startMarketEngine();
  } catch (err) {
    console.log("Primary MongoDB URI unavailable (" + err.message + "). Falling back to MongoMemoryServer...");
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({ instance: { dbName: 'scripvault' } });
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log("Connected to MongoMemoryServer at:", uri);
      await seedStocks();
      await seedDemoUser();
      const { startMarketEngine } = require('./services/marketEngine');
      startMarketEngine();
    } catch (memErr) {
      console.error("MongoMemoryServer fallback failed:", memErr.message);
    }
  }
};

connectDB();

// Mount your routes
app.use('/auth', authRoutes); // Authentication routes (e.g., /auth/register, /auth/login)
app.use('/api/profile', profileRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/investment', investmentRouter);
app.use('/api/investments', investmentRouter);
app.use('/api/explore', exploreRouter);
app.use('/api/ask-experts', askExpertsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/transactions', transactionRouter);

// Serve static React production build assets if available (Monolithic setup per upGrad Capstone specs)
const frontendBuildPath = path.join(__dirname, '../scripvault-frontend/build');
if (require('fs').existsSync(frontendBuildPath)) {
  console.log(`Serving frontend static build from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
} else {
  // Basic root route when frontend build is not generated yet
  app.get('/', (req, res) => {
    res.send('ScripVault Backend API is running!');
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
