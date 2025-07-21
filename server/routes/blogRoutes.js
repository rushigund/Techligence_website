import express from "express";
import { body, validationResult } from "express-validator";
import BlogPost from "../models/BlogPost.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js"; // Import auth and authorize middleware
import { updateSingleContentItem } from "../utils/contentIngestor.js"; // NEW: Import contentIngestor for RAG updates

const router = express.Router();

// --- Public Routes (visible to all users) ---

// GET /api/blogposts - Get all blog posts
router.get("/blogposts", async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({}).sort({ publishedDate: -1 }); // Fetch all posts, sorted by date
    res.json({
      success: true,
      message: "Blog posts fetched successfully!",
      data: blogPosts,
    });
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog posts", error: error.message });
  }
});

// GET /api/blogposts/:postId - Get a single blog post by postId
// This route is now public, allowing any user to view an individual blog post.
router.get("/blogposts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const blogPost = await BlogPost.findOne({ postId: postId });

    if (!blogPost) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    res.json({
      success: true,
      message: "Blog post fetched successfully!",
      data: blogPost,
    });
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog post", error: error.message });
  }
});

// --- Admin-Only Routes (for CRUD operations) ---

// POST /api/blogposts - Add a new blog post (Admin only)
router.post(
  "/blogposts",
  authenticateToken,
  authorizeRoles('admin'), // Only admins can add blog posts
  [
    // Validation rules for new blog post
    body("postId")
      .isNumeric().withMessage("Post ID must be a number")
      .notEmpty().withMessage("Post ID is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("excerpt").notEmpty().withMessage("Excerpt is required"),
    body("author").notEmpty().withMessage("Author is required"),
    body("authorRole").notEmpty().withMessage("Author role is required"),
    body("publishedDate").isISO8601().toDate().withMessage("Valid published date is required"),
    body("readTime").notEmpty().withMessage("Read time is required"),
    body("category").isIn(["robotics", "ai", "technology", "tutorials", "industry", "innovation"]).withMessage("Invalid category"),
    body("image").notEmpty().withMessage("Image is required"),
    body("likes").isInt({ min: 0 }).optional().withMessage("Likes must be a non-negative integer"),
    body("comments").isInt({ min: 0 }).optional().withMessage("Comments must be a non-negative integer"),
    body("featured").isBoolean().optional().withMessage("Featured must be a boolean"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      // Check if post with this postId already exists
      const existingPost = await BlogPost.findOne({ postId: req.body.postId });
      if (existingPost) {
        return res.status(409).json({ success: false, message: "Blog post with this ID already exists." });
      }

      const newPost = new BlogPost(req.body);
      await newPost.save();

      // NEW: Post-save hook for RAG
      await updateSingleContentItem('blog', newPost, 'upsert');

      res.status(201).json({ success: true, message: "Blog post created successfully!", data: newPost });
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ success: false, message: "Failed to create blog post", error: error.message });
    }
  }
);

// PUT /api/blogposts/:postId - Update an existing blog post (Admin only)
router.put(
  "/blogposts/:postId",
  authenticateToken,
  authorizeRoles('admin'),
  [
    // Validation rules for updating blog post (all optional as it's an update)
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("excerpt").optional().notEmpty().withMessage("Excerpt cannot be empty"),
    body("author").optional().notEmpty().withMessage("Author cannot be empty"),
    body("authorRole").optional().notEmpty().withMessage("Author role cannot be empty"),
    body("publishedDate").optional().isISO8601().toDate().withMessage("Valid published date is required"),
    body("readTime").optional().notEmpty().withMessage("Read time cannot be empty"),
    body("category").optional().isIn(["robotics", "ai", "technology", "tutorials", "industry", "innovation"]).withMessage("Invalid category"),
    body("image").optional().notEmpty().withMessage("Image cannot be empty"),
    body("likes").optional().isInt({ min: 0 }).withMessage("Likes must be a non-negative integer"),
    body("comments").optional().isInt({ min: 0 }).withMessage("Comments must be a non-negative integer"),
    body("featured").optional().isBoolean().withMessage("Featured must be a boolean"),
    body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const { postId } = req.params;
      const updates = req.body;

      // Convert publishedDate to Date object if present
      if (updates.publishedDate) {
        updates.publishedDate = new Date(updates.publishedDate);
      }

      // Remove postId from updates to prevent accidental changes if it's disabled on frontend for edit
      delete updates.postId;

      const updatedPost = await BlogPost.findOneAndUpdate(
        { postId: parseInt(postId) },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }

      // NEW: Post-update hook for RAG
      await updateSingleContentItem('blog', updatedPost, 'upsert');

      res.json({ success: true, message: "Blog post updated successfully!", data: updatedPost });
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ success: false, message: "Failed to update blog post", error: error.message });
    }
  }
);

// DELETE /api/blogposts/:postId - Delete a blog post (Admin only)
router.delete(
    "/blogposts/:postId",
    authenticateToken,
    authorizeRoles('admin'),
    async (req, res) => {
      try {
        const { postId } = req.params;

        const deletedPost = await BlogPost.findOneAndDelete({ postId: parseInt(postId) });

        if (!deletedPost) {
          return res.status(404).json({ success: false, message: "Blog post not found" });
        }

        // NEW: Post-delete hook for RAG
        // Note: As discussed, direct deletion by sourceId prefix is complex without knowing all chunk IDs.
        // For now, this will log a warning. Rely on full re-ingestion for cleanup or implement
        // a more sophisticated deletion strategy if needed.
        await updateSingleContentItem('blog', deletedPost, 'delete');

        res.json({
          success: true,
          message: "Blog post deleted successfully!",
          data: null,
        });
      } catch (error) {
        console.error("Error deleting blog post:", error);
        res.status(500).json({ success: false, message: "Failed to delete blog post", error: error.message });
      }
    }
  );

export default router;
