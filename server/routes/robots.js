import express from "express";
import {
  authenticateToken,
  requireAdmin,
  requireRobotAccess,
} from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/robots
 * @desc    Get all robots (public)
 */
router.get("/", (req, res) => {
  res.json({ message: "Get all robots" });
});

/**
 * @route   GET /api/robots/:id
 * @desc    Get a single robot by ID (requires auth & access)
 */
router.get(
  "/:id",
  authenticateToken,
  requireRobotAccess,
  (req, res) => {
    res.json({ message: `Get robot with ID ${req.params.id}` });
  }
);

/**
 * @route   POST /api/robots
 * @desc    Create a new robot (admin only)
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    res.status(201).json({ message: "New robot created" });
  }
);

// TODO: Add PUT, DELETE as needed

export default router;
