// routes/watchlist.js
const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');
const { authenticateToken } = require('./auth'); // Import the authentication middleware

// Get user's watchlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from the authenticated token payload

    const watchlist = await Watchlist.findOne({ user: userId }).populate({
      path: 'stocks',
      // Select all fields that frontend needs for stock/mutual fund display
      select: 'name type subType risk currentPrice dayChange oneYearReturn threeYearReturn fiveYearReturn logo trendData',
    });

    // If no watchlist exists for the user, return an empty array
    if (!watchlist) {
      return res.json({ user: userId, stocks: [] });
    }

    res.json(watchlist);
  } catch (error) {
    console.error("Error fetching user watchlist:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add stock/mutual fund to user's watchlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    // Extract all relevant fields from the request body to create/find a Stock
    const {
      symbol,
      name,
      type,
      subType,
      risk,
      marketPrice, // This is currentPrice in the Stock model
      dayChange,
      oneYearReturn,
      threeYearReturn,
      fiveYearReturn,
      logo,
      trendData
    } = req.body;

    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Find the stock by symbol or create it if it doesn't exist in the master Stock collection
    let stock = await Stock.findOne({ symbol });

    if (!stock) {
      // If stock doesn't exist, create a new one with all provided details
      stock = await Stock.create({
        symbol,
        name,
        type,
        subType,
        risk,
        currentPrice: marketPrice, // Map frontend marketPrice to model currentPrice
        dayChange,
        oneYearReturn,
        threeYearReturn,
        fiveYearReturn,
        logo,
        trendData
      });
    }

    // Add the stock's ID to the user's watchlist
    // upsert: true will create the watchlist document if it doesn't exist for the user
    const watchlist = await Watchlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { stocks: stock._id } }, // Add stock ID to the array
      { upsert: true, new: true } // Create if not exists, return the updated document
    ).populate({
      path: 'stocks',
      select: 'name type subType risk currentPrice dayChange oneYearReturn threeYearReturn fiveYearReturn logo trendData', // Populate relevant fields
    });

    res.status(201).json(watchlist); // Return the updated watchlist with the new stock
  } catch (error) {
    console.error("Error adding stock to watchlist:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
