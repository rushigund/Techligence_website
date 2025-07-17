import express from "express";

const router = express.Router();

/**
 * @route   POST /api/career/apply
 * @desc    Submit a job application
 * @access  Public
 */
router.post("/apply", (req, res) => {
  console.log("Career application received:", req.body);
  res
    .status(201)
    .json({ success: true, message: "Application received successfully." });
});

export default router;