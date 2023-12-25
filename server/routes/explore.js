// routes/explore.js
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// Search and add stocks/scrips
router.post('/add', async (req, res) => {
  try {
    const { symbol } = req.body;

    // Check if the stock already exists in the Stock model
    let stock = await Stock.findOne({ symbol });
    if (!stock) {
      stock = await Stock.create({ symbol });
    }

    res.json(stock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
