import express from "express";
import { body, query, validationResult } from "express-validator";
import Robot from "../models/Robot.js";
import { authenticateToken, requireRobotAccess } from "../middleware/auth.js";

const router = express.Router();

// Get all robots (with access control)
router.get(
  "/",
  authenticateToken,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid page number"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Invalid limit"),
    query("type")
      .optional()
      .isIn(["4wd", "humanoid", "arm", "drone", "custom"]),
    query("category")
      .optional()
      .isIn([
        "exploration",
        "industrial",
        "surveillance",
        "research",
        "education",
      ]),
    query("status")
      .optional()
      .isIn(["online", "offline", "maintenance", "error", "charging"]),
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

      const {
        page = 1,
        limit = 20,
        type,
        category,
        status,
        search,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      // Build query for robots user has access to
      const query = {
        $or: [
          { owner: req.userId },
          { "accessPermissions.userId": req.userId },
        ],
        isActive: true,
      };

      if (type) query.type = type;
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$and = [
          query.$and || {},
          {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { model: { $regex: search, $options: "i" } },
              { serialNumber: { $regex: search, $options: "i" } },
            ],
          },
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = order === "desc" ? -1 : 1;

      // Execute query
      const robots = await Robot.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("owner", "firstName lastName email")
        .populate("currentSession.userId", "firstName lastName email")
        .populate("currentSession.urdfFile")
        .lean();

      const total = await Robot.countDocuments(query);

      // Add computed fields
      const robotsWithExtras = robots.map((robot) => ({
        ...robot,
        healthScore: Robot.prototype.getHealthScore.call(robot),
        isAvailable: Robot.prototype.isAvailable.call(robot),
      }));

      res.json({
        success: true,
        data: {
          robots: robotsWithExtras,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Robots fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch robots",
      });
    }
  },
);

// Create new robot
router.post(
  "/",
  authenticateToken,
  [
    body("name")
      .isLength({ min: 1, max: 100 })
      .withMessage("Name is required and must be less than 100 characters"),
    body("model")
      .isLength({ min: 1, max: 100 })
      .withMessage("Model is required"),
    body("serialNumber")
      .isLength({ min: 1, max: 50 })
      .withMessage("Serial number is required"),
    body("type")
      .isIn(["4wd", "humanoid", "arm", "drone", "custom"])
      .withMessage("Invalid robot type"),
    body("category")
      .isIn([
        "exploration",
        "industrial",
        "surveillance",
        "research",
        "education",
      ])
      .withMessage("Invalid category"),
    body("communication.protocol")
      .optional()
      .isIn(["ros", "ros2", "mqtt", "websocket", "tcp", "udp"]),
    body("communication.endpoint").optional().isLength({ min: 1, max: 255 }),
    body("communication.port").optional().isInt({ min: 1, max: 65535 }),
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

      // Check if serial number is unique
      const existingRobot = await Robot.findOne({
        serialNumber: req.body.serialNumber,
      });
      if (existingRobot) {
        return res.status(400).json({
          success: false,
          message: "Robot with this serial number already exists",
        });
      }

      const robotData = {
        ...req.body,
        owner: req.userId,
      };

      const robot = new Robot(robotData);
      await robot.save();

      res.status(201).json({
        success: true,
        message: "Robot created successfully",
        data: { robot: robot.toJSON() },
      });
    } catch (error) {
      console.error("Robot creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create robot",
      });
    }
  },
);

// Get specific robot
router.get(
  "/:robotId",
  authenticateToken,
  requireRobotAccess(),
  async (req, res) => {
    try {
      const robot = await Robot.findById(req.params.robotId)
        .populate("owner", "firstName lastName email")
        .populate("currentSession.userId", "firstName lastName email")
        .populate("currentSession.urdfFile")
        .populate("accessPermissions.userId", "firstName lastName email");

      res.json({
        success: true,
        data: {
          robot: {
            ...robot.toJSON(),
            healthScore: robot.getHealthScore(),
            isAvailable: robot.isAvailable(),
          },
        },
      });
    } catch (error) {
      console.error("Robot fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch robot",
      });
    }
  },
);

// Update robot
router.put(
  "/:robotId",
  authenticateToken,
  requireRobotAccess("admin"),
  [
    body("name").optional().isLength({ min: 1, max: 100 }),
    body("model").optional().isLength({ min: 1, max: 100 }),
    body("type").optional().isIn(["4wd", "humanoid", "arm", "drone", "custom"]),
    body("category")
      .optional()
      .isIn([
        "exploration",
        "industrial",
        "surveillance",
        "research",
        "education",
      ]),
    body("status")
      .optional()
      .isIn(["online", "offline", "maintenance", "error", "charging"]),
    body("communication.protocol")
      .optional()
      .isIn(["ros", "ros2", "mqtt", "websocket", "tcp", "udp"]),
    body("communication.endpoint").optional().isLength({ min: 1, max: 255 }),
    body("communication.port").optional().isInt({ min: 1, max: 65535 }),
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

      // Remove sensitive fields that shouldn't be updated via API
      const { owner, currentSession, telemetry, maintenance, ...updateData } =
        req.body;

      const robot = await Robot.findByIdAndUpdate(
        req.params.robotId,
        updateData,
        { new: true, runValidators: true },
      ).populate("owner", "firstName lastName email");

      res.json({
        success: true,
        message: "Robot updated successfully",
        data: { robot: robot.toJSON() },
      });
    } catch (error) {
      console.error("Robot update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update robot",
      });
    }
  },
);

