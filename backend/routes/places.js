const express = require("express");
const router = express.Router();
const Place = require("../models/Place");

/* GET cached places by category + version */
router.get("/:category", async (req, res) => {
  const { category } = req.params;
  const version = Number(req.query.version);

  const places = await Place.find({
    category,
    version
  });

  res.json(places);
});

/* SAVE places */
router.post("/", async (req, res) => {
  await Place.insertMany(req.body);
  res.json({ message: "Places cached successfully" });
});

module.exports = router;
