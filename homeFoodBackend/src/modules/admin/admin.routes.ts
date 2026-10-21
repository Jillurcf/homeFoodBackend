import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../../middlewares/requireRole";
import * as adminController from "./admin.controller";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/stats", adminController.getStats);
router.get("/users", adminController.listUsers);
router.patch("/users/:id", adminController.updateUserRole);
router.get("/shops", adminController.listShops);
router.patch("/shops/:id/verify", adminController.verifyShop);
router.get("/foods", adminController.listFoods);
router.patch("/foods/:id", adminController.updateFood);
router.delete("/foods/:id", adminController.deleteFood);
router.get("/orders", adminController.listOrders);
router.patch("/orders/:id/status", adminController.updateOrderStatus);

export default router;
