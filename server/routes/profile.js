// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { authenticateToken } = require('./auth'); // Import the authentication middleware

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Fetch the user profile, excluding the password, but including all new fields
    const user = await User.findById(
      userId,
      'fullName email phone dateOfBirth address riskTolerance preferredInvestments twoFactorAuth profilePic investments networth'
    );

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from the authenticated token payload

    // Extract only the fields that are allowed to be updated from the request body
    const {
      fullName,
      phone,
      dateOfBirth,
      address,
      riskTolerance,
      preferredInvestments,
      currentPassword, // For password change validation
      newPassword,
      twoFactorAuth,
    } = req.body;

    const updateFields = {
      fullName,
      phone,
      dateOfBirth,
      address,
      riskTolerance,
      preferredInvestments, // Mongoose handles nested objects for update
      twoFactorAuth,
    };

    // Handle password change if newPassword is provided
    if (newPassword) {
      // First, verify the current password (security measure)
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      // Hash the new password before saving
      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    // Update the user profile fields
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
      select: 'fullName email phone dateOfBirth address riskTolerance preferredInvestments twoFactorAuth profilePic investments networth' // Select fields to return
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User profile not found after update' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
