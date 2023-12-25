// routes/investment.js
const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const Portfolio = require('../models/Portfolio');

// Get details of a specific investment
router.get('/:investmentId', async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const investment = await Investment.findById(investmentId);
    res.json(investment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update details of a specific investment
router.put('/:investmentId', async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const updatedInvestment = await Investment.findByIdAndUpdate(investmentId, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updatedInvestment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a specific investment
router.delete('/:investmentId', async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    await Investment.findByIdAndDelete(investmentId);

    // Remove the investment from the user's portfolio
    const userId = req.user.id; // Adjust this based on your authentication setup
    await Portfolio.findOneAndUpdate(
      { user: userId },
      { $pull: { investments: investmentId } },
      { new: true }
    );

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
