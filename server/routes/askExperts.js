// routes/askExperts.js
const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const { authenticateToken } = require('./auth'); // Import the authentication middleware

// Submit a query to experts
router.post('/submit-query', authenticateToken, async (req, res) => {
  try {
    // Extract all relevant fields from the request body based on the updated Query model
    const {
      question, // Renamed from queryText to match frontend form.question
      investmentType, // Corresponds to 'category' in model
      goalType,
      tags, // Assuming tags might be sent from frontend, or derived
      status, // Defaulted to 'Pending' in model, but can be overridden if needed
      isAnswered, // Defaulted to 'false' in model
      expert, // Will be null on submission
      expertAvatar, // Will be null on submission
      response // Will be a pending message on submission
    } = req.body;

    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Create a new query document with all fields
    const newQuery = await Query.create({
      user: userId,
      text: question, // Map frontend 'question' to model 'text'
      category: investmentType, // Map frontend 'investmentType' to model 'category'
      goalType: goalType,
      tags: tags || [], // Ensure tags is an array, even if empty
      status: status || 'Pending', // Default to Pending if not provided
      isAnswered: isAnswered || false, // Default to false if not provided
      expert: expert || null,
      expertAvatar: expertAvatar || null,
      response: response || "Your query is being reviewed by our experts. You'll receive a detailed response within 24 hours. Thank you for your patience!",
      // 'date' and 'timestamps' are handled by the schema default/options
    });

    res.status(201).json(newQuery); // Respond with the created query
  } catch (error) {
    console.error("Error submitting query:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all previous queries for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Find all queries submitted by this user
    // You might want to add pagination or sorting here for large datasets
    const queries = await Query.find({ user: userId }).sort({ date: -1 }); // Sort by most recent first

    res.json(queries);
  } catch (error) {
    console.error("Error fetching previous queries:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
