import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (_, res) => {
  res.json({ message: "HomeFood Backend is running 🚀" });
});

// MongoDB connection
mongoose.connect(env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("MongoDB connection error:", err));

export default app;
