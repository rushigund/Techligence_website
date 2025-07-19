import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js"; // Your authentication and authorization middleware
import { ingestAllContent } from "../utils/contentIngestor.js"; // Our content ingestion pipeline

const router = express.Router();

/**
 * POST /api/admin/ingest-content
 * Triggers a full re-ingestion of all website content (dynamic and static)
 * into the Pinecone vector database.
 * This route is protected and only accessible by users with the 'admin' role.
 */
router.post(
  "/ingest-content",
  authenticateToken, // Ensure user is authenticated
  authorizeRoles('admin'), // Ensure user has 'admin' role
  async (req, res) => {
    try {
      console.log(`Admin user ${req.user.email} triggered full content ingestion.`);
      await ingestAllContent(); // Call the main ingestion function

      res.json({
        success: true,
        message: "Full content ingestion initiated and completed successfully!",
      });
    } catch (error) {
      console.error("Error during full content ingestion:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initiate full content ingestion.",
        error: error.message,
      });
    }
  }
);

export default router;
