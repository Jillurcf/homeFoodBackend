import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import orderRoutes from "./modules/orders/order.routes";
import foodRoutes from "./modules/foods/food.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import foodMakerRoutes from "./modules/foodMakers/foodMaker.routes";
import adminRoutes from "./modules/admin/admin.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static food images (served for imageUrl values like /images/HilishaFish.jpg)
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "assets", "images", "HomeFoodImg"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/shops", foodMakerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Root route
app.get("/", (_, res) => {
  res.json({ message: "HomeFood Backend is running 🚀" });
});

export default app;
