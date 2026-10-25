import app from "./app";
import { env } from "./config/env";
import mongoose from "mongoose";
import { registerEvents } from "./bootstrap/events";

const startServer = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected ✅");
    registerEvents();

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exitCode = 1;
  }
};

void startServer();
