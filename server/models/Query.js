// models/Query.js
const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    // You might want to define an enum for categories if they are fixed
    // enum: ['Long-Term Investment', 'Short-Term Goals', 'Tax Saving Options', 'Retirement Planning', 'Equity', 'Debt', 'General'],
    default: 'General',
    trim: true
  },
  goalType: {
    type: String,
    // You might want to define an enum for goal types if they are fixed
    // enum: ['Retirement', 'Child Education', 'Home Purchase', 'Wealth Creation', 'Emergency Fund', 'General'],
    default: 'General',
    trim: true
  },
  date: {
    type: Date,
    default: Date.now // Automatically set the creation date
  },
  status: {
    type: String,
    enum: ['Pending', 'Answered'], // Enforce specific status values
    default: 'Pending'
  },
  isAnswered: {
    type: Boolean,
    default: false // Flag to easily check if a query has been answered
  },
  tags: [{
    type: String, // Array of strings for tags
    trim: true
  }],
  expert: {
    type: String, // Name of the expert who answered the query
    trim: true
  },
  expertAvatar: {
    type: String, // URL for the expert's avatar
    trim: true
  },
  response: {
    type: String, // The detailed response from the expert
    trim: true
  }
}, { timestamps: true }); // Add timestamps for creation and update dates

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
