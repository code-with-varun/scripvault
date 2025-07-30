// routes/portfolio.js
const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const Investment = require('../models/Investment'); // User model is not directly used here, but good to keep if needed
const { authenticateToken } = require('./auth'); // Import the authentication middleware

// Get user's portfolio
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Find the portfolio for the authenticated user
    const portfolio = await Portfolio.findOne({ user: userId }).populate({
      path: 'investments',
      // Select all fields that frontend needs for individual investment display
      select: 'name type symbol amount frequency investedValue marketValue logo purchaseDate',
    });

    // If no portfolio exists for the user, return an empty portfolio or create one
    if (!portfolio) {
      // Option 1: Return an empty object/array if no portfolio found
      return res.json({ user: userId, investments: [] });
      // Option 2: Automatically create a portfolio for the user if it doesn't exist
      // const newPortfolio = await Portfolio.create({ user: userId, investments: [] });
      // return res.json(newPortfolio);
    }

    res.json(portfolio);
  } catch (error) {
    console.error("Error fetching user portfolio:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add investment to user's portfolio
router.post('/invest', authenticateToken, async (req, res) => {
  try {
    // Extract investment details from request body
    const { name, type, symbol, amount, frequency, investedValue, marketValue, logo, purchaseDate } = req.body;
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Create a new investment document
    const investment = await Investment.create({
      user: userId, // CRITICAL: Link the investment to the user
      name,
      type,
      symbol,
      amount,
      frequency,
      investedValue,
      marketValue,
      logo,
      purchaseDate: purchaseDate || Date.now() // Use provided date or current date
    });

    // Add the new investment's ID to the user's portfolio
    // upsert: true will create the portfolio document if it doesn't exist for the user
    const portfolio = await Portfolio.findOneAndUpdate(
      { user: userId },
      { $addToSet: { investments: investment._id } }, // Add investment ID to the array
      { upsert: true, new: true } // Create if not exists, return the updated document
    ).populate({
      path: 'investments',
      select: 'name type symbol amount frequency investedValue marketValue logo purchaseDate', // Populate relevant fields
    });

    res.status(201).json(portfolio); // Return the updated portfolio with the new investment
  } catch (error) {
    console.error("Error adding investment to portfolio:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
