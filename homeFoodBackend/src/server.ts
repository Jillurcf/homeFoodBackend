
import app from "./app";
import { env } from "./config/env";
import connectDB from "./config/db";
import { registerEvents } from "./bootstrap/events";

const startServer = async () => {
  try {
    console.log("🚀 Starting HomeFood backend...");

    await connectDB();

    registerEvents();

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(
        `✅ Server running at http://localhost:${env.PORT}`
      );
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

void startServer();
