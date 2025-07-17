import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const router = express.Router();

router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return res.status(500).json({
      error: "❌ Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env",
    });
  }

  const razorpay = new Razorpay({ key_id, key_secret });
  const amountInPaise = Math.round(Number(amount) * 100);

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return res.json(order);
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return res.status(500).json({ error: "Failed to create order on Razorpay" });
  }
});

router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    console.log("✅ Payment verified successfully");
    return res.json({ success: true });
  } else {
    console.warn("❌ Invalid payment signature");
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }
});

export default router;
