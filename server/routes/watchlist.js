// routes/watchlist.js
const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock'); // Assuming you have a Stock model
const { authenticateToken } = require('./auth'); // Import the authentication middleware

// Get user's watchlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from the authenticated token payload

    const watchlist = await Watchlist.findOne({ user: userId }).populate({
      path: 'stocks',
      // Select all fields that frontend needs for stock/mutual fund display
      // Ensure these fields match what's actually stored in your Stock model
      select: 'name type subType risk currentPrice dayChange oneYearReturn threeYearReturn fiveYearReturn logo trendData',
    });

    // If no watchlist exists for the user, return an empty array
    if (!watchlist) {
      return res.json([]); // Return an empty array directly, not an object with stocks: []
    }

    res.json(watchlist.stocks); // Return just the populated stocks array
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
      currentPrice, // Changed from marketPrice to currentPrice to match Stock model
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
        currentPrice: currentPrice, // Use currentPrice directly
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

    // Return the newly added stock object, not the entire watchlist document
    // This makes it easier for the frontend to update its state.
    res.status(201).json(stock); // Return the newly created/found stock object
  } catch (error) {
    console.error("Error adding stock to watchlist:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// DELETE /api/watchlist/:id - Remove an item from user's watchlist
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const stockIdToRemove = req.params.id; // This is the _id of the Stock to remove
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Find the user's watchlist and pull the stock ID from the 'stocks' array
    const watchlist = await Watchlist.findOneAndUpdate(
      { user: userId },
      { $pull: { stocks: stockIdToRemove } }, // Remove the stock ID from the array
      { new: true } // Return the updated watchlist document
    );

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found for this user.' });
    }

    res.json({ message: 'Item removed from watchlist successfully' });
  } catch (error) {
    console.error("Error removing item from watchlist:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
