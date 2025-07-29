import express from "express";
import { generateOTP, saveOTP, sendOTP, verifyOTP } from "../services/otpService.js";

const router = express.Router();

// send OTP
router.post("/send", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  const otp = generateOTP();
  saveOTP(email, otp);

  try {
    await sendOTP(email, otp);
    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    return res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

// verify OTP
router.post("/verify", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "Email and OTP are required" });

  if (verifyOTP(email, otp)) {
    return res.json({ success: true, message: "OTP verified" });
  } else {
    return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
  }
});

export default router;