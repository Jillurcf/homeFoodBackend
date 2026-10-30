
import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<typeof mongoose> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    console.log("⏳ Connecting to MongoDB...");

    connectionPromise = mongoose
      .connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then(() => {
        console.log("✅ MongoDB connected successfully!");
        console.log(`📦 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);

        return mongoose;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("❌ MongoDB connection failed:", error);
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
