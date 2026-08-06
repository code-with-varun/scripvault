// routes/explore.js
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const { authenticateToken } = require('./auth');
const { subscribeClient } = require('../services/marketEngine');

// Get all available stocks/scrips for exploration
router.get('/', authenticateToken, async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks for exploration:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Real-time SSE endpoint powered by Central Market Engine
router.get('/stream', (req, res) => {
  subscribeClient(req, res);
});

module.exports = router;
