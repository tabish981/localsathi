const router = require("express").Router();
const Trip = require("../models/Trip");

/* Save trip */
router.post("/", async (req, res) => {
  const trip = new Trip(req.body);
  await trip.save();
  res.json(trip);
});

/* Get user trips */
router.get("/:userId", async (req, res) => {
  const trips = await Trip.find({ userId: req.params.userId })
    .sort({ createdAt: -1 });
  res.json(trips);
});

/* Clear all */
router.delete("/:userId", async (req, res) => {
  await Trip.deleteMany({ userId: req.params.userId });
  res.json({ success: true });
});

module.exports = router;
