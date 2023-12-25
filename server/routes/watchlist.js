// routes/watchlist.js
const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const User = require('../models/User');
const Stock = require('../models/Stock');

// Get user's watchlist
router.get('/', async (req, res) => {
  try {
    // Assuming you have a user ID in the request object
    const userId = req.user.id; // Adjust this based on your authentication setup
    const watchlist = await Watchlist.findOne({ user: userId }).populate('stocks', 'symbol');
    res.json(watchlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add stock to user's watchlist
router.post('/add', async (req, res) => {
  try {
    const { symbol } = req.body;
    const userId = req.user.id; // Adjust this based on your authentication setup

    // Check if the stock already exists in the Stock model
    let stock = await Stock.findOne({ symbol });
    if (!stock) {
      stock = await Stock.create({ symbol });
    }

    // Add the stock to the user's watchlist
    const watchlist = await Watchlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { stocks: stock._id } },
      { upsert: true, new: true }
    ).populate('stocks', 'symbol');

    res.json(watchlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
