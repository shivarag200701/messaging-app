const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET /api/messages/:user1/:user2
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch messages", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;