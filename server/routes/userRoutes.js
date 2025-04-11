const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/users → List all usernames
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "username -_id"); // Only return usernames
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users", err);
    res.status(500).json({ message: "Error getting users" });
  }
});

module.exports = router;