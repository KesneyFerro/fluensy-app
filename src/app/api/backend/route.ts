// Next.js App Router API Route
import { NextRequest, NextResponse } from "next/server";

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Create Express app
const app = express();

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
let cachedConnection: any = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    console.log("🔌 Connecting to MongoDB...");
    cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
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
const userRoutes = require("../../../../backend/routes/users");

// Routes
app.get("/", (req: any, res: any) => {
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
app.get("/health", (req: any, res: any) => {
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
app.use((err: any, req: any, res: any, next: any) => {
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
app.use((req: any, res: any) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Handler function for Next.js App Router
async function handler(req: NextRequest) {
  try {
    // Connect to database before handling request
    await connectToDatabase();

    // Convert Next.js request to Express-compatible format
    const { pathname, searchParams } = new URL(req.url);
    const path = pathname.replace("/api/backend", "") || "/";

    return new Promise((resolve) => {
      const mockReq = {
        method: req.method,
        url:
          path + (searchParams.toString() ? "?" + searchParams.toString() : ""),
        headers: Object.fromEntries(req.headers.entries()),
        body: req.body,
      };

      const mockRes = {
        status: (code: number) => ({
          json: (data: any) =>
            resolve(NextResponse.json(data, { status: code })),
        }),
        json: (data: any) => resolve(NextResponse.json(data)),
        send: (data: any) => resolve(new NextResponse(data)),
      };

      app(mockReq, mockRes);
    });
  } catch (error: any) {
    console.error("Serverless function error:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
