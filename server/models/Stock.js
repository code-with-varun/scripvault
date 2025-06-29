// models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  // Add other fields as needed
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
