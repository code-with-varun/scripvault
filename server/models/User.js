// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Trim whitespace from email
    lowercase: true // Store emails in lowercase for consistency
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Added a basic minimum length for password
  },
  fullName: {
    type: String,
    trim: true // Trim whitespace from full name
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date // Store date of birth as a Date object
  },
  riskTolerance: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'], // Enforce specific values
    default: 'moderate' // Set a default value
  },
  preferredInvestments: {
    mutualFunds: { type: Boolean, default: false },
    stocks: { type: Boolean, default: false },
    fixedDeposits: { type: Boolean, default: false },
    etfs: { type: Boolean, default: false },
    nfos: { type: Boolean, default: false },
    nps: { type: Boolean, default: false },
  },
  twoFactorAuth: {
    type: Boolean,
    default: false
  },
  profilePic: {
    type: String,
    default: 'https://placehold.co/80x80/cccccc/white?text=Profile' // Default profile picture
  },
  // Fields for dashboard summaries, if you wish to store them directly on the user
  // Alternatively, these could be calculated dynamically from Portfolio/Investment data
  investments: { // This might represent a count or total invested, depending on your auth.js logic
    type: Number,
    default: 0
  },
  networth: { // This would be the total net worth
    type: Number,
    default: 0
  },
  // Add timestamps for creation and update dates
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
