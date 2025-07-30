// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    // Ensure to include all fields defined in the User model,
    // even if they are empty or default values.
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName: '', // Default or from request if provided
      phone: '',
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

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Added expiry

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Fetch the user's investments from the database
    const user = await User.findById(req.user.userId); // Use req.user.userId from token payload
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate net worth (for demonstration, you can replace this with your actual logic)
    // This should ideally pull from the Portfolio model's investments
    const netWorth = user.networth; // Using the networth field from the User model
    const totalInvested = user.investments; // Using the investments field from the User model

    res.json({ netWorth, totalInvested }); // Return relevant dashboard data
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err); // Log the error for debugging
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    req.user = user; // user object from JWT payload (contains userId)
    next();
  });
}

// Export both the router and the authenticateToken middleware
module.exports = { router, authenticateToken };
