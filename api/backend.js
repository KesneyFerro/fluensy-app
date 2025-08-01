// Vercel serverless function wrapper for the Express backend
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Create Express app
const app = express();

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://*.vercel.app",
      /\.vercel\.app$/,
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection (with connection caching for serverless)
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    console.log("🔌 Connecting to MongoDB...");
    cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Connected to MongoDB");
    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// Import routes
const userRoutes = require("../backend/routes/users");

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Fluensy API is running on Vercel!",
    version: "1.0.0",
    endpoints: {
      users: "/api/backend/users",
      health: "/api/backend/health",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API Routes
app.use("/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

// Export the Express app as a serverless function
module.exports = async (req, res) => {
  // Connect to database before handling request
  await connectToDatabase();

  // Handle the request with Express
  return app(req, res);
};
