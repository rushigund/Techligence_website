import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Robot from "../models/Robot.js";
import URDFFile from "../models/URDFFile.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/robotech";

const seedData = {
  users: [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john@robotech.com",
      password: "Password123",
      role: "admin",
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@robotech.com",
      password: "Password123",
      role: "engineer",
    },
    {
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@robotech.com",
      password: "Password123",
      role: "user",
    },
  ],
  robots: [
    {
      name: "Explorer-01",
      model: "RoboTech Explorer Pro",
      serialNumber: "EXP-001-2024",
      type: "4wd",
      category: "exploration",
      status: "online",
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA",
        facility: "Research Lab A",
      },
      specifications: {
        maxSpeed: 5,
        payload: 15,
        batteryLife: 12,
        range: 10000,
        dimensions: {
          length: 2.0,
          width: 1.5,
          height: 1.0,
          weight: 85,
        },
        sensors: [
          {
            type: "camera",
            model: "HD-4K-360",
            position: "front",
          },
          {
            type: "lidar",
            model: "VLP-16",
            position: "top",
          },
          {
            type: "imu",
            model: "MPU-9250",
            position: "center",
          },
        ],
      },
      communication: {
        protocol: "ros2",
        endpoint: "192.168.1.100",
        port: 11311,
        topics: {
          control: "/explorer01/cmd_vel",
          status: "/explorer01/status",
          sensors: "/explorer01/sensors",
          diagnostics: "/explorer01/diagnostics",
        },
        lastHeartbeat: new Date(),
        connectionQuality: "excellent",
      },
      telemetry: {
        battery: {
          level: 85,
          voltage: 12.6,
          temperature: 25,
          chargingStatus: "discharging",
        },
        position: {
          x: 0,
          y: 0,
          z: 0,
          orientation: {
            roll: 0,
            pitch: 0,
            yaw: 0,
          },
        },
        sensors: {
          temperature: 22,
          humidity: 45,
          pressure: 1013.25,
        },
        lastUpdated: new Date(),
      },
    },
    {
      name: "Industrial-X1",
      model: "Industrial Titan X1",
      serialNumber: "ITX-001-2024",
      type: "4wd",
      category: "industrial",
      status: "offline",
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        address: "New York, NY",
        facility: "Manufacturing Plant B",
      },
      specifications: {
        maxSpeed: 3,
        payload: 50,
        batteryLife: 24,
        range: 5000,
        dimensions: {
          length: 3.0,
          width: 2.0,
          height: 1.5,
          weight: 250,
        },
        sensors: [
          {
            type: "camera",
            model: "Industrial-HD",
            position: "front",
          },
          {
            type: "ultrasonic",
            model: "HC-SR04",
            position: "all-around",
          },
        ],
      },
      communication: {
        protocol: "mqtt",
        endpoint: "192.168.1.101",
        port: 1883,
        topics: {
          control: "robots/industrial_x1/control",
          status: "robots/industrial_x1/status",
          sensors: "robots/industrial_x1/sensors",
          diagnostics: "robots/industrial_x1/diagnostics",
        },
        connectionQuality: "disconnected",
      },
      telemetry: {
        battery: {
          level: 100,
          voltage: 24.0,
          temperature: 20,
          chargingStatus: "full",
        },
        position: {
          x: 0,
          y: 0,
          z: 0,
          orientation: {
            roll: 0,
            pitch: 0,
            yaw: 0,
          },
        },
        lastUpdated: new Date(Date.now() - 3600000), // 1 hour ago
      },
    },
    {
      name: "Scout-Alpha",
      model: "Swift Scout V2",
      serialNumber: "SSV-002-2024",
      type: "4wd",
      category: "surveillance",
      status: "maintenance",
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        address: "Los Angeles, CA",
        facility: "Security Center",
      },
      specifications: {
        maxSpeed: 8,
        payload: 5,
        batteryLife: 8,
        range: 5000,
        dimensions: {
          length: 1.5,
          width: 1.0,
          height: 0.8,
          weight: 45,
        },
        sensors: [
          {
            type: "camera",
            model: "4K-Night-Vision",
            position: "front",
          },
          {
            type: "camera",
            model: "360-Security",
            position: "top",
          },
        ],
      },
      communication: {
        protocol: "websocket",
        endpoint: "192.168.1.102",
        port: 8080,
        connectionQuality: "disconnected",
      },
      maintenance: {
        lastService: new Date(Date.now() - 86400000 * 7), // 1 week ago
        nextService: new Date(Date.now() + 86400000 * 23), // in 23 days
        serviceHours: 245,
        issues: [
          {
            description: "Camera module needs calibration",
            severity: "medium",
            reportedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
            status: "in-progress",
          },
        ],
      },
    },
  ],
  urdfFiles: [
    {
      name: "Explorer Pro 4WD",
      originalName: "explorer_pro_4wd.urdf",
      description:
        "URDF model for RoboTech Explorer Pro with detailed 4WD configuration",
      filePath: "samples/explorer_pro_4wd.urdf",
      fileSize: 4567,
      mimeType: "application/xml",
      checksum:
        "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
      robotType: "4wd",
      category: "sample",
      structure: {
        robotName: "explorer_pro",
        links: [
          {
            name: "base_link",
            visual: {
              geometry: {
                type: "box",
                dimensions: { size: [2.0, 1.0, 2.0] },
              },
              material: {
                name: "blue",
                color: { r: 0.149, g: 0.392, b: 0.922, a: 1 },
              },
              origin: { xyz: [0, 0, 0], rpy: [0, 0, 0] },
            },
          },
        ],
        joints: [],
        materials: [
          {
            name: "blue",
            color: { rgba: [0.149, 0.392, 0.922, 1] },
          },
        ],
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        linkCount: 5,
        jointCount: 4,
        materialCount: 3,
      },
      visibility: "public",
      tags: ["4wd", "exploration", "sample", "robotech"],
      isTemplate: true,
    },
    {
      name: "Humanoid Basic",
      originalName: "humanoid_basic.urdf",
      description: "Basic humanoid robot model for research applications",
      filePath: "samples/humanoid_basic.urdf",
      fileSize: 6789,
      mimeType: "application/xml",
      checksum:
        "b2c3d4e5f6789012345678901234567890123456789012345678901234567890ab",
      robotType: "humanoid",
      category: "sample",
      structure: {
        robotName: "humanoid_basic",
        links: [
          {
            name: "torso",
            visual: {
              geometry: {
                type: "box",
                dimensions: { size: [0.5, 1.0, 0.3] },
              },
              material: {
                name: "skin",
                color: { r: 0.988, g: 0.863, b: 0.745, a: 1 },
              },
              origin: { xyz: [0, 0, 0], rpy: [0, 0, 0] },
            },
          },
        ],
        joints: [],
        materials: [
          {
            name: "skin",
            color: { rgba: [0.988, 0.863, 0.745, 1] },
          },
        ],
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        linkCount: 8,
        jointCount: 7,
        materialCount: 2,
      },
      visibility: "public",
      tags: ["humanoid", "research", "sample", "basic"],
      isTemplate: true,
    },
  ],
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Robot.deleteMany({});
    await URDFFile.deleteMany({});

    // Create users
    console.log("👤 Creating users...");
    const createdUsers = await User.create(seedData.users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create URDF files
    console.log("📁 Creating URDF files...");
    const urdfFilesWithOwners = seedData.urdfFiles.map((urdf, index) => ({
      ...urdf,
      owner: createdUsers[index % createdUsers.length]._id,
    }));
    const createdURDFFiles = await URDFFile.create(urdfFilesWithOwners);
    console.log(`✅ Created ${createdURDFFiles.length} URDF files`);

    // Create robots
    console.log("🤖 Creating robots...");
    const robotsWithOwners = seedData.robots.map((robot, index) => ({
      ...robot,
      owner: createdUsers[index % createdUsers.length]._id,
    }));
    const createdRobots = await Robot.create(robotsWithOwners);
    console.log(`✅ Created ${createdRobots.length} robots`);

    // Update user relationships
    console.log("🔗 Setting up relationships...");
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];

      // Add URDF files to users
      const userURDFFiles = createdURDFFiles.filter(
        (urdf) => urdf.owner.toString() === user._id.toString(),
      );
      user.urdfFiles = userURDFFiles.map((urdf) => urdf._id);

      // Add robot access
      const userRobots = createdRobots.filter(
        (robot) => robot.owner.toString() === user._id.toString(),
      );
      user.robotAccess = userRobots.map((robot) => ({
        robotId: robot._id,
        accessLevel: "admin",
      }));

      await user.save();
    }

    // Add sample robot access permissions
    if (createdRobots.length > 0 && createdUsers.length > 1) {
      const firstRobot = createdRobots[0];
      firstRobot.accessPermissions.push({
        userId: createdUsers[1]._id,
        level: "control",
        grantedBy: createdUsers[0]._id,
      });
      await firstRobot.save();

      // Update user's robot access
      createdUsers[1].robotAccess.push({
        robotId: firstRobot._id,
        accessLevel: "control",
      });
      await createdUsers[1].save();
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👤 Users: ${createdUsers.length}`);
    console.log(`   🤖 Robots: ${createdRobots.length}`);
    console.log(`   📁 URDF Files: ${createdURDFFiles.length}`);
    console.log("\n🔑 Test Accounts:");
    createdUsers.forEach((user) => {
      console.log(`   📧 ${user.email} (${user.role})`);
      console.log(`   🔒 Password: Password123`);
    });

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
