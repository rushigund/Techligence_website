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
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import robotRoutes from "./routes/robots.js";
import urdfRoutes from "./routes/urdf.js";
import controlRoutes from "./routes/control.js";
import otpRoutes from "./routes/otp.js";
import paymentRoutes from "./routes/payment.js";

// Import sockets & robot comm
import { setupSocketHandlers } from "./sockets/index.js";
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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/robotech";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const robotCommManager = new RobotCommunicationManager();

// Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: () => NODE_ENV === "development",
}));

// Static uploads
app.use("/uploads", express.static("uploads"));

// Serve React app in production
if (NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../dist");
  app.use(express.static(buildPath));
}

// Demo mode
app.use((req, res, next) => {
  if (global.demoMode && req.path.startsWith("/api/")) req.demoMode = true;
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    demoMode: !!global.demoMode,
    mongodb: !global.demoMode ? "connected" : "unavailable",
  });
});

// Debug
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Debug endpoint",
    timestamp: new Date().toISOString(),
    headers: req.headers,
    ip: req.ip,
    method: req.method,
    path: req.path,
  });
});

// Root (development info)
app.get("/", (req, res) => {
  if (NODE_ENV !== "production") {
    res.json({
      message: "RoboTech Backend API",
      environment: NODE_ENV,
      frontend: CLIENT_URL,
      api: {
        health: "/api/health",
        auth: "/api/auth",
        robots: "/api/robots",
        control: "/api/control",
        urdf: "/api/urdf",
        career: "/api/career",
        contact: "/api/contact",
        payment: "/api/payment",
        otp: "/api/otp",
      },
    });
  } else {
    res.redirect("/");
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/blogposts", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/robots", robotRoutes);
app.use("/api/urdf", urdfRoutes);
app.use("/api/control", controlRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/payment", paymentRoutes);

// Fallback API 404
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// SPA Fallback
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }

  if (NODE_ENV !== "production") {
    const redirectUrl = `${CLIENT_URL}${req.path}`;
    return res.redirect(redirectUrl);
  }

  const buildPath = path.join(__dirname, "../dist");
  res.sendFile(path.join(buildPath, "index.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large. Max: 50MB." });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

// MongoDB connection & server start
const connectWithTimeout = () => Promise.race([
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 }),
  new Promise((_, reject) => setTimeout(() => reject(new Error("MongoDB connection timeout")), 5000)),
]);

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Client URL: ${CLIENT_URL}`);
    console.log(`📡 Socket.IO ready`);
    robotCommManager.initialize()
      .then(() => console.log("🤖 Robot communication initialized"))
      .catch(err => console.error("❌ Robot communication failed:", err));
  });

  setupSocketHandlers(io, robotCommManager);
};

connectWithTimeout()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    startServer();
  })
  .catch(err => {
    console.warn("⚠️ MongoDB failed:", err.message);
    console.log("🔄 Starting in demo mode...");
    global.demoMode = true;
    startServer();
  });

// Graceful shutdown
const shutdown = () => {
  console.log("🛑 Shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close();
    robotCommManager.disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export { io, robotCommManager };
