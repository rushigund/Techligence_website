#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Building RoboTech for production demo...");

// Set environment variables for demo build
process.env.VITE_DEMO_MODE = "true";
process.env.NODE_ENV = "production";

try {
  // Clean previous build
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
    console.log("🧹 Cleaned previous build");
  }

  // Build with reduced memory usage
  console.log("📦 Building application...");
  execSync("npm run build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: "--max-old-space-size=4096",
    },
  });

  // Create demo configuration
  const demoConfig = {
    name: "RoboTech Demo",
    version: "1.0.0",
    description: "Advanced Robotics Control Platform - Demo Version",
    demo: true,
    features: [
      "Hand Gesture Recognition",
      "3D Robot Visualization",
      "URDF Model Loading",
      "E-commerce Shopping Cart",
      "Real-time Control Interface",
    ],
    buildDate: new Date().toISOString(),
  };

  // Write demo config to dist folder
  fs.writeFileSync(
    path.join("dist", "demo-config.json"),
    JSON.stringify(demoConfig, null, 2),
  );

  console.log("✅ Build completed successfully!");
  console.log("📁 Demo files are in the 'dist' folder");
  console.log("🌐 Deploy the 'dist' folder to any static hosting service");
  console.log("");
  console.log("🎯 Demo Features:");
  demoConfig.features.forEach((feature) => {
    console.log(`   • ${feature}`);
  });
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
