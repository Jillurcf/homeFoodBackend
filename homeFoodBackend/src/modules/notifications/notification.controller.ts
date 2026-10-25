import { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../auth/auth.middleware";
import * as notificationService from "./notification.service";
import { listNotificationsQuerySchema } from "./notification.validation";

const handleError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues,
    });
  }

  const err = error as { status?: number; message?: string };
  return res.status(err.status ?? 500).json({
    success: false,
    message: err.message ?? "Internal server error",
  });
};

const getUserId = (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (!user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }
  return user.id;
};

const respond = async (
  res: Response,
  action: () => Promise<unknown> | unknown
) => {
  try {
    const data = await action();
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listNotifications = async (req: Request, res: Response) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  return respond(res, () => {
    const query = listNotificationsQuerySchema.parse(req.query);
    return notificationService.listNotifications(userId, query);
  });
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  return respond(res, async () => ({
    unreadCount: await notificationService.getUnreadCount(userId),
  }));
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  return respond(res, () =>
    notificationService.markNotificationRead(req.params.id, userId)
  );
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  return respond(res, async () => ({
    modifiedCount:
      await notificationService.markAllNotificationsRead(userId),
  }));
};
