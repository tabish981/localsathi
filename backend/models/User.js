const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Added username to match your Login UI
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: ""
    },

    dob: {
      type: String,
      default: ""
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other"
    },

    avatar: {
      type: String, // image URL or base64
      default: ""
    },

    // 🔥 Expense Estimator Budget
    budget: {
      type: String,
      enum: ["comfort", "premium", null], // Allow null for new users
      default: null
    },
    
    bio: {
      type: String,
      default: "",
      maxLength: 200
    },
    
    // ⭐ Favorites (list of place keys from City Guide)
    favorites: {
      type: [String],
      default: []
    },

    // 🏆 Badges (unlocked achievements)
    badges: [{
      name: String,
      icon: String,
      date: { type: Date, default: Date.now },
      description: String
    }],

    // 🔒 Password Reset Fields
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  {
    timestamps: true,
    collection: "users"
  }
);


module.exports = mongoose.model("User", userSchema);