const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/send", async (req, res) => {
    const { amount, receiver } = req.body; // amount in dollars
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe works in cents
        currency: "usd",
        payment_method_types: ["card"],
        description: `Sending $${amount} to ${receiver}`,
      });
  
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Stripe Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;