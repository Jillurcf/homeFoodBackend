"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const order_routes_1 = __importDefault(require("./modules/orders/order.routes"));
const events_1 = require("./bootstrap/events");
const app = (0, express_1.default)();
// Middleware
const allowedOrigins = [
    "https://www.gharerkhabar.net",
    "https://gharerkhabar.net",
    "http://localhost:8081",
    "http://localhost:19006",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/orders", order_routes_1.default);
// Root route
app.get("/", (_, res) => {
    res.json({ message: "HomeFood Backend is running 🚀" });
});
// MongoDB connection
// mongoose.connect(env.MONGO_URI)
//   .then(() => console.log("MongoDB connected ✅"))
//   .catch(err => console.error("MongoDB connection error:", err));
mongoose_1.default.connect(env_1.env.MONGO_URI)
    .then(() => {
    console.log("MongoDB connected ✅");
    // 👇 IMPORTANT: register events after DB connection
    (0, events_1.registerEvents)();
})
    .catch(err => console.error("MongoDB connection error:", err));
exports.default = app;
//# sourceMappingURL=app.js.map