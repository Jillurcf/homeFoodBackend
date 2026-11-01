"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = __importDefault(require("./config/db"));
const events_1 = require("./bootstrap/events");
const startServer = async () => {
    try {
        console.log("🚀 Starting HomeFood backend...");
        await (0, db_1.default)();
        (0, events_1.registerEvents)();
        app_1.default.listen(env_1.env.PORT, "0.0.0.0", () => {
            console.log(`✅ Server running at http://localhost:${env_1.env.PORT}`);
            console.log(`🌍 Environment: ${env_1.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};
void startServer();
//# sourceMappingURL=server.js.map