import mqtt from "mqtt";
import EventEmitter from "events";

// Conditionally import ROS libraries if available
let rclnodejs = null,
  ROSLIB = null;

// Check if ROS packages are available
const checkROSAvailability = async () => {
  try {
    rclnodejs = await import("rclnodejs");
    console.log("✅ ROS2 (rclnodejs) available");
  } catch (e) {
    console.warn("⚠️  ROS2 not available: rclnodejs package not installed");
  }

  try {
    ROSLIB = await import("roslib");
    console.log("✅ ROSLIB available");
  } catch (e) {
    console.warn("⚠️  ROSLIB not available: roslib package not installed");
  }
};

export class RobotCommunicationManager extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map(); // robotId -> connection info
    this.rosNode = null;
    this.mqttClient = null;
    this.isInitialized = false;
    this.rosAvailable = false;

    // Check ROS availability on startup
    checkROSAvailability().then(() => {
      this.rosAvailable = !!(rclnodejs || ROSLIB);
    });
  }

  async initialize() {
    try {
      // Initialize ROS2 node
      await this.initializeROS2();

      // Initialize MQTT client
      await this.initializeMQTT();

      this.isInitialized = true;
      console.log("✅ Robot communication manager initialized");
    } catch (error) {
      console.error("❌ Failed to initialize robot communication:", error);
      throw error;
    }
  }

  async initializeROS2() {
    try {
      if (!rclnodejs) {
        console.warn("⚠️  ROS2 library not available, skipping initialization");
        return;
      }
      if (!rclnodejs.isShutdown()) {
        await rclnodejs.init();
      }
      this.rosNode = new rclnodejs.Node("robotech_control_node");
      console.log("✅ ROS2 node initialized");
    } catch (error) {
      console.warn(
        "⚠️  ROS2 not available, skipping initialization:",
        error.message,
      );
    }
  }

  async initializeMQTT() {
    try {
      // Skip MQTT initialization in demo mode to prevent connection spam
      if (
        !process.env.MQTT_BROKER_URL ||
        process.env.MQTT_BROKER_URL === "mqtt://localhost:1883"
      ) {
        console.log("⚠️  MQTT broker not configured, skipping initialization");
        return;
      }

      const mqttUrl = process.env.MQTT_BROKER_URL;
      this.mqttClient = mqtt.connect(mqttUrl, {
        clientId: `robotech_server_${Date.now()}`,
        reconnectPeriod: 10000, // Increased to 10 seconds
        connectTimeout: 5000, // Reduced timeout
        reconnectOnError: false, // Disable auto-reconnect on error
      });

      this.mqttClient.on("connect", () => {
        console.log("✅ MQTT client connected");
        // Subscribe to robot status topics
        this.mqttClient.subscribe("robots/+/status");
        this.mqttClient.subscribe("robots/+/telemetry");
        this.mqttClient.subscribe("robots/+/heartbeat");
      });

      this.mqttClient.on("message", (topic, message) => {
        this.handleMQTTMessage(topic, message);
      });

      this.mqttClient.on("error", (error) => {
        console.error("❌ MQTT error:", error);
      });
    } catch (error) {
      console.warn(
        "⚠️  MQTT broker not available, skipping initialization:",
        error.message,
      );
    }
  }

  handleMQTTMessage(topic, message) {
    try {
      const parts = topic.split("/");
      const robotId = parts[1];
      const messageType = parts[2];
      const data = JSON.parse(message.toString());

      this.emit("robotMessage", {
        robotId,
        messageType,
        data,
        timestamp: new Date(),
      });

      // Handle specific message types
      switch (messageType) {
        case "status":
          this.updateRobotStatus(robotId, data);
          break;
        case "telemetry":
          this.updateRobotTelemetry(robotId, data);
          break;
        case "heartbeat":
          this.updateRobotHeartbeat(robotId);
          break;
      }
    } catch (error) {
      console.error("Error handling MQTT message:", error);
    }
  }

  async connectToRobot(robotId, robotConfig) {
    try {
      const { protocol, endpoint, port, topics } = robotConfig.communication;

      switch (protocol) {
        case "ros2":
          return await this.connectROS2Robot(robotId, robotConfig);
        case "ros":
          return await this.connectROSRobot(robotId, robotConfig);
        case "mqtt":
          return await this.connectMQTTRobot(robotId, robotConfig);
        case "websocket":
          return await this.connectWebSocketRobot(robotId, robotConfig);
        default:
          throw new Error(`Unsupported protocol: ${protocol}`);
      }
    } catch (error) {
      console.error(`Failed to connect to robot ${robotId}:`, error);
      throw error;
    }
  }

  async connectROS2Robot(robotId, robotConfig) {
    if (!this.rosNode) {
      throw new Error("ROS2 node not initialized");
    }

    const connection = {
      type: "ros2",
      robotId,
      publishers: new Map(),
      subscribers: new Map(),
      services: new Map(),
    };

    // Create control publisher
    const controlPub = this.rosNode.createPublisher(
      "geometry_msgs/msg/Twist",
      robotConfig.communication.topics.control || `/robot_${robotId}/cmd_vel`,
    );
    connection.publishers.set("control", controlPub);

    // Create status subscriber
    const statusSub = this.rosNode.createSubscription(
      "std_msgs/msg/String",
      robotConfig.communication.topics.status || `/robot_${robotId}/status`,
      (msg) => {
        this.emit("robotMessage", {
          robotId,
          messageType: "status",
          data: JSON.parse(msg.data),
          timestamp: new Date(),
        });
      },
    );
    connection.subscribers.set("status", statusSub);

    this.connections.set(robotId, connection);
    console.log(`✅ ROS2 robot ${robotId} connected`);
    return connection;
  }

  async connectROSRobot(robotId, robotConfig) {
    if (!ROSLIB) {
      throw new Error("ROSLIB not available. Please install roslib package.");
    }

    const { endpoint, port } = robotConfig.communication;

    const ros = new ROSLIB.default.Ros({
      url: `ws://${endpoint}:${port || 9090}`,
    });

    return new Promise((resolve, reject) => {
      ros.on("connection", () => {
        const connection = {
          type: "ros",
          robotId,
          ros,
          publishers: new Map(),
          subscribers: new Map(),
          services: new Map(),
        };

        // Create control publisher
        const controlPub = new ROSLIB.default.Topic({
          ros,
          name:
            robotConfig.communication.topics.control ||
            `/robot_${robotId}/cmd_vel`,
          messageType: "geometry_msgs/Twist",
        });
        connection.publishers.set("control", controlPub);

        // Create status subscriber
        const statusSub = new ROSLIB.default.Topic({
          ros,
          name:
            robotConfig.communication.topics.status ||
            `/robot_${robotId}/status`,
          messageType: "std_msgs/String",
        });

        statusSub.subscribe((message) => {
          this.emit("robotMessage", {
            robotId,
            messageType: "status",
            data: JSON.parse(message.data),
            timestamp: new Date(),
          });
        });
        connection.subscribers.set("status", statusSub);

        this.connections.set(robotId, connection);
        console.log(`✅ ROS robot ${robotId} connected`);
        resolve(connection);
      });

      ros.on("error", (error) => {
        console.error(`❌ ROS connection error for robot ${robotId}:`, error);
        reject(error);
      });

      ros.on("close", () => {
        console.log(`🔌 ROS connection closed for robot ${robotId}`);
        this.connections.delete(robotId);
      });
    });
  }

  async connectMQTTRobot(robotId, robotConfig) {
    if (!this.mqttClient) {
      throw new Error("MQTT client not initialized");
    }

    const connection = {
      type: "mqtt",
      robotId,
      topics: {
        control: `robots/${robotId}/control`,
        status: `robots/${robotId}/status`,
        telemetry: `robots/${robotId}/telemetry`,
      },
    };

    // Subscribe to robot-specific topics
    this.mqttClient.subscribe(`robots/${robotId}/+`);

    this.connections.set(robotId, connection);
    console.log(`✅ MQTT robot ${robotId} connected`);
    return connection;
  }

  async connectWebSocketRobot(robotId, robotConfig) {
    // WebSocket implementation would go here
    // This is a simplified version
    const connection = {
      type: "websocket",
      robotId,
      endpoint: `ws://${robotConfig.communication.endpoint}:${robotConfig.communication.port}`,
    };

    this.connections.set(robotId, connection);
    console.log(`✅ WebSocket robot ${robotId} connected`);
    return connection;
  }

  async sendControlCommand(robotId, command) {
    const connection = this.connections.get(robotId);
    if (!connection) {
      throw new Error(`Robot ${robotId} not connected`);
    }

    try {
      switch (connection.type) {
        case "ros2":
          await this.sendROS2Command(connection, command);
          break;
        case "ros":
          await this.sendROSCommand(connection, command);
          break;
        case "mqtt":
          await this.sendMQTTCommand(connection, command);
          break;
        case "websocket":
          await this.sendWebSocketCommand(connection, command);
          break;
      }

      this.emit("commandSent", { robotId, command, timestamp: new Date() });
    } catch (error) {
      console.error(`Failed to send command to robot ${robotId}:`, error);
      throw error;
    }
  }

  async sendROS2Command(connection, command) {
    const controlPub = connection.publishers.get("control");
    if (!controlPub) {
      throw new Error("Control publisher not found");
    }

    // Convert gesture command to ROS2 Twist message
    const twistMsg = this.gestureToTwist(command);
    controlPub.publish(twistMsg);
  }

  async sendROSCommand(connection, command) {
    if (!ROSLIB) {
      throw new Error("ROSLIB not available");
    }

    const controlPub = connection.publishers.get("control");
    if (!controlPub) {
      throw new Error("Control publisher not found");
    }

    // Convert gesture command to ROS Twist message
    const twistMsg = new ROSLIB.default.Message(this.gestureToTwist(command));
    controlPub.publish(twistMsg);
  }

  async sendMQTTCommand(connection, command) {
    if (!this.mqttClient) {
      throw new Error("MQTT client not available");
    }

    const message = JSON.stringify({
      command,
      timestamp: new Date().toISOString(),
    });

    this.mqttClient.publish(connection.topics.control, message);
  }

  async sendWebSocketCommand(connection, command) {
    // WebSocket command sending implementation
    console.log(`Sending WebSocket command to ${connection.robotId}:`, command);
  }

  gestureToTwist(command) {
    const { gestureType, handPosition } = command;

    let linear = { x: 0, y: 0, z: 0 };
    let angular = { x: 0, y: 0, z: 0 };

    switch (gestureType) {
      case "open":
        // Move robot forward/backward based on hand Y position
        linear.x = (0.5 - handPosition.y) * 2; // -1 to 1
        // Turn robot based on hand X position
        angular.z = (handPosition.x - 0.5) * 2; // -1 to 1
        break;
      case "pinch":
        // Rotate in place
        angular.z = Math.sin(Date.now() / 1000) * 0.5;
        break;
      case "fist":
        // Stop robot
        linear = { x: 0, y: 0, z: 0 };
        angular = { x: 0, y: 0, z: 0 };
        break;
      case "point":
        // Move forward slowly
        linear.x = 0.3;
        break;
    }

    return {
      linear,
      angular,
    };
  }

  updateRobotStatus(robotId, statusData) {
    this.emit("robotStatusUpdate", { robotId, status: statusData });
  }

  updateRobotTelemetry(robotId, telemetryData) {
    this.emit("robotTelemetryUpdate", { robotId, telemetry: telemetryData });
  }

  updateRobotHeartbeat(robotId) {
    this.emit("robotHeartbeat", { robotId, timestamp: new Date() });
  }

  disconnectRobot(robotId) {
    const connection = this.connections.get(robotId);
    if (!connection) {
      return;
    }

    try {
      switch (connection.type) {
        case "ros":
          if (connection.ros) {
            connection.ros.close();
          }
          break;
        case "mqtt":
          if (this.mqttClient) {
            this.mqttClient.unsubscribe(`robots/${robotId}/+`);
          }
          break;
      }

      this.connections.delete(robotId);
      console.log(`🔌 Robot ${robotId} disconnected`);
    } catch (error) {
      console.error(`Error disconnecting robot ${robotId}:`, error);
    }
  }

  disconnect() {
    // Disconnect all robots
    for (const robotId of this.connections.keys()) {
      this.disconnectRobot(robotId);
    }

    // Shutdown ROS2 node
    if (this.rosNode) {
      this.rosNode.destroy();
    }

    // Disconnect MQTT client
    if (this.mqttClient) {
      this.mqttClient.end();
    }

    console.log("🔌 Robot communication manager disconnected");
  }

  getConnectionStatus(robotId) {
    const connection = this.connections.get(robotId);
    return {
      connected: !!connection,
      type: connection?.type,
      lastUpdate: new Date(),
    };
  }

  getAllConnectedRobots() {
    return Array.from(this.connections.keys());
  }
}
