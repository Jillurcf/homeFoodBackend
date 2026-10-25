"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const env_1 = require("../../../config/env");
const notificationService = __importStar(require("../notification.service"));
const notification_routes_1 = __importDefault(require("../notification.routes"));
vitest_1.vi.mock("../notification.service", () => ({
    listNotifications: vitest_1.vi.fn(),
    getUnreadCount: vitest_1.vi.fn(),
    markNotificationRead: vitest_1.vi.fn(),
    markAllNotificationsRead: vitest_1.vi.fn(),
}));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/notifications", notification_routes_1.default);
const notificationId = "507f1f77bcf86cd799439013";
function tokenFor(id, role) {
    return jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, { expiresIn: "1h" });
}
(0, vitest_1.describe)("notification routes", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(notificationService.listNotifications).mockResolvedValue({
            items: [],
            nextCursor: null,
            unreadCount: 0,
        });
        vitest_1.vi.mocked(notificationService.getUnreadCount).mockResolvedValue(0);
        vitest_1.vi.mocked(notificationService.markNotificationRead).mockResolvedValue({});
        vitest_1.vi.mocked(notificationService.markAllNotificationsRead).mockResolvedValue(0);
    });
    (0, vitest_1.it)("requires authentication for every notification endpoint", async () => {
        const [list, count, readOne, readAll] = await Promise.all([
            (0, supertest_1.default)(app).get("/api/notifications"),
            (0, supertest_1.default)(app).get("/api/notifications/unread-count"),
            (0, supertest_1.default)(app).patch(`/api/notifications/${notificationId}/read`),
            (0, supertest_1.default)(app).patch("/api/notifications/read-all"),
        ]);
        (0, vitest_1.expect)(list.status).toBe(401);
        (0, vitest_1.expect)(count.status).toBe(401);
        (0, vitest_1.expect)(readOne.status).toBe(401);
        (0, vitest_1.expect)(readAll.status).toBe(401);
        (0, vitest_1.expect)(notificationService.listNotifications).not.toHaveBeenCalled();
        (0, vitest_1.expect)(notificationService.getUnreadCount).not.toHaveBeenCalled();
        (0, vitest_1.expect)(notificationService.markNotificationRead).not.toHaveBeenCalled();
        (0, vitest_1.expect)(notificationService.markAllNotificationsRead).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("lists only the authenticated user's notifications", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/api/notifications?limit=10&unreadOnly=true")
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual({
            success: true,
            data: { items: [], nextCursor: null, unreadCount: 0 },
        });
        (0, vitest_1.expect)(notificationService.listNotifications).toHaveBeenCalledWith("buyer-1", vitest_1.expect.objectContaining({ limit: 10, unreadOnly: true }));
    });
    (0, vitest_1.it)("applies the default page size and read filter", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(notificationService.listNotifications).toHaveBeenCalledWith("seller-1", vitest_1.expect.objectContaining({ limit: 20, unreadOnly: false }));
    });
    (0, vitest_1.it)("rejects page sizes above the maximum", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/api/notifications?limit=51")
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(notificationService.listNotifications).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("returns the authenticated user's unread count", async () => {
        vitest_1.vi.mocked(notificationService.getUnreadCount).mockResolvedValue(7);
        const response = await (0, supertest_1.default)(app)
            .get("/api/notifications/unread-count")
            .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual({
            success: true,
            data: { unreadCount: 7 },
        });
        (0, vitest_1.expect)(notificationService.getUnreadCount).toHaveBeenCalledWith("buyer-2");
    });
    (0, vitest_1.it)("marks a notification read for the authenticated user only", async () => {
        const response = await (0, supertest_1.default)(app)
            .patch(`/api/notifications/${notificationId}/read`)
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`)
            .send({ recipientId: "buyer-2" });
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(notificationService.markNotificationRead).toHaveBeenCalledWith(notificationId, "buyer-1");
    });
    (0, vitest_1.it)("marks all of the authenticated user's notifications read", async () => {
        vitest_1.vi.mocked(notificationService.markAllNotificationsRead).mockResolvedValue(3);
        const response = await (0, supertest_1.default)(app)
            .patch("/api/notifications/read-all")
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual({
            success: true,
            data: { modifiedCount: 3 },
        });
        (0, vitest_1.expect)(notificationService.markAllNotificationsRead).toHaveBeenCalledWith("buyer-1");
        (0, vitest_1.expect)(notificationService.markNotificationRead).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("propagates ownership failures as not found", async () => {
        vitest_1.vi.mocked(notificationService.markNotificationRead).mockRejectedValue(Object.assign(new Error("Notification not found"), { status: 404 }));
        const response = await (0, supertest_1.default)(app)
            .patch(`/api/notifications/${notificationId}/read`)
            .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(404);
        (0, vitest_1.expect)(response.body.success).toBe(false);
    });
});
//# sourceMappingURL=notification.routes.test.js.map