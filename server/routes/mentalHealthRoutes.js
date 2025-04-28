// server/routes/mentalHealthRoutes.js
const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
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
          content: `
You are an assistant monitoring conversations for emotional well-being.
Analyze the following conversation history.
Determine if the overall tone is emotionally stressful, negative, heated, or neutral.
Respond ONLY in this strict JSON format:

{
  "sentiment": "negative" or "neutral",
  "confidence": percentage (0-100)
}

DO NOT add any extra words or explanation. Only valid JSON.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.3, // Less randomness
    });

    const raw = completion.choices[0].message.content.trim();

    let responseJSON;
    try {
      responseJSON = JSON.parse(raw);
    } catch (parseError) {
      console.error("Failed to parse OpenAI JSON response:", raw);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    return res.json(responseJSON);
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: "Failed to analyze conversation" });
  }
});

module.exports = router;