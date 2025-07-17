import express from "express";
import {
  authenticateToken,
  requireAdmin,
  requireRobotAccess,
} from "../middleware/auth.js";

// Assume you have controller functions to handle the final logic
// e.g., import { getAllRobots, getRobotById, createRobot, ... } from '../controllers/robotController.js';

const router = express.Router();

/*
 * =================================================================
 *                !!! IMPORTANT !!!
 *
 * THE ERROR WAS CAUSED BY CALLING A MIDDLEWARE FUNCTION DIRECTLY
 * IN THIS FILE, LIKE `requireRobotAccess()`.
 *
 * DO NOT CALL MIDDLEWARE FUNCTIONS WITH `()` OUTSIDE OF A ROUTE.
 * PASS THEM AS REFERENCES (WITHOUT `()`) INSIDE THE ROUTE DEFINITION.
 *
 * =================================================================
 */

/**
 * @route   GET /api/robots
 * @desc    Get all robots (public route)
 * @access  Public
 */
router.get("/", (req, res) => res.json({ message: "Get all robots" })); // Replace with your controller logic

/**
 * @route   GET /api/robots/:id
 * @desc    Get a single robot by ID (requires auth)
 * @access  Private
 */
router.get("/:id", authenticateToken, requireRobotAccess, (req, res) =>
  res.json({ message: `Get robot with ID ${req.params.id}` }),
);

/**
 * @route   POST /api/robots
 * @desc    Create a new robot (admin only)
 * @access  Admin
 */
router.post("/", authenticateToken, requireAdmin, (req, res) =>
  res.status(201).json({ message: "New robot created" }),
);

// Add other routes (PUT, DELETE) following the same pattern.
// For example:
// router.put('/:id', authenticateToken, requireAdmin, updateRobot);
// router.delete('/:id', authenticateToken, requireAdmin, deleteRobot);

export default router;