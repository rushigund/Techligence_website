import express from "express";
import { body, validationResult } from "express-validator";
import Robot from "../models/Robot.js";
import { authenticateToken, requireRobotAccess } from "../middleware/auth.js";
import { io, robotCommManager } from "../server.js";

const router = express.Router();

// Start robot control session
router.post(
  "/:robotId/start",
  authenticateToken,
  requireRobotAccess("control"),
  [
    body("controlMode")
      .optional()
      .isIn(["manual", "gesture", "autonomous", "programming"])
      .withMessage("Invalid control mode"),
    body("urdfFileId")
      .optional()
      .isMongoId()
      .withMessage("Invalid URDF file ID"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const robot = req.robot;
      const { controlMode = "gesture", urdfFileId } = req.body;

      // Check if robot is available
      if (!robot.isAvailable()) {
        return res.status(400).json({
          success: false,
          message: "Robot is not available for control",
          data: {
            currentController: robot.currentSession?.userId,
            status: robot.status,
          },
        });
      }

      // Validate URDF file if provided
      if (urdfFileId) {
        const URDFFile = (await import("../models/URDFFile.js")).default;
        const urdfFile = await URDFFile.findById(urdfFileId);
        if (!urdfFile || !urdfFile.hasAccess(req.userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid or inaccessible URDF file",
          });
        }
      }

      // Start control session
      robot.currentSession = {
        userId: req.userId,
        startedAt: new Date(),
        controlMode,
        urdfFile: urdfFileId,
      };
      robot.status = "online";
      await robot.save();

      // Connect to robot via communication manager
      try {
        await robotCommManager.connectToRobot(robot._id.toString(), robot);
      } catch (commError) {
        console.warn("Failed to establish robot communication:", commError);
        // Continue anyway, as some robots might not be physically connected
      }

      // Emit to Socket.IO clients
      io.emit("robotControlStarted", {
        robotId: robot._id,
        controlledBy: req.userId,
        controlMode,
      });

      res.json({
        success: true,
        message: "Robot control session started",
        data: {
          robotId: robot._id,
          sessionId: robot.currentSession._id,
          controlMode,
          startedAt: robot.currentSession.startedAt,
        },
      });
    } catch (error) {
      console.error("Control start error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start control session",
      });
    }
  },
);

// Send control command
router.post(
  "/:robotId/command",
  authenticateToken,
  requireRobotAccess("control"),
  [
    body("type")
      .isIn(["gesture", "manual", "stop", "emergency_stop"])
      .withMessage("Invalid command type"),
    body("data").notEmpty().withMessage("Command data is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const robot = req.robot;
      const { type, data } = req.body;

      // Check if user is currently controlling the robot
      if (
        !robot.currentSession ||
        robot.currentSession.userId.toString() !== req.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not currently controlling this robot",
        });
      }

      // Prepare command based on type
      let command;
      switch (type) {
        case "gesture":
          command = {
            type: "gesture",
            gestureType: data.gestureType,
            handPosition: data.handPosition,
            confidence: data.confidence,
            timestamp: new Date(),
          };
          break;

        case "manual":
          command = {
            type: "manual",
            linear: data.linear || { x: 0, y: 0, z: 0 },
            angular: data.angular || { x: 0, y: 0, z: 0 },
            timestamp: new Date(),
          };
          break;

        case "stop":
          command = {
            type: "stop",
            timestamp: new Date(),
          };
          break;

        case "emergency_stop":
          command = {
            type: "emergency_stop",
            timestamp: new Date(),
          };
          // Update robot status for emergency stop
          robot.status = "error";
          await robot.save();
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Unknown command type",
          });
      }

      // Send command to robot
      try {
        await robotCommManager.sendControlCommand(
          robot._id.toString(),
          command,
        );

        // Emit to Socket.IO for real-time updates
        io.to(`robot_${robot._id}`).emit("commandSent", {
          robotId: robot._id,
          command,
          sentBy: req.userId,
        });

        res.json({
          success: true,
          message: "Command sent successfully",
          data: {
            commandId: command.timestamp.getTime(),
            type: command.type,
            timestamp: command.timestamp,
          },
        });
      } catch (commError) {
        console.error("Command send error:", commError);
        res.status(500).json({
          success: false,
          message: "Failed to send command to robot",
          error: commError.message,
        });
      }
    } catch (error) {
      console.error("Control command error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process control command",
      });
    }
  },
);

