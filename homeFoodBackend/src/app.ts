import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import orderRoutes from "./modules/orders/order.routes";
import foodRoutes from "./modules/foods/food.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import foodMakerRoutes from "./modules/foodMakers/foodMaker.routes";
import adminRoutes from "./modules/admin/admin.routes";
import { registerEvents } from "./bootstrap/events";
const app = express();

// Middleware
app.use(cors());
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
