import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import robotRoutes from "./routes/robots.js";
import urdfRoutes from "./routes/urdf.js";
import controlRoutes from "./routes/control.js";

// Import socket handlers
import { setupSocketHandlers } from "./sockets/index.js";

// Import robot communication
import { RobotCommunicationManager } from "./services/robotComm.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/robotech";

// Security middleware - relaxed for development
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginResourcePolicy: false,
  }),
);

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV === "development";
  },
});

app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true,
  }),
);

// General middleware
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving for uploaded URDF files
app.use("/uploads", express.static("uploads"));

// Serve static files from the React app (for production)
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In development, we don't need to serve static files (Vite handles it)
// In production, serve the built React app
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../dist");
  app.use(express.static(buildPath));
}

// Demo mode middleware
app.use((req, res, next) => {
  if (global.demoMode && req.path.startsWith("/api/")) {
    // For demo mode, provide mock responses for API calls
    req.demoMode = true;
  }
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    demoMode: !!global.demoMode,
    mongodb: !global.demoMode ? "connected" : "unavailable",
  });
});

// Root path handler for development
app.get("/", (req, res) => {
  console.log("🏠 Root path accessed");
  if (process.env.NODE_ENV !== "production") {
    res.json({
      message: "RoboTech Backend API",
      status: "running",
      environment: "development",
      frontend: process.env.CLIENT_URL || "http://localhost:8080",
      api: {
        health: "/health",
        auth: "/api/auth",
        robots: "/api/robots",
        control: "/api/control",
        urdf: "/api/urdf",
        career: "/api/career",
        contact: "/api/contact",
      },
    });
  } else {
    // In production, this will be handled by the SPA fallback
    res.redirect("/");
  }
});

// Debug route to test 403 issues
app.get("/debug", (req, res) => {
  console.log("🐛 Debug route accessed");
  res.json({
    message: "Debug endpoint working",
    timestamp: new Date().toISOString(),
    headers: req.headers,
    ip: req.ip,
    method: req.method,
    path: req.path,
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/robots", robotRoutes);
app.use("/api/urdf", urdfRoutes);
app.use("/api/control", controlRoutes);
app.use("/api/career", require("./routes/career"));
app.use("/api/contact", require("./routes/contact"));

// Initialize robot communication manager
const robotCommManager = new RobotCommunicationManager();

// Setup Socket.IO handlers
setupSocketHandlers(io, robotCommManager);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 50MB.",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// SPA fallback route - serve React app for all non-API routes
app.get("*", (req, res) => {
  console.log(`📍 Route requested: ${req.method} ${req.path}`);
  console.log(`🔍 Headers:`, req.headers);

  // Don't interfere with API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    console.log(`❌ API route not found: ${req.path}`);
    return res.status(404).json({
      success: false,
      message: "API route not found",
    });
  }

  // In development, redirect to Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}${req.path}`;
    console.log(`🔄 Redirecting to frontend: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  }

  // In production, serve the React app
  const buildPath = path.join(__dirname, "../dist");
  console.log(`📁 Serving React app from: ${buildPath}`);
  res.sendFile(path.join(buildPath, "index.html"));
});

// Connect to MongoDB with fallback to demo mode
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
      `🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
    );
    console.log(`📡 Socket.IO ready for real-time communication`);

    // Initialize robot communication
    robotCommManager
      .initialize()
      .then(() => console.log("🤖 Robot communication initialized"))
      .catch((err) => console.error("❌ Robot communication failed:", err));
  });
};

// Connect to MongoDB with timeout
const connectWithTimeout = async () => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("MongoDB connection timeout")), 5000),
  );

  const connection = mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  return Promise.race([connection, timeout]);
};

connectWithTimeout()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    startServer();
  })
  .catch((err) => {
    console.warn("⚠️  MongoDB connection failed:", err.message);
    console.log("🔄 Starting in demo mode without database...");

    // Mock mongoose connection for demo mode
    global.demoMode = true;
    startServer();
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close();
    robotCommManager.disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close();
    robotCommManager.disconnect();
    process.exit(0);
  });
});

export { io, robotCommManager };
