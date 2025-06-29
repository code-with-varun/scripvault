// models/Query.js
const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  // Add other fields as needed
});

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
