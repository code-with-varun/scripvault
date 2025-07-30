// routes/explore.js
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const { authenticateToken } = require('./auth'); // Import the authentication middleware

// Get all available stocks/scrips for exploration
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all stocks from the database
    // You might want to add pagination, filtering, or sorting options here later
    const stocks = await Stock.find({}); // Find all documents in the Stock collection

    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks for exploration:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Removed the POST /add route as its functionality is better suited
// for administrative tasks or is already covered by watchlist/portfolio routes.
// If you need to add new global stock entries, consider a dedicated admin API.

module.exports = router;
