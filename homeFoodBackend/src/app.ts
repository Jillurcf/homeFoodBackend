import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import orderRoutes from "./modules/orders/order.routes";
import foodRoutes from "./modules/foods/food.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import foodMakerRoutes from "./modules/foodMakers/foodMaker.routes";
import adminRoutes from "./modules/admin/admin.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import  connectDB  from "./config/db";
import { registerEvents } from "./bootstrap/events";
import mongoose from "mongoose";
const app = express();

let eventsRegistered = false;

// CORS must run before the DB middleware so preflight (OPTIONS) requests
// never wait on a MongoDB connection and never fail because of it.
const allowedOriginPatterns = [
  /^https:\/\/(www\.)?gharerkhabar\.net$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        // Returning false (instead of an Error) omits CORS headers without a 500.
        console.warn(`Blocked CORS origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.use(async (_req, _res, next) => {
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  try {
    await connectDB();

    if (!eventsRegistered) {
      registerEvents();
      eventsRegistered = true;
    }

    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    next(error);
  }
});

// health check 

app.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected
      ? "HomeFood API and MongoDB are connected"
      : "HomeFood API is running, but MongoDB is disconnected",
    database: {
      connected: dbConnected,
      state: mongoose.connection.readyState,
    },
    timestamp: new Date().toISOString(),
  });
});



app.use(express.json());

// Static food images (served for imageUrl values like /images/HilishaFish.jpg)
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "assets", "images", "HomeFoodImg"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/shops", foodMakerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Root route
app.get("/", (_, res) => {
  res.json({ message: "HomeFood Backend is running 🚀" });
});

export default app;
