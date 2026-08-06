// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPassword = password ? String(password).trim() : '';
    const cleanFullName = fullName ? String(fullName).trim() : '';
    const cleanPhone = phone ? String(phone).trim() : '';

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // Create a new user
    const newUser = new User({
      email: cleanEmail,
      password: hashedPassword,
      fullName: cleanFullName,
      phone: cleanPhone,
      address: '',
      dateOfBirth: null,
      riskTolerance: 'moderate',
      preferredInvestments: {
        mutualFunds: false,
        stocks: false,
        fixedDeposits: false,
        etfs: false,
        nfos: false,
        nps: false,
      },
      twoFactorAuth: false,
      profilePic: 'https://placehold.co/80x80/cccccc/white?text=Profile',
      investments: 0,
      networth: 0
    });
    await newUser.save();

    console.log(`User registered successfully: ${cleanEmail}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPassword = password ? String(password).trim() : '';

    console.log(`Login attempt for email: "${cleanEmail}"`);

    // Check if the user exists
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      console.log(`Login failed: No user found with email "${cleanEmail}"`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for email "${cleanEmail}"`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Login successful for user: ${cleanEmail}`);

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Investment = require('../models/Investment');
    const userInvestments = await Investment.find({ user: req.user.userId });

    const { getLivePrice, getLiveIndices } = require('../services/marketEngine');

    let stocksList = userInvestments
      .filter(item => (item.type === 'Stock' || item.type === 'ETF') && (item.quantity > 0))
      .map(item => {
        const investedVal = item.investedValue || 0;
        const sym = item.symbol || item.name.substring(0, 5).toUpperCase();
        const liveUnitPrice = getLivePrice(item.stockId) || getLivePrice(sym) || getLivePrice(item._id) || (item.quantity > 0 ? (item.marketValue / item.quantity) : 0);
        const currentVal = item.quantity > 0 ? (item.quantity * liveUnitPrice) : (item.marketValue || 0);
        const gainPct = investedVal > 0 ? (((currentVal - investedVal) / investedVal) * 100) : 0;
        return {
          id: item._id,
          name: item.name,
          symbol: sym,
          shares: item.quantity || 1,
          currentValue: currentVal,
          investedValue: investedVal,
          gainPercent: parseFloat(gainPct.toFixed(2)),
          logo: item.logo || `https://placehold.co/40x40/FF7F27/white?text=${sym ? sym.substring(0, 4) : 'EQ'}`
        };
      });

    let mfList = userInvestments
      .filter(item => (item.type === 'Mutual Fund' || item.type === 'NFO' || item.type === 'NPS' || item.type === 'Fixed Deposit') && (item.quantity > 0))
      .map(item => {
        const investedVal = item.investedValue || 0;
        const liveUnitPrice = getLivePrice(item.stockId) || getLivePrice(item.symbol) || getLivePrice(item._id) || (item.quantity > 0 ? (item.marketValue / item.quantity) : 0);
        const currentVal = item.quantity > 0 ? (item.quantity * liveUnitPrice) : (item.marketValue || 0);
        const gainPct = investedVal > 0 ? (((currentVal - investedVal) / investedVal) * 100) : 0;
        return {
          id: item._id,
          name: item.name,
          symbol: item.symbol || '',
          shares: item.quantity || 1,
          sip: item.frequency === 'sip' ? item.amount : 0,
          currentValue: currentVal,
          investedValue: investedVal,
          gainPercent: parseFloat(gainPct.toFixed(2)),
          logo: item.logo || `https://placehold.co/40x40/FF7F27/white?text=MF`
        };
      });

    const stocksVal = stocksList.reduce((acc, item) => acc + item.currentValue, 0);
    const mfVal = mfList.reduce((acc, item) => acc + item.currentValue, 0);
    const stocksInv = stocksList.reduce((acc, item) => acc + item.investedValue, 0);
    const mfInv = mfList.reduce((acc, item) => acc + item.investedValue, 0);

    const totalInvested = stocksInv + mfInv;
    const totalMarketValue = stocksVal + mfVal;
    const totalGainLoss = totalMarketValue - totalInvested;
    const gainLossPercentage = totalInvested > 0 ? parseFloat(((totalGainLoss / totalInvested) * 100).toFixed(2)) : 0;

    let displayUserName = 'User';
    if (user.fullName && user.fullName.trim()) {
      displayUserName = user.fullName;
    } else if (user.email) {
      const prefix = user.email.split('@')[0];
      displayUserName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const liveIdx = getLiveIndices();

    res.json({
      userName: displayUserName,
      netWorth: totalMarketValue,
      totalInvested,
      totalMarketValue,
      totalGains: totalGainLoss,
      totalGainLoss,
      overallReturnPercent: gainLossPercentage,
      stocks: stocksList,
      mutualFunds: mfList,
      marketSnapshot: {
        sensex: { value: liveIdx.sensex.currentPrice, change: liveIdx.sensex.dayChange },
        nifty: { value: liveIdx.nifty.currentPrice, change: liveIdx.nifty.dayChange }
      },
      holdingsSummary: [
        { type: 'Mutual Funds', value: mfVal },
        { type: 'Stocks & ETFs', value: stocksVal }
      ]
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  let token = authHeader;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'powerus', (err, user) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Export both the router and the authenticateToken middleware
module.exports = { router, authenticateToken };
