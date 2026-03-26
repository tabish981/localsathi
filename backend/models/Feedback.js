const mongoose = require("mongoose");

module.exports = mongoose.model("Feedback", new mongoose.Schema({
  userId: String,
  userName: String,
  rating: Number,
  problem: String,
  suggestion: String,
  date: { type: Date, default: Date.now }
}));
