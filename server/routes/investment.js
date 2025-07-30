// routes/investment.js
const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const Portfolio = require('../models/Portfolio');
const { authenticateToken } = require('./auth'); // Import the authentication middleware

// Get details of a specific investment
router.get('/:investmentId', authenticateToken, async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const userId = req.user.userId; // Get userId from the authenticated token payload

    const investment = await Investment.findById(investmentId);

    // Check if investment exists
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // CRITICAL SECURITY CHECK: Ensure the authenticated user owns this investment
    if (investment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this investment' });
    }

    res.json(investment);
  } catch (error) {
    console.error("Error fetching investment:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update details of a specific investment
router.put('/:investmentId', authenticateToken, async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // First, find the investment to check ownership
    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // CRITICAL SECURITY CHECK: Ensure the authenticated user owns this investment
    if (investment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this investment' });
    }

    // If ownership is confirmed, proceed with the update
    const updatedInvestment = await Investment.findByIdAndUpdate(investmentId, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    res.json(updatedInvestment);
  } catch (error) {
    console.error("Error updating investment:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a specific investment
router.delete('/:investmentId', authenticateToken, async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // First, find the investment to check ownership
    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // CRITICAL SECURITY CHECK: Ensure the authenticated user owns this investment
    if (investment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this investment' });
    }

    // If ownership is confirmed, proceed with deletion
    await Investment.findByIdAndDelete(investmentId);

    // Remove the investment from the user's portfolio
    // Ensure the portfolio update also checks for user ownership if not implicitly handled by the route structure
    await Portfolio.findOneAndUpdate(
      { user: userId }, // Find the portfolio belonging to the user
      { $pull: { investments: investmentId } }, // Remove the investment ID from the array
      { new: true }
    );

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error("Error deleting investment:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
