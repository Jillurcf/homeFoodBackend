import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import orderRoutes from "./modules/orders/order.routes";
import { registerEvents } from "./bootstrap/events";
const app = express();

// Middleware
app.use(cors());
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
