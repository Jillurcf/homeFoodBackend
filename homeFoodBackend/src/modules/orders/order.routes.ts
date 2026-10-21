import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../../middlewares/requireRole";

const router = Router();

router.post("/", authenticate, orderController.createOrder);

router.get(
  "/my-orders",
  authenticate,
  requireRole("buyer"),
  orderController.getMyOrders
);

router.get(
  "/seller-orders",
  authenticate,
  requireRole("seller", "admin"),
  orderController.getSellerOrders
);

router.get("/:orderId", authenticate, orderController.getOrderById);

router.patch(
  "/:orderId/status",
  authenticate,
  requireRole("seller", "admin"),
  orderController.updateStatus
);

export default router;