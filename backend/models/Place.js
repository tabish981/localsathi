const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
  name: String,
  address: String,
  category: String, // e.g., 'Restaurant', 'Park'
  lat: Number,
  lng: Number,
  description: String, // Added for UI details
  
  // 💰 BUDGET FIELD
  // Values: 'comfort' (cheap/public) or 'premium' (expensive/luxury)
  priceType: { 
    type: String, 
    enum: ['comfort', 'premium'], 
    default: 'comfort' 
  },

  // 🔑 CACHE VERSION
  version: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Place", PlaceSchema);