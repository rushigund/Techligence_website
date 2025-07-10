import mongoose from "mongoose";

const robotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["4wd", "humanoid", "arm", "drone", "custom"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "exploration",
        "industrial",
        "surveillance",
        "research",
        "education",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "maintenance", "error", "charging"],
      default: "offline",
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      facility: String,
    },
    specifications: {
      maxSpeed: Number, // m/s
      payload: Number, // kg
      batteryLife: Number, // hours
      range: Number, // meters
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        weight: Number,
      },
      sensors: [
        {
          type: {
            type: String,
            enum: [
              "camera",
              "lidar",
              "ultrasonic",
              "imu",
              "gps",
              "temperature",
            ],
          },
          model: String,
          position: String,
        },
      ],
    },
    communication: {
      protocol: {
        type: String,
        enum: ["ros", "ros2", "mqtt", "websocket", "tcp", "udp"],
        default: "ros2",
      },
      endpoint: String, // IP address or domain
      port: Number,
      topics: {
        control: String,
        status: String,
        sensors: String,
        diagnostics: String,
      },
      lastHeartbeat: Date,
      connectionQuality: {
        type: String,
        enum: ["excellent", "good", "fair", "poor", "disconnected"],
        default: "disconnected",
      },
    },
    currentSession: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      startedAt: Date,
      controlMode: {
        type: String,
        enum: ["manual", "gesture", "autonomous", "programming"],
      },
      urdfFile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "URDFFile",
      },
    },
    telemetry: {
      battery: {
        level: Number, // 0-100
        voltage: Number,
        temperature: Number,
        chargingStatus: {
          type: String,
          enum: ["charging", "discharging", "full", "critical"],
        },
      },
      position: {
        x: Number,
        y: Number,
        z: Number,
        orientation: {
          roll: Number,
          pitch: Number,
          yaw: Number,
        },
      },
      sensors: {
        temperature: Number,
        humidity: Number,
        pressure: Number,
      },
      motors: [
        {
          id: String,
          speed: Number,
          torque: Number,
          temperature: Number,
          errorMessages: [String],
        },
      ],
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    maintenance: {
      lastService: Date,
      nextService: Date,
      serviceHours: {
        type: Number,
        default: 0,
      },
      issues: [
        {
          description: String,
          severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
          },
          reportedAt: {
            type: Date,
            default: Date.now,
          },
          resolvedAt: Date,
          status: {
            type: String,
            enum: ["open", "in-progress", "resolved"],
            default: "open",
          },
        },
      ],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessPermissions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        level: {
          type: String,
          enum: ["view", "control", "admin"],
          default: "view",
        },
        grantedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        grantedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for uptime calculation
robotSchema.virtual("uptime").get(function () {
  if (this.currentSession && this.currentSession.startedAt) {
    return Date.now() - this.currentSession.startedAt.getTime();
  }
  return 0;
});

// Method to check if robot is available for control
robotSchema.methods.isAvailable = function () {
  return (
    this.status === "online" &&
    this.isActive &&
    (!this.currentSession || !this.currentSession.userId)
  );
};

// Method to get robot health score
robotSchema.methods.getHealthScore = function () {
  let score = 100;

  // Battery health
  if (this.telemetry.battery.level < 20) score -= 30;
  else if (this.telemetry.battery.level < 50) score -= 15;

  // Connection quality
  switch (this.communication.connectionQuality) {
    case "poor":
      score -= 20;
      break;
    case "fair":
      score -= 10;
      break;
    case "disconnected":
      score -= 50;
      break;
  }

  // Open maintenance issues
  const criticalIssues = this.maintenance.issues.filter(
    (issue) => issue.status !== "resolved" && issue.severity === "critical",
  );
  score -= criticalIssues.length * 25;

  const highIssues = this.maintenance.issues.filter(
    (issue) => issue.status !== "resolved" && issue.severity === "high",
  );
  score -= highIssues.length * 15;

  return Math.max(0, score);
};

// Indexes for efficient queries (serialNumber index is created by unique: true)
robotSchema.index({ status: 1 });
robotSchema.index({ type: 1, category: 1 });
robotSchema.index({ owner: 1 });
robotSchema.index({ "currentSession.userId": 1 });
robotSchema.index({ "communication.lastHeartbeat": 1 });

export default mongoose.model("Robot", robotSchema);
