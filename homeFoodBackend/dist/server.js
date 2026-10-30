"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const mongoose_1 = __importDefault(require("mongoose"));
const events_1 = require("./bootstrap/events");
const startServer = async () => {
    try {
        await mongoose_1.default.connect(env_1.env.MONGO_URI);
        console.log("MongoDB connected ✅");
        (0, events_1.registerEvents)();
        app_1.default.listen(env_1.env.PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
        });
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exitCode = 1;
    }
};
void startServer();
//# sourceMappingURL=server.js.map