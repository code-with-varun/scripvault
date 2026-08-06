// models/Investment.js
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  // Reference to the Portfolio this investment belongs to
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: false // Making portfolio optional for initial creation, can be added later
  },
  // Reference to the User who owns this investment (for easier direct lookup/security checks)
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
  quantity: {
    type: Number,
    default: 1
  },
  frequency: {
    type: String,
    enum: ['one-time', 'sip'], // <<< CHANGED to lowercase to match frontend
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
  realizedGainLoss: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now // Automatically set purchase date
  }
}, { timestamps: true }); // Add timestamps for creation and update dates

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
