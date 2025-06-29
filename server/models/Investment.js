// models/Investment.js
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
  symbol: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['one-time', 'sip'], required: true },
  // Add other fields as needed
});

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
