// models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Trim whitespace
    uppercase: true // Store symbols in uppercase for consistency (e.g., 'RELIANCE')
  },
  name: {
    type: String,
    required: true, // Name is crucial for display
    trim: true
  },
  type: {
    type: String,
    enum: ['Stock', 'Mutual Fund', 'ETF', 'NFO'], // Categorize assets
    required: true // Ensure a type is always provided
  },
  subType: {
    type: String, // e.g., 'Large Cap Fund', 'NSE: RELIANCE'
    trim: true
  },
  risk: {
    type: String,
    enum: ['Low Risk', 'Medium Risk', 'High Risk'], // Define risk levels
    default: 'Medium Risk'
  },
  currentPrice: { // For stocks/ETFs, or current NAV for mutual funds
    type: Number,
    min: 0 // Price cannot be negative
  },
  dayChange: { // Daily price change percentage
    type: Number
  },
  oneYearReturn: { // 1-year CAGR/Return
    type: Number
  },
  threeYearReturn: { // 3-year CAGR/Return
    type: Number
  },
  fiveYearReturn: { // 5-year CAGR/Return
    type: Number
  },
  marketValue: { // If this model is also used for actual holdings, though Investment model is better for that
    type: Number
  },
  investedValue: { // If this model is also used for actual holdings
    type: Number
  },
  logo: {
    type: String, // URL for the asset's logo
    trim: true
  },
  trendData: [{
    type: Number // Array of numbers for sparkline charts
  }],
}, { timestamps: true }); // Add timestamps for creation and update dates

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
