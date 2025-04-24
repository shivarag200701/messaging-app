const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/suggest", async (req, res) => {
  const { conversation } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Suggest 3 short smart reply options (in plain text, comma-separated) for a messaging app.",
        },
        {
          role: "user",
          content: conversation,
        },
      ],
    });

    const replyText = completion.choices[0].message.content;
    const suggestions = replyText
    .split(/\d\.\s+/)       
    .map(s => s.trim())
    .filter(s => s.length); // Remove empty entries
        res.json({ suggestions });
  } catch (err) {
    console.error("❌ AI suggestion error:", err);
    res.status(500).json({ message: "Failed to generate suggestions." });
  }
});

module.exports = router;