const router = require("express").Router();
const User = require("../models/User");
const Trip = require("../models/Trip");
const Feedback = require("../models/Feedback");
const Review = require("../models/Review");
const auth = require("../middleware/auth");

// @route   PUT /api/user/:id
// @desc    Update user profile data
router.put("/:id", auth, async (req, res) => {
  try {
    // Safety check: Ensure the authenticated user matches the ID in the URL
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied: Unauthorized update attempt" });
    }

    // Extract fields, including 'username' which matches your Login UI
    const { name, email, username, phone, dob, avatar, gender, budget, bio } = req.body;

    // Check if new username/email is already taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
        _id: { $ne: req.params.id } // Exclude the current user from the search
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username or Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name, email, username, phone, dob, avatar, gender, budget, bio }
      },
      { new: true, runValidators: true } // Return the modified document
    ).select("-password"); // Never return the password

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Update failed. Please check server logs." });
  }
});

// @route   GET /api/user/:id
// @desc    Get complete user profile data (including badges/favs)
router.get("/:id", auth, async (req, res) => {
  try {
    // Safety check: ensure only the account owner can fetch full profile details
    if (req.user.id !== req.params.id) {
       return res.status(403).json({ message: "Access denied: Unauthorized fetch attempt" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile Fetch Error:", err.message);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// @route   POST /api/user/:id/favorite
// @desc    Toggle a place as favorite
router.post("/:id/favorite", auth, async (req, res) => {
  try {
    const { placeKey } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.favorites.indexOf(placeKey);
    if (index === -1) {
      user.favorites.push(placeKey);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Favorite toggle failed" });
  }
});

// @route   POST /api/user/:id/badge
// @desc    Unlock a new badge
router.post("/:id/badge", auth, async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent duplicate badges
    if (user.badges.some(b => b.name === name)) {
      return res.status(400).json({ message: "Badge already unlocked" });
    }

    user.badges.push({ name, icon, description, date: new Date() });
    await user.save();
    res.json(user.badges);
  } catch (err) {
    res.status(500).json({ message: "Badge unlock failed" });
  }
});

// @route   DELETE /api/user/:id
// @desc    Delete user account and data
router.delete("/:id", auth, async (req, res) => {
  try {
    // Safety check: Ensure the authenticated user matches the ID in the URL
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied: Unauthorized deletion attempt" });
    }

    // 1. Fetch user to get name/username for secondary lookups (if needed)
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Delete associated data (Cascading Deletion)
    await Trip.deleteMany({ userId: req.params.id });
    await Feedback.deleteMany({ userId: req.params.id });
    
    // If your reviews use username
    if (targetUser.username) {
        await Review.deleteMany({ userName: targetUser.username });
    }

    // 3. Delete the user itself
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Account and all associated data deleted successfully." });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Deletion failed. Please check server logs." });
  }
});

module.exports = router;