// Get robot status
router.get(
  "/:robotId/status",
  authenticateToken,
  requireRobotAccess("view"),
  async (req, res) => {
    try {
      const robot = req.robot;

      // Get connection status from communication manager
      const connectionStatus = robotCommManager.getConnectionStatus(
        robot._id.toString(),
      );

      res.json({
        success: true,
        data: {
          robotId: robot._id,
          status: robot.status,
          isAvailable: robot.isAvailable(),
          healthScore: robot.getHealthScore(),
          currentSession: robot.currentSession,
          telemetry: robot.telemetry,
          communication: {
            ...robot.communication,
            connectionStatus,
          },
          lastUpdated: robot.updatedAt,
        },
      });
    } catch (error) {
      console.error("Status fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch robot status",
      });
    }
  },
);

// End robot control session
router.post(
  "/:robotId/stop",
  authenticateToken,
  requireRobotAccess("control"),
  async (req, res) => {
    try {
      const robot = req.robot;

      // Check if user is currently controlling the robot
      if (
        !robot.currentSession ||
        robot.currentSession.userId.toString() !== req.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not currently controlling this robot",
        });
      }

      // Send stop command before ending session
      try {
        await robotCommManager.sendControlCommand(robot._id.toString(), {
          type: "stop",
          timestamp: new Date(),
        });
      } catch (commError) {
        console.warn("Failed to send stop command:", commError);
      }

      // Clear current session
      robot.currentSession = undefined;
      await robot.save();

      // Disconnect from robot
      robotCommManager.disconnectRobot(robot._id.toString());

      // Emit to Socket.IO clients
      io.emit("robotControlStopped", {
        robotId: robot._id,
        stoppedBy: req.userId,
      });

      res.json({
        success: true,
        message: "Robot control session ended",
        data: {
          robotId: robot._id,
          endedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Control stop error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to stop control session",
      });
    }
  },
);

// Get control history for a robot
router.get(
  "/:robotId/history",
  authenticateToken,
  requireRobotAccess("view"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const robot = req.robot;

      // This would require a separate ControlLog model to track commands
      // For now, return empty array with placeholder structure
      const history = [];

      res.json({
        success: true,
        data: {
          robotId: robot._id,
          history,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0,
          },
        },
      });
    } catch (error) {
      console.error("Control history fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch control history",
      });
    }
  },
);

// Get robot telemetry stream
router.get(
  "/:robotId/telemetry",
  authenticateToken,
  requireRobotAccess("view"),
  async (req, res) => {
    try {
      const robot = req.robot;

      // Set up Server-Sent Events for real-time telemetry
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Cache-Control, Content-Type, Authorization",
      });

      // Send current telemetry
      res.write(
        `data: ${JSON.stringify({
          type: "telemetry",
          robotId: robot._id,
          data: robot.telemetry,
          timestamp: new Date(),
        })}\n\n`,
      );

      // Set up real-time updates
      const telemetryHandler = (data) => {
        if (data.robotId === robot._id.toString()) {
          res.write(
            `data: ${JSON.stringify({
              type: "telemetry",
              robotId: data.robotId,
              data: data.telemetry,
              timestamp: new Date(),
            })}\n\n`,
          );
        }
      };

      robotCommManager.on("robotTelemetryUpdate", telemetryHandler);

      // Handle client disconnect
      req.on("close", () => {
        robotCommManager.removeListener(
          "robotTelemetryUpdate",
          telemetryHandler,
        );
        res.end();
      });

      // Keep connection alive
      const keepAlive = setInterval(() => {
        res.write(": keep-alive\n\n");
      }, 30000);

      req.on("close", () => {
        clearInterval(keepAlive);
      });
    } catch (error) {
      console.error("Telemetry stream error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to establish telemetry stream",
      });
    }
  },
);

// Emergency stop all robots (admin only)
router.post("/emergency-stop-all", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Get all online robots
    const robots = await Robot.find({
      status: "online",
      "currentSession.userId": { $exists: true },
    });

    const stopResults = [];

    for (const robot of robots) {
      try {
        // Send emergency stop command
        await robotCommManager.sendControlCommand(robot._id.toString(), {
          type: "emergency_stop",
          timestamp: new Date(),
        });

        // Update robot status
        robot.status = "error";
        robot.currentSession = undefined;
        await robot.save();

        stopResults.push({
          robotId: robot._id,
          success: true,
        });

        // Emit to Socket.IO
        io.emit("robotEmergencyStop", {
          robotId: robot._id,
          stoppedBy: req.userId,
          isGlobalStop: true,
        });
      } catch (error) {
        console.error(`Failed to emergency stop robot ${robot._id}:`, error);
        stopResults.push({
          robotId: robot._id,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Emergency stop executed for all robots",
      data: {
        totalRobots: robots.length,
        results: stopResults,
        executedBy: req.userId,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Global emergency stop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute global emergency stop",
    });
  }
});

export default router;
