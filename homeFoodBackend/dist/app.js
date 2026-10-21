"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const order_routes_1 = __importDefault(require("./modules/orders/order.routes"));
const food_routes_1 = __importDefault(require("./modules/foods/food.routes"));
const review_routes_1 = __importDefault(require("./modules/reviews/review.routes"));
const foodMaker_routes_1 = __importDefault(require("./modules/foodMakers/foodMaker.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const events_1 = require("./bootstrap/events");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Static food images (served for imageUrl values like /images/HilishaFish.jpg)
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "..", "assets", "images", "HomeFoodImg")));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/foods", food_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/shops", foodMaker_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
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