// routes/investment.js
const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('./auth');

// Middleware to protect all routes in this file
router.use(authenticateToken);

// POST /api/investments - Add a new investment (BUY)
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, type, symbol, amount, quantity, frequency, investedValue, marketValue, logo, purchaseDate } = req.body;

    const totalInv = Number(investedValue) || Number(marketValue) || 0;
    const perUnitPrice = Number(amount) || 1;

    // For Mutual Funds or stocks: if quantity is not explicitly passed, calculate units = investedValue / NAV(amount)
    let finalQuantity = Number(quantity);
    if (isNaN(finalQuantity) || finalQuantity <= 0) {
      finalQuantity = (totalInv > 0 && perUnitPrice > 0) ? parseFloat((totalInv / perUnitPrice).toFixed(4)) : 1;
    }

    // Create the new investment
    const newInvestment = new Investment({
      user: userId,
      name,
      type,
      symbol: symbol || name.substring(0, 5).toUpperCase(),
      amount: perUnitPrice,
      quantity: finalQuantity,
      frequency: frequency || 'one-time',
      investedValue: totalInv,
      marketValue: Number(marketValue) || totalInv,
      logo,
      purchaseDate: purchaseDate || new Date(),
    });

    const savedInvestment = await newInvestment.save();

    // Create an audit log transaction for this BUY
    await Transaction.create({
      user: userId,
      investment: savedInvestment._id,
      assetName: name,
      symbol: symbol || name.substring(0, 5).toUpperCase(),
      type: type || 'Stock',
      transactionType: 'BUY',
      quantity: finalQuantity,
      pricePerUnit: perUnitPrice,
      totalAmount: totalInv,
      date: purchaseDate || new Date()
    });

    // Find the user's portfolio or create one if it doesn't exist
    let userPortfolio = await Portfolio.findOne({ user: userId });

    if (!userPortfolio) {
      userPortfolio = new Portfolio({
        user: userId,
        investments: []
      });
    }

    userPortfolio.investments.push(savedInvestment._id);
    await userPortfolio.save();

    res.status(201).json(savedInvestment);
  } catch (error) {
    console.error('Error adding investment:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// GET /api/investments - Get all active investments for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const investments = await Investment.find({ user: userId, quantity: { $gt: 0 } }).sort({ purchaseDate: -1 });
    res.json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get details of a specific investment by ID
router.get('/:investmentId', async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const userId = req.user.userId;

    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this investment' });
    }

    res.json(investment);
  } catch (error) {
    console.error("Error fetching specific investment:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update details of a specific investment by ID
router.put('/:investmentId', async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const userId = req.user.userId;

    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this investment' });
    }

    const updatedInvestment = await Investment.findByIdAndUpdate(investmentId, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedInvestment);
  } catch (error) {
    console.error("Error updating investment:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete a specific investment by ID
router.delete('/:investmentId', async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const userId = req.user.userId;

    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this investment' });
    }

    await Investment.findByIdAndDelete(investmentId);

    await Portfolio.findOneAndUpdate(
      { user: userId },
      { $pull: { investments: investmentId } },
      { new: true }
    );

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error("Error deleting investment:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// POST /api/investments/:investmentId/sell - Sell units of an investment (Stocks, ETFs, Mutual Funds, etc.)
router.post('/:investmentId/sell', async (req, res) => {
  try {
    const investmentId = req.params.investmentId;
    const userId = req.user.userId;
    const { unitsToSell, sellPrice } = req.body;

    const numUnits = Number(unitsToSell);
    if (isNaN(numUnits) || numUnits <= 0) {
      return res.status(400).json({ message: 'Invalid units to sell. Must be greater than 0.' });
    }

    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this investment' });
    }

    if (numUnits > investment.quantity) {
      return res.status(400).json({ message: `Cannot sell ${numUnits} units. You only own ${investment.quantity} units.` });
    }

    // Determine average cost per unit & actual selling price per unit (NAV for Mutual Funds)
    const avgCostPerUnit = investment.quantity > 0 ? (investment.investedValue / investment.quantity) : 0;
    const actualSellPrice = (sellPrice !== undefined && sellPrice !== null && !isNaN(Number(sellPrice)))
      ? Number(sellPrice)
      : (investment.quantity > 0 ? (investment.marketValue / investment.quantity) : avgCostPerUnit);

    const costBasisReduced = numUnits * avgCostPerUnit;
    const totalProceeds = numUnits * actualSellPrice;
    const transactionPnL = totalProceeds - costBasisReduced;

    const newQuantity = parseFloat((investment.quantity - numUnits).toFixed(4));
    const newInvestedValue = Math.max(0, investment.investedValue - costBasisReduced);

    // Create Audit Log Transaction for SELL
    await Transaction.create({
      user: userId,
      investment: investment._id,
      assetName: investment.name,
      symbol: investment.symbol || investment.name.substring(0, 5).toUpperCase(),
      type: investment.type,
      transactionType: 'SELL',
      quantity: numUnits,
      pricePerUnit: actualSellPrice,
      totalAmount: totalProceeds,
      realizedPnL: transactionPnL,
      date: new Date()
    });

    if (newQuantity <= 0) {
      // Entire position sold out: delete from DB and remove from Portfolio
      await Investment.findByIdAndDelete(investmentId);
      await Portfolio.findOneAndUpdate(
        { user: userId },
        { $pull: { investments: investmentId } },
        { new: true }
      );

      return res.json({
        message: `Sold all ${numUnits} units of ${investment.name}. Realized P&L: ${transactionPnL >= 0 ? '+' : ''}₹${transactionPnL.toFixed(2)}`,
        soldOut: true,
        transactionPnL,
        totalProceeds,
        costBasisReduced,
        investmentId
      });
    } else {
      // Partial position sold: update investment record
      const currentPricePerUnit = investment.quantity > 0 ? (investment.marketValue / investment.quantity) : actualSellPrice;
      const newMarketValue = newQuantity * currentPricePerUnit;
      const accumulatedPnL = (investment.realizedGainLoss || 0) + transactionPnL;

      investment.quantity = newQuantity;
      investment.investedValue = newInvestedValue;
      investment.marketValue = newMarketValue;
      investment.realizedGainLoss = accumulatedPnL;

      const updatedInvestment = await investment.save();

      return res.json({
        message: `Successfully sold ${numUnits} units of ${investment.name}. Realized P&L: ${transactionPnL >= 0 ? '+' : ''}₹${transactionPnL.toFixed(2)}`,
        soldOut: false,
        transactionPnL,
        totalProceeds,
        costBasisReduced,
        updatedInvestment
      });
    }
  } catch (error) {
    console.error("Error selling investment:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
