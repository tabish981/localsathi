const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  userId: String,
  from: String,
  to: String,
  mode: String,
  distance: String,
  cost: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trip", TripSchema);
