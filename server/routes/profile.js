// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('./auth');

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(
      userId,
      'fullName email phone dateOfBirth address riskTolerance preferredInvestments twoFactorAuth profilePic investments networth createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Investment = require('../models/Investment');
    const userInvestments = await Investment.find({ user: userId });
    const totalInvestedSum = userInvestments.reduce((sum, item) => sum + (item.investedValue || 0), 0);
    const totalMarketValueSum = userInvestments.reduce((sum, item) => sum + (item.marketValue || 0), 0);

    const userObj = user.toObject();
    userObj.investments = totalInvestedSum;
    userObj.networth = totalMarketValueSum;

    // Format dateOfBirth to YYYY-MM-DD for HTML input[type="date"]
    if (userObj.dateOfBirth) {
      userObj.dateOfBirth = new Date(userObj.dateOfBirth).toISOString().split('T')[0];
    } else {
      userObj.dateOfBirth = '';
    }

    // Dynamic profile summary details
    userObj.memberSince = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'July 2026';
    userObj.activeGoals = '3 Goals Active (Wealth, Retirement, Emergency)';
    userObj.financialAdvisor = {
      name: 'Rajesh Sharma, CFP',
      title: 'Senior Wealth Specialist 👨‍💼',
      phone: '+91 98765 43210',
      email: 'advisor@scripvault.com',
      status: 'Assigned 🛡️'
    };

    res.json(userObj);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      fullName,
      phone,
      dateOfBirth,
      address,
      riskTolerance,
      preferredInvestments,
      currentPassword,
      newPassword,
      twoFactorAuth,
    } = req.body;

    const updateFields = {
      fullName,
      phone,
      address,
      riskTolerance,
      preferredInvestments,
      twoFactorAuth,
    };

    if (dateOfBirth) {
      updateFields.dateOfBirth = new Date(dateOfBirth);
    }

    if (newPassword) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
      select: 'fullName email phone dateOfBirth address riskTolerance preferredInvestments twoFactorAuth profilePic investments networth createdAt'
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User profile not found after update' });
    }

    const userObj = updatedUser.toObject();
    if (userObj.dateOfBirth) {
      userObj.dateOfBirth = new Date(userObj.dateOfBirth).toISOString().split('T')[0];
    } else {
      userObj.dateOfBirth = '';
    }

    userObj.memberSince = updatedUser.createdAt
      ? new Date(updatedUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'July 2026';
    userObj.activeGoals = '3 Goals Active (Wealth, Retirement, Emergency)';
    userObj.financialAdvisor = {
      name: 'Rajesh Sharma, CFP',
      title: 'Senior Wealth Specialist 👨‍💼',
      phone: '+91 98765 43210',
      email: 'advisor@scripvault.com',
      status: 'Assigned 🛡️'
    };

    res.json(userObj);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
