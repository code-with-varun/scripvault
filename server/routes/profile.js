// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/', async (req, res) => {
  try {
    // Assuming you have a user ID in the request object
    const userId = req.user.id; // Adjust this based on your authentication setup
    const user = await User.findById(userId, '-password'); // Exclude password from the response
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update user profile
router.put('/', async (req, res) => {
  try {
    // Assuming you have a user ID in the request object
    const userId = req.user.id; // Adjust this based on your authentication setup

    // Update the user profile fields
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
