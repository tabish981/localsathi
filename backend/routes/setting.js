const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/budget", async (req, res) => {
  const { userId, budget } = req.body;

  await User.findByIdAndUpdate(userId, { budget });
  res.json({ success: true });
});

router.get("/budget/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ budget: user?.budget || null });
});

module.exports = router;
