import express from "express";

const router = express.Router();

/**
 * @route   POST /api/contact/submit
 * @desc    Submit a contact form
 * @access  Public
 */
router.post("/submit", (req, res) => {
  console.log("Contact form submission received:", req.body);
  res
    .status(200)
    .json({ success: true, message: "Your message has been received." });
});

export default router;