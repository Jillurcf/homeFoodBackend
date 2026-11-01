"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let connectionPromise = null;
const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        throw new Error("MONGO_URI is missing from environment variables");
    }
    if (mongoose_1.default.connection.readyState === 1) {
        return mongoose_1.default;
    }
    if (!connectionPromise) {
        console.log("⏳ Connecting to MongoDB...");
        connectionPromise = mongoose_1.default
            .connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        })
            .then(() => {
            console.log("✅ MongoDB connected successfully!");
            console.log(`📦 Database: ${mongoose_1.default.connection.name}`);
            console.log(`🌐 Host: ${mongoose_1.default.connection.host}`);
            return mongoose_1.default;
        })
            .catch((error) => {
            connectionPromise = null;
            console.error("❌ MongoDB connection failed:", error);
            throw error;
        });
    }
    return connectionPromise;
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map