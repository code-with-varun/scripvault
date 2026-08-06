// routes/transaction.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('./auth');

// Middleware to protect all routes in this file
router.use(authenticateToken);

// GET /api/transactions - Fetch user's transaction history sorted by date descending
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transaction audit logs:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
