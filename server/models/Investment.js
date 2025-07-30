// models/Investment.js
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  // Reference to the Portfolio this investment belongs to
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  // Reference to the User who owns this investment (for easier direct lookup/security checks)
  // This is redundant if you always access via Portfolio, but can simplify some queries.
  // Consider if you need this for direct ownership checks on individual investment routes.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Crucial for ownership checks on investment routes
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Mutual Fund', 'Stock', 'ETF', 'NFO', 'NPS', 'Fixed Deposit', 'Other'], // Expanded types
    required: true
  },
  symbol: {
    type: String, // Optional, if 'name' is sufficient or if not all investments have a symbol
    trim: true,
    uppercase: true
  },
  amount: { // This could be the SIP amount (for SIPs) or the per-unit purchase price (for one-time)
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['One-Time', 'SIP'], // Changed to match frontend casing
    required: true
  },
  investedValue: { // Total capital invested in this specific holding
    type: Number,
    required: true,
    min: 0
  },
  marketValue: { // Current market value of this specific holding
    type: Number,
    required: true,
    min: 0
  },
  logo: {
    type: String, // URL for the investment's logo
    trim: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now // Automatically set purchase date
  }
}, { timestamps: true }); // Add timestamps for creation and update dates

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
