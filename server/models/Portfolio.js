// models/Portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model
    required: true,
    unique: true // Ensures a user can only have one portfolio document
  },
  investments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment' // References the 'Investment' model
  }],
}, { timestamps: true }); // Add timestamps for creation and update dates

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
