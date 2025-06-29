// routes/portfolio.js
const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Investment = require('../models/Investment');

// Get user's portfolio
router.get('/', async (req, res) => {
  try {
    // Assuming you have a user ID in the request object
    const userId = req.user.id; // Adjust this based on your authentication setup
    const portfolio = await Portfolio.findOne({ user: userId }).populate({
      path: 'investments',
      select: 'symbol amount frequency',
    });
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add investment to user's portfolio
router.post('/invest', async (req, res) => {
  try {
    const { symbol, amount, frequency } = req.body;
    const userId = req.user.id; // Adjust this based on your authentication setup

    // Create a new investment
    const investment = await Investment.create({
      symbol,
      amount,
      frequency,
    });

    // Add the investment to the user's portfolio
    const portfolio = await Portfolio.findOneAndUpdate(
      { user: userId },
      { $addToSet: { investments: investment._id } },
      { upsert: true, new: true }
    ).populate({
      path: 'investments',
      select: 'symbol amount frequency',
    });

    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
