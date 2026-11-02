"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const order_routes_1 = __importDefault(require("./modules/orders/order.routes"));
const food_routes_1 = __importDefault(require("./modules/foods/food.routes"));
const review_routes_1 = __importDefault(require("./modules/reviews/review.routes"));
const foodMaker_routes_1 = __importDefault(require("./modules/foodMakers/foodMaker.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const db_1 = __importDefault(require("./config/db"));
const events_1 = require("./bootstrap/events");
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
let eventsRegistered = false;
// CORS must run before the DB middleware so preflight (OPTIONS) requests
// never wait on a MongoDB connection and never fail because of it.
const allowedOriginPatterns = [
    /^https:\/\/(www\.)?gharerkhabar\.net$/,
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
            callback(null, true);
        }
        else {
            // Returning false (instead of an Error) omits CORS headers without a 500.
            console.warn(`Blocked CORS origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
}));
app.use(async (_req, _res, next) => {
    if (process.env.NODE_ENV === "test") {
        return next();
    }
    try {
        await (0, db_1.default)();
        if (!eventsRegistered) {
            (0, events_1.registerEvents)();
            eventsRegistered = true;
        }
        next();
    }
    catch (error) {
        console.error("Database connection failed:", error);
        next(error);
    }
});
// health check 
app.get("/health", (_req, res) => {
    const dbConnected = mongoose_1.default.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
        success: dbConnected,
        message: dbConnected
            ? "HomeFood API and MongoDB are connected"
            : "HomeFood API is running, but MongoDB is disconnected",
        database: {
            connected: dbConnected,
            state: mongoose_1.default.connection.readyState,
        },
        timestamp: new Date().toISOString(),
    });
});
app.use(express_1.default.json({ limit: "4mb" }));
// Static food images (served for imageUrl values like /images/HilishaFish.jpg)
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "..", "assets", "images", "HomeFoodImg")));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/foods", food_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/shops", foodMaker_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
// Root route
app.get("/", (_, res) => {
    res.json({ message: "HomeFood Backend is running 🚀" });
});
exports.default = app;
//# sourceMappingURL=app.js.map