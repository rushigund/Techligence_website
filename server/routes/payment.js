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
    console.error(" Missing Razorpay keys in .env");
    return res.status(500).json({ error: "Missing Razorpay keys" });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    console.error(" Invalid amount:", amount);
    return res.status(400).json({ error: "Invalid amount" });
  }

  const razorpay = new Razorpay({ key_id, key_secret });

  const amountInPaise = Math.round(Number(amount) * 100);
  console.log(` Creating Razorpay order for ₹${amount} = ${amountInPaise} paise`);

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order.id);
    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error(" Error creating order:", err.message);
    return res.status(500).json({ success: false, error: err.message || "Failed to create order" });
  }
});

router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error(" Missing fields in verification payload");
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔍 Comparing signatures:");
    console.log("Expected:", generatedSignature);
    console.log("Received:", razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      console.log("Payment verified successfully for order:", razorpay_order_id);
      return res.status(200).json({ success: true });
    } else {
      console.warn(" Signature mismatch");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error(" Error verifying payment:", err.message);
    return res.status(500).json({ success: false, error: err.message || "Verification failed" });
  }
});

export default router;
