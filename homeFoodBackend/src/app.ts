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

app.use(async (_req, _res, next) => {
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

// Middleware
const allowedOrigins = [
  "https://www.gharerkhabar.net",
  "https://gharerkhabar.net",
  "http://localhost:8081",
  "http://localhost:19006",
];

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



app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
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
