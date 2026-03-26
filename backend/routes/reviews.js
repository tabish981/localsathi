const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// Get reviews for a specific place by placeId
router.get("/:placeId", async (req, res) => {
  try {
    const reviews = await Review.find({ placeId: req.params.placeId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Add a new review
router.post("/", async (req, res) => {
  const { placeId, placeName, userName, rating, comment } = req.body;

  if (!placeId || !placeName || !userName || !rating || !comment) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newReview = new Review({ placeId, placeName, userName, rating, comment });
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review" });
  }
});

module.exports = router;
