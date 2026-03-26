const router = require("express").Router();
const Feedback = require("../models/Feedback");

// Submit Feedback
router.post("/", async (req, res) => {
  try {
    const { userId, userName, rating, problem, suggestion } = req.body;
    await Feedback.create({
      userId,
      userName: userName || "Anonymous User",
      rating,
      problem,
      suggestion
    });
    res.json({ msg: "Submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Get Feedback for Slider
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 }).limit(10);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

module.exports = router;
