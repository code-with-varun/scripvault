// models/Watchlist.js
const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model
    required: true,
    unique: true // Ensures a user can only have one watchlist document
  },
  stocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock' // References the 'Stock' model
  }],
}, { timestamps: true }); // Add timestamps for creation and update dates

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
