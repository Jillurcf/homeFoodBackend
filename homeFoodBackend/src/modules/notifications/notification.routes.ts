import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import * as notificationController from "./notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", notificationController.listNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.patch("/:id/read", notificationController.markNotificationRead);

export default router;
