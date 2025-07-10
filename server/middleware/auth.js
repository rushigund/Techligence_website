import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

export const requireRobotAccess = (accessLevel = "view") => {
  return async (req, res, next) => {
    try {
      const robotId = req.params.robotId || req.body.robotId;
      if (!robotId) {
        return res.status(400).json({
          success: false,
          message: "Robot ID required",
        });
      }

      const Robot = (await import("../models/Robot.js")).default;
      const robot = await Robot.findById(robotId);

      if (!robot) {
        return res.status(404).json({
          success: false,
          message: "Robot not found",
        });
      }

      // Check if user is owner
      if (robot.owner.toString() === req.userId.toString()) {
        req.robot = robot;
        return next();
      }

      // Check access permissions
      const permission = robot.accessPermissions.find(
        (perm) => perm.userId.toString() === req.userId.toString(),
      );

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this robot",
        });
      }

      // Check access level
      const levels = ["view", "control", "admin"];
      const requiredLevelIndex = levels.indexOf(accessLevel);
      const userLevelIndex = levels.indexOf(permission.level);

      if (userLevelIndex < requiredLevelIndex) {
        return res.status(403).json({
          success: false,
          message: `${accessLevel} access required`,
        });
      }

      req.robot = robot;
      next();
    } catch (error) {
      console.error("Robot access check error:", error);
      res.status(500).json({
        success: false,
        message: "Access check failed",
      });
    }
  };
};
