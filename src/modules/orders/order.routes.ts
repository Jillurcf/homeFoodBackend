import { Router } from "express";
import * as orderController from "./order.controller";

const router = Router();

router.post("/", orderController.createOrder);

router.get("/my-orders", orderController.getMyOrders);

router.get("/:orderId", orderController.getOrderById);

router.patch("/:orderId/status", orderController.updateStatus);

export default router;