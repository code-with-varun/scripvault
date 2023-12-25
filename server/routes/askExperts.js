// routes/askExperts.js
const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const User = require('../models/User');

// Submit a query to experts
router.post('/submit-query', async (req, res) => {
  try {
    const { queryText } = req.body;
    const userId = req.user.id; // Adjust this based on your authentication setup

    // Create a new query
    const query = await Query.create({
      text: queryText,
      user: userId,
    });

    res.json(query);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
