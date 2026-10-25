import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../../config/env";
import * as notificationService from "../notification.service";
import notificationRoutes from "../notification.routes";

vi.mock("../notification.service", () => ({
  listNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/notifications", notificationRoutes);

const notificationId = "507f1f77bcf86cd799439013";

function tokenFor(id: string, role: string) {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

describe("notification routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationService.listNotifications).mockResolvedValue({
      items: [],
      nextCursor: null,
      unreadCount: 0,
    });
    vi.mocked(notificationService.getUnreadCount).mockResolvedValue(0);
    vi.mocked(notificationService.markNotificationRead).mockResolvedValue(
      {} as never
    );
    vi.mocked(notificationService.markAllNotificationsRead).mockResolvedValue(0);
  });

  it("requires authentication for every notification endpoint", async () => {
    const [list, count, readOne, readAll] = await Promise.all([
      request(app).get("/api/notifications"),
      request(app).get("/api/notifications/unread-count"),
      request(app).patch(`/api/notifications/${notificationId}/read`),
      request(app).patch("/api/notifications/read-all"),
    ]);

    expect(list.status).toBe(401);
    expect(count.status).toBe(401);
    expect(readOne.status).toBe(401);
    expect(readAll.status).toBe(401);
    expect(notificationService.listNotifications).not.toHaveBeenCalled();
    expect(notificationService.getUnreadCount).not.toHaveBeenCalled();
    expect(notificationService.markNotificationRead).not.toHaveBeenCalled();
    expect(notificationService.markAllNotificationsRead).not.toHaveBeenCalled();
  });

  it("lists only the authenticated user's notifications", async () => {
    const response = await request(app)
      .get("/api/notifications?limit=10&unreadOnly=true")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { items: [], nextCursor: null, unreadCount: 0 },
    });
    expect(notificationService.listNotifications).toHaveBeenCalledWith(
      "buyer-1",
      expect.objectContaining({ limit: 10, unreadOnly: true })
    );
  });

  it("applies the default page size and read filter", async () => {
    const response = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);

    expect(response.status).toBe(200);
    expect(notificationService.listNotifications).toHaveBeenCalledWith(
      "seller-1",
      expect.objectContaining({ limit: 20, unreadOnly: false })
    );
  });

  it("rejects page sizes above the maximum", async () => {
    const response = await request(app)
      .get("/api/notifications?limit=51")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);

    expect(response.status).toBe(400);
    expect(notificationService.listNotifications).not.toHaveBeenCalled();
  });

  it("returns the authenticated user's unread count", async () => {
    vi.mocked(notificationService.getUnreadCount).mockResolvedValue(7);

    const response = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { unreadCount: 7 },
    });
    expect(notificationService.getUnreadCount).toHaveBeenCalledWith("buyer-2");
  });

  it("marks a notification read for the authenticated user only", async () => {
    const response = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`)
      .send({ recipientId: "buyer-2" });

    expect(response.status).toBe(200);
    expect(notificationService.markNotificationRead).toHaveBeenCalledWith(
      notificationId,
      "buyer-1"
    );
  });

  it("marks all of the authenticated user's notifications read", async () => {
    vi.mocked(notificationService.markAllNotificationsRead).mockResolvedValue(3);

    const response = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { modifiedCount: 3 },
    });
    expect(notificationService.markAllNotificationsRead).toHaveBeenCalledWith(
      "buyer-1"
    );
    expect(notificationService.markNotificationRead).not.toHaveBeenCalled();
  });

  it("propagates ownership failures as not found", async () => {
    vi.mocked(notificationService.markNotificationRead).mockRejectedValue(
      Object.assign(new Error("Notification not found"), { status: 404 })
    );

    const response = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
