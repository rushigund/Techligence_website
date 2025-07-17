import express from "express";

const router = express.Router();

/**
 * @route   GET /api/blog
 * @desc    Get all blog posts
 * @access  Public
 */
router.get("/", (req, res) => {
  console.log("Request to get all blog posts");
  res.status(200).json({ success: true, data: [] });
});

// You would add more routes here like POST /, GET /:slug, etc.

export default router;