// Update robot telemetry (usually called by robot systems)
router.put(
  "/:robotId/telemetry",
  authenticateToken,
  requireRobotAccess("control"),
  [
    body("battery.level").optional().isFloat({ min: 0, max: 100 }),
    body("battery.voltage").optional().isFloat({ min: 0 }),
    body("battery.temperature").optional().isFloat(),
    body("position.x").optional().isFloat(),
    body("position.y").optional().isFloat(),
    body("position.z").optional().isFloat(),
    body("position.orientation.roll").optional().isFloat(),
    body("position.orientation.pitch").optional().isFloat(),
    body("position.orientation.yaw").optional().isFloat(),
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

      const telemetryUpdate = {
        ...req.body,
        lastUpdated: new Date(),
      };

      const robot = await Robot.findByIdAndUpdate(
        req.params.robotId,
        { $set: { telemetry: telemetryUpdate } },
        { new: true },
      );

      res.json({
        success: true,
        message: "Telemetry updated successfully",
        data: { telemetry: robot.telemetry },
      });
    } catch (error) {
      console.error("Telemetry update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update telemetry",
      });
    }
  },
);

// Grant access to robot
router.post(
  "/:robotId/access",
  authenticateToken,
  requireRobotAccess("admin"),
  [
    body("userId").isMongoId().withMessage("Invalid user ID"),
    body("level")
      .isIn(["view", "control", "admin"])
      .withMessage("Invalid access level"),
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

      const { userId, level } = req.body;

      // Check if user exists
      const User = (await import("../models/User.js")).default;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const robot = req.robot;

      // Check if permission already exists
      const existingPermission = robot.accessPermissions.find(
        (perm) => perm.userId.toString() === userId.toString(),
      );

      if (existingPermission) {
        existingPermission.level = level;
        existingPermission.grantedBy = req.userId;
        existingPermission.grantedAt = new Date();
      } else {
        robot.accessPermissions.push({
          userId,
          level,
          grantedBy: req.userId,
        });
      }

      await robot.save();

      // Update user's robot access
      const userRobotAccess = user.robotAccess.find(
        (access) => access.robotId.toString() === robot._id.toString(),
      );

      if (userRobotAccess) {
        userRobotAccess.accessLevel = level;
        userRobotAccess.grantedAt = new Date();
      } else {
        user.robotAccess.push({
          robotId: robot._id,
          accessLevel: level,
        });
      }

      await user.save();

      res.json({
        success: true,
        message: "Access granted successfully",
        data: {
          userId,
          level,
          robotId: robot._id,
        },
      });
    } catch (error) {
      console.error("Access grant error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to grant access",
      });
    }
  },
);

// Revoke access to robot
router.delete(
  "/:robotId/access/:userId",
  authenticateToken,
  requireRobotAccess("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const robot = req.robot;

      // Remove permission from robot
      robot.accessPermissions = robot.accessPermissions.filter(
        (perm) => perm.userId.toString() !== userId.toString(),
      );
      await robot.save();

      // Remove robot access from user
      const User = (await import("../models/User.js")).default;
      await User.findByIdAndUpdate(userId, {
        $pull: {
          robotAccess: { robotId: robot._id },
        },
      });

      res.json({
        success: true,
        message: "Access revoked successfully",
      });
    } catch (error) {
      console.error("Access revoke error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to revoke access",
      });
    }
  },
);

// Add maintenance issue
router.post(
  "/:robotId/maintenance",
  authenticateToken,
  requireRobotAccess("control"),
  [
    body("description")
      .isLength({ min: 1, max: 500 })
      .withMessage("Description is required"),
    body("severity")
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid severity level"),
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

      const { description, severity } = req.body;
      const robot = req.robot;

      robot.maintenance.issues.push({
        description,
        severity,
        reportedAt: new Date(),
      });

      await robot.save();

      res.status(201).json({
        success: true,
        message: "Maintenance issue reported successfully",
        data: {
          issue: robot.maintenance.issues[robot.maintenance.issues.length - 1],
        },
      });
    } catch (error) {
      console.error("Maintenance issue creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to report maintenance issue",
      });
    }
  },
);

// Delete robot
router.delete(
  "/:robotId",
  authenticateToken,
  requireRobotAccess("admin"),
  async (req, res) => {
    try {
      const robot = req.robot;

      // Only owner can delete
      if (robot.owner.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only robot owner can delete",
        });
      }

      // Soft delete by setting isActive to false
      robot.isActive = false;
      await robot.save();

      res.json({
        success: true,
        message: "Robot deleted successfully",
      });
    } catch (error) {
      console.error("Robot deletion error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete robot",
      });
    }
  },
);

export default router;
