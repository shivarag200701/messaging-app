// server/routes/mentalHealthRoutes.js
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/analyze", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that helps detect if a message is emotionally stressful, negative, or anxious. Reply with only one word: 'negative' or 'neutral'.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const response = completion.choices[0].message.content.trim().toLowerCase();
    return res.json({ sentiment: response });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: "Failed to analyze message" });
  }
});

module.exports = router;
