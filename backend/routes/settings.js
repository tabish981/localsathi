const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/authMiddleware");

router.put("/password", auth, async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.findByIdAndUpdate(req.userId, { password: hashed });
  res.json({ msg: "Password changed" });
});

router.delete("/delete", auth, async (req, res) => {
  await User.findByIdAndDelete(req.userId);
  res.json({ msg: "Account deleted" });
});

module.exports = router;
