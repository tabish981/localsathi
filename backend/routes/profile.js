const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* GET PROFILE */
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

/* UPDATE PROFILE */
router.put("/:id", async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).select("-password");

  res.json(updated);
});

module.exports = router;
