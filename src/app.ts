import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import orderRoutes from "./modules/orders/order.routes";
import { registerEvents } from "./bootstrap/events";
const app = express();

// Middleware
const allowedOrigins = [
  "https://www.gharerkhabar.net",
  "https://gharerkhabar.net",
  "http://localhost:8081",
  "http://localhost:19006",
];

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (_, res) => {
  res.json({ message: "HomeFood Backend is running 🚀" });
});

// MongoDB connection
// mongoose.connect(env.MONGO_URI)
//   .then(() => console.log("MongoDB connected ✅"))
//   .catch(err => console.error("MongoDB connection error:", err));

mongoose.connect(env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");

    // 👇 IMPORTANT: register events after DB connection
    registerEvents();
  })
  .catch(err => console.error("MongoDB connection error:", err));


export default app;
