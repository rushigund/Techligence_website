import express from "express";
import {
  authenticateToken,
  requireRobotAccess,
} from "../middleware/auth.js";

// You would import your actual controller functions here
// import { handleMoveCommand, getRobotStream, ... } from '../controllers/controlController.js';

const router = express.Router();

/*
 * =================================================================
 *                      !!! CRITICAL FIX !!!
 *
 * The error was caused by calling a middleware function directly
 * in this file, for example: `requireRobotAccess()`.
 *
 * Middleware must be passed as a REFERENCE (without `()`) to a
 * route handler. Express will execute it when a request comes in.
 *
 * =================================================================
 */

/**
 * @route   POST /api/control/move/:robotId
 * @desc    Send a movement command to a robot
 * @access  Private (Requires valid token and robot access)
 */
router.post("/move/:robotId", authenticateToken, requireRobotAccess, (req, res) => {
  const { robotId } = req.params;
  const { command } = req.body;
  console.log(`Received command '${command}' for robot ${robotId}`);
  res.json({ success: true, message: `Command '${command}' sent.` });
});

export default router;