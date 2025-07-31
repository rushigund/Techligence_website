// server.js (or app.js)

import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import Pinecone service functions
import { initializePinecone, ensurePineconeIndex } from './services/pineconeService.js'; // Adjust path as needed

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import adminIngestionRoutes from "./routes/adminIngestionRoutes.js"; // NEW: Import admin ingestion routes
import otpRoutes from "./routes/otp.js";
import paymentRoutes from "./routes/payment.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5050;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/techligence";

// Security middleware - relaxed for development
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => {
    return process.env.NODE_ENV === "development";
  },
});

app.use(limiter);

// CORS configuration
app.use(
  cors({
    //origin: process.env.VITE_API_URL || "http://localhost:8080",
    origin:["https://techligence-website.vercel.app", 
      "http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// General middleware
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../dist");
  app.use(express.static(buildPath));
}

// Demo mode middleware
app.use((req, res, next) => {
  if (global.demoMode && req.path.startsWith("/api/")) {
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
      message: "Techligence Backend API",
      status: "running",
      environment: "development",
      frontend: process.env.CLIENT_URL || "http://localhost:8080",
      api: {
        health: "/health",
        auth: "/api/auth",
        products: "/api/products",
        blog: "/api/blogposts",
        chatbot: "/api/chatbot", // NEW: Added chatbot API info
        adminIngestion: "/api/admin/ingest-content", // NEW: Added admin ingestion API info
        payment: "/api/payment",
        otp: "/api/otp",
      },
    });
  } else {
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
app.use("/api", productRoutes);
app.use("/api", blogRoutes);
app.use("/api", contactRoutes);
app.use("/api", careerRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminIngestionRoutes); // NEW: Register admin ingestion routes
app.use("/api/otp", otpRoutes);
app.use("/api/payment", paymentRoutes);


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

  if (req.path.startsWith("/api/")) {
    console.log(`❌ API route not found: ${req.path}`);
    return res.status(404).json({
      success: false,
      message: "API route not found",
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}${req.path}`;
    console.log(`🔄 Redirecting to frontend: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  }

  const buildPath = path.join(__dirname, "../dist");
  console.log(`📁 Serving React app from: ${buildPath}`);
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start server function
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
      `🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
    );
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
  .then(async () => { // Made the callback async to use await
    console.log("✅ Connected to MongoDB");
    // Initialize Pinecone Client and Ensure Index Exists AFTER MongoDB connection
    // The dimension (768) should match the embedding model you are using (e.g., Nomic Embed)
    try {
      await initializePinecone(); // Initialize the Pinecone client
      await ensurePineconeIndex(768); // Ensure your Pinecone index exists with the correct dimension
      console.log("✅ Pinecone client and index ready.");
    } catch (pineconeError) {
      console.error("❌ Failed to initialize Pinecone or ensure index:", pineconeError);
      console.warn("⚠️  Pinecone functionality may be limited or unavailable.");
      // Do NOT exit process here, allow server to start even if Pinecone fails
    }
    startServer();
  })
  .catch((err) => {
    console.warn("⚠️  MongoDB connection failed:", err.message);
    console.log("🔄 Starting in demo mode without database...");

    global.demoMode = true;
    startServer();
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
