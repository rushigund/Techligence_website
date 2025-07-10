import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Robot from "../models/Robot.js";

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return next(new Error("User not found or inactive"));
    }

    socket.userId = user._id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
};

export const setupSocketHandlers = (io, robotCommManager) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(`👤 User ${socket.user.email} connected: ${socket.id}`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle robot control session start
    socket.on("startRobotControl", async (data) => {
      try {
        const { robotId } = data;

        // Verify robot exists and user has access
        const robot = await Robot.findById(robotId);
        if (!robot) {
          socket.emit("error", { message: "Robot not found" });
          return;
        }

        // Check if user has control access
        const hasAccess =
          robot.owner.toString() === socket.userId.toString() ||
          robot.accessPermissions.some(
            (perm) =>
              perm.userId.toString() === socket.userId.toString() &&
              ["control", "admin"].includes(perm.level),
          );

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Check if robot is available
        if (!robot.isAvailable()) {
          socket.emit("error", {
            message: "Robot is not available for control",
          });
          return;
        }

        // Start control session
        robot.currentSession = {
          userId: socket.userId,
          startedAt: new Date(),
          controlMode: "gesture",
        };
        await robot.save();

        // Connect to robot
        await robotCommManager.connectToRobot(robotId, robot);

        // Join robot control room
        socket.join(`robot_${robotId}`);
        socket.currentRobotId = robotId;

        socket.emit("robotControlStarted", {
          robotId,
          robot: robot.toJSON(),
        });

        // Notify other users that robot is now controlled
        socket.broadcast.emit("robotStatusChanged", {
          robotId,
          status: "controlled",
          controlledBy: socket.user.email,
        });

        console.log(
          `🤖 User ${socket.user.email} started controlling robot ${robotId}`,
        );
      } catch (error) {
        console.error("Error starting robot control:", error);
        socket.emit("error", { message: "Failed to start robot control" });
      }
    });

    // Handle gesture control commands
    socket.on("gestureControl", async (data) => {
      try {
        const { robotId, gestureData } = data;

        if (socket.currentRobotId !== robotId) {
          socket.emit("error", { message: "Not controlling this robot" });
          return;
        }

        // Send control command to robot
        await robotCommManager.sendControlCommand(robotId, {
          type: "gesture",
          gestureType: gestureData.gestureType,
          handPosition: gestureData.handPosition,
          confidence: gestureData.confidence,
          timestamp: new Date(),
        });

        // Broadcast gesture data to robot room (for monitoring)
        socket.to(`robot_${robotId}`).emit("robotGestureUpdate", {
          robotId,
          gestureData,
          controlledBy: socket.user.email,
        });
      } catch (error) {
        console.error("Error handling gesture control:", error);
        socket.emit("error", { message: "Failed to send gesture command" });
      }
    });

    // Handle manual control commands
    socket.on("manualControl", async (data) => {
      try {
        const { robotId, command } = data;

        if (socket.currentRobotId !== robotId) {
          socket.emit("error", { message: "Not controlling this robot" });
          return;
        }

        await robotCommManager.sendControlCommand(robotId, {
          type: "manual",
          ...command,
          timestamp: new Date(),
        });

        socket.to(`robot_${robotId}`).emit("robotManualUpdate", {
          robotId,
          command,
          controlledBy: socket.user.email,
        });
      } catch (error) {
        console.error("Error handling manual control:", error);
        socket.emit("error", { message: "Failed to send manual command" });
      }
    });

    // Handle robot monitoring subscription
    socket.on("subscribeRobotMonitoring", async (data) => {
      try {
        const { robotId } = data;

        const robot = await Robot.findById(robotId);
        if (!robot) {
          socket.emit("error", { message: "Robot not found" });
          return;
        }

        // Check if user has view access
        const hasAccess =
          robot.owner.toString() === socket.userId.toString() ||
          robot.accessPermissions.some(
            (perm) => perm.userId.toString() === socket.userId.toString(),
          );

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        socket.join(`robot_monitor_${robotId}`);
        socket.emit("robotMonitoringStarted", { robotId });
      } catch (error) {
        console.error("Error subscribing to robot monitoring:", error);
        socket.emit("error", { message: "Failed to subscribe to monitoring" });
      }
    });

    // Handle ending robot control
    socket.on("endRobotControl", async (data) => {
      try {
        const { robotId } = data;

        if (socket.currentRobotId !== robotId) {
          socket.emit("error", { message: "Not controlling this robot" });
          return;
        }

        await endRobotControlSession(socket, robotId, robotCommManager);
      } catch (error) {
        console.error("Error ending robot control:", error);
        socket.emit("error", { message: "Failed to end robot control" });
      }
    });

    // Handle emergency stop
    socket.on("emergencyStop", async (data) => {
      try {
        const { robotId } = data;

        if (socket.currentRobotId !== robotId) {
          socket.emit("error", { message: "Not controlling this robot" });
          return;
        }

        // Send emergency stop command
        await robotCommManager.sendControlCommand(robotId, {
          type: "emergency_stop",
          timestamp: new Date(),
        });

        // Update robot status
        await Robot.findByIdAndUpdate(robotId, {
          status: "error",
          "currentSession.controlMode": "stopped",
        });

        socket.emit("emergencyStopExecuted", { robotId });
        socket.to(`robot_${robotId}`).emit("robotEmergencyStop", {
          robotId,
          stoppedBy: socket.user.email,
        });

        console.log(
          `🚨 Emergency stop executed by ${socket.user.email} for robot ${robotId}`,
        );
      } catch (error) {
        console.error("Error executing emergency stop:", error);
        socket.emit("error", { message: "Failed to execute emergency stop" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`👤 User ${socket.user.email} disconnected: ${socket.id}`);

      // End any active robot control sessions
      if (socket.currentRobotId) {
        await endRobotControlSession(
          socket,
          socket.currentRobotId,
          robotCommManager,
        );
      }
    });
  });

  // Handle robot communication events
  robotCommManager.on("robotMessage", (data) => {
    const { robotId, messageType, data: messageData } = data;

    // Broadcast to robot monitoring rooms
    io.to(`robot_monitor_${robotId}`).emit("robotMessage", {
      robotId,
      messageType,
      data: messageData,
      timestamp: new Date(),
    });
  });

  robotCommManager.on("robotStatusUpdate", async (data) => {
    const { robotId, status } = data;

    // Update robot in database
    await Robot.findByIdAndUpdate(robotId, {
      status: status.status,
      "telemetry.lastUpdated": new Date(),
      "communication.lastHeartbeat": new Date(),
    });

    // Broadcast status update
    io.emit("robotStatusChanged", {
      robotId,
      status: status.status,
      timestamp: new Date(),
    });
  });

  robotCommManager.on("robotTelemetryUpdate", (data) => {
    const { robotId, telemetry } = data;

    // Broadcast telemetry to monitoring rooms
    io.to(`robot_monitor_${robotId}`).emit("robotTelemetry", {
      robotId,
      telemetry,
      timestamp: new Date(),
    });
  });

  robotCommManager.on("commandSent", (data) => {
    const { robotId, command } = data;

    // Broadcast command acknowledgment
    io.to(`robot_${robotId}`).emit("commandAcknowledged", {
      robotId,
      command,
      timestamp: new Date(),
    });
  });
};

// Helper function to end robot control session
const endRobotControlSession = async (socket, robotId, robotCommManager) => {
  try {
    // Update robot session
    const robot = await Robot.findByIdAndUpdate(
      robotId,
      {
        $unset: {
          "currentSession.userId": "",
          "currentSession.startedAt": "",
          "currentSession.controlMode": "",
        },
      },
      { new: true },
    );

    // Disconnect from robot
    robotCommManager.disconnectRobot(robotId);

    // Leave robot rooms
    socket.leave(`robot_${robotId}`);
    socket.currentRobotId = null;

    socket.emit("robotControlEnded", { robotId });

    // Notify other users that robot is available
    socket.broadcast.emit("robotStatusChanged", {
      robotId,
      status: "available",
      timestamp: new Date(),
    });

    console.log(
      `🤖 User ${socket.user.email} ended control of robot ${robotId}`,
    );
  } catch (error) {
    console.error("Error ending robot control session:", error);
    throw error;
  }
};
