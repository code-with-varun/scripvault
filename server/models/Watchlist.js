// models/Watchlist.js
const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' }],
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
