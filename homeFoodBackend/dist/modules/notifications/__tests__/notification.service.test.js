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
const vitest_1 = require("vitest");
const food_model_1 = __importDefault(require("../../foods/food.model"));
const notificationRepository = __importStar(require("../notification.repository"));
const notificationService = __importStar(require("../notification.service"));
vitest_1.vi.mock("../notification.repository", () => ({
    findForRecipient: vitest_1.vi.fn(),
    countUnread: vitest_1.vi.fn(),
    markRead: vitest_1.vi.fn(),
    markAllRead: vitest_1.vi.fn(),
    createMany: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../../foods/food.model", () => ({
    default: { find: vitest_1.vi.fn() },
}));
const recipientId = "507f1f77bcf86cd799439011";
const otherRecipientId = "507f1f77bcf86cd799439012";
const notificationIds = [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014",
    "507f1f77bcf86cd799439015",
];
const rows = [
    {
        _id: notificationIds[0],
        createdAt: new Date("2026-01-03T10:00:00.000Z"),
    },
    {
        _id: notificationIds[1],
        createdAt: new Date("2026-01-02T10:00:00.000Z"),
    },
    {
        _id: notificationIds[2],
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
    },
];
(0, vitest_1.describe)("notification service", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(notificationRepository.findForRecipient).mockResolvedValue([]);
        vitest_1.vi.mocked(notificationRepository.countUnread).mockResolvedValue(0);
        vitest_1.vi.mocked(notificationRepository.markRead).mockResolvedValue(null);
        vitest_1.vi.mocked(notificationRepository.markAllRead).mockResolvedValue(0);
        vitest_1.vi.mocked(notificationRepository.createMany).mockResolvedValue(0);
    });
    (0, vitest_1.it)("returns a page and a cursor pointing at the last returned item", async () => {
        vitest_1.vi.mocked(notificationRepository.findForRecipient).mockResolvedValue(rows);
        vitest_1.vi.mocked(notificationRepository.countUnread).mockResolvedValue(4);
        const result = await notificationService.listNotifications(recipientId, {
            limit: 2,
            unreadOnly: false,
        });
        (0, vitest_1.expect)(result.items).toHaveLength(2);
        (0, vitest_1.expect)(result.unreadCount).toBe(4);
        (0, vitest_1.expect)(result.nextCursor).not.toBeNull();
        const cursor = notificationService.decodeCursor(result.nextCursor);
        (0, vitest_1.expect)(cursor.id).toBe(notificationIds[1]);
        (0, vitest_1.expect)(cursor.createdAt).toEqual(rows[1].createdAt);
        (0, vitest_1.expect)(notificationRepository.findForRecipient).toHaveBeenCalledWith({
            recipientId,
            limit: 2,
            cursor: undefined,
            unreadOnly: false,
        });
    });
    (0, vitest_1.it)("stops paginating when there are no extra rows", async () => {
        vitest_1.vi.mocked(notificationRepository.findForRecipient).mockResolvedValue([
            rows[0],
        ]);
        vitest_1.vi.mocked(notificationRepository.countUnread).mockResolvedValue(1);
        const result = await notificationService.listNotifications(recipientId, {
            limit: 2,
            unreadOnly: false,
        });
        (0, vitest_1.expect)(result.items).toHaveLength(1);
        (0, vitest_1.expect)(result.nextCursor).toBeNull();
    });
    (0, vitest_1.it)("decodes cursors and passes unreadOnly through to the repository", async () => {
        const cursor = notificationService.encodeCursor(new Date("2026-01-02T10:00:00.000Z"), notificationIds[1]);
        await notificationService.listNotifications(recipientId, {
            limit: 20,
            cursor,
            unreadOnly: true,
        });
        (0, vitest_1.expect)(notificationRepository.findForRecipient).toHaveBeenCalledWith({
            recipientId,
            limit: 20,
            cursor: {
                createdAt: new Date("2026-01-02T10:00:00.000Z"),
                id: notificationIds[1],
            },
            unreadOnly: true,
        });
    });
    (0, vitest_1.it)("rejects malformed cursors", async () => {
        await (0, vitest_1.expect)(notificationService.listNotifications(recipientId, {
            limit: 20,
            cursor: "not-a-cursor",
            unreadOnly: false,
        })).rejects.toMatchObject({ status: 400 });
        (0, vitest_1.expect)(notificationRepository.findForRecipient).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("marks a notification read only for the given recipient", async () => {
        const notification = { _id: notificationIds[0], isRead: true };
        vitest_1.vi.mocked(notificationRepository.markRead).mockResolvedValue(notification);
        await notificationService.markNotificationRead(notificationIds[0], recipientId);
        (0, vitest_1.expect)(notificationRepository.markRead).toHaveBeenCalledWith(notificationIds[0], recipientId);
        (0, vitest_1.expect)(notificationRepository.markRead).not.toHaveBeenCalledWith(notificationIds[0], otherRecipientId);
    });
    (0, vitest_1.it)("returns 404 when the notification does not belong to the recipient", async () => {
        vitest_1.vi.mocked(notificationRepository.markRead).mockResolvedValue(null);
        await (0, vitest_1.expect)(notificationService.markNotificationRead(notificationIds[0], otherRecipientId)).rejects.toMatchObject({ status: 404 });
    });
    (0, vitest_1.it)("rejects malformed notification ids before querying", async () => {
        await (0, vitest_1.expect)(notificationService.markNotificationRead("bad-id", recipientId)).rejects.toMatchObject({ status: 400 });
        (0, vitest_1.expect)(notificationRepository.markRead).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("marks all notifications read for the authenticated recipient", async () => {
        vitest_1.vi.mocked(notificationRepository.markAllRead).mockResolvedValue(3);
        const result = await notificationService.markAllNotificationsRead(recipientId);
        (0, vitest_1.expect)(result).toBe(3);
        (0, vitest_1.expect)(notificationRepository.markAllRead).toHaveBeenCalledWith(recipientId);
    });
});
(0, vitest_1.describe)("order notifications", () => {
    const buyerId = "507f1f77bcf86cd799439011";
    const orderId = "507f1f77bcf86cd799439041";
    const foodIds = [
        "507f1f77bcf86cd799439021",
        "507f1f77bcf86cd799439022",
    ];
    const sellerIds = [
        "507f1f77bcf86cd799439031",
        "507f1f77bcf86cd799439032",
    ];
    const orderFor = (status) => ({
        _id: orderId,
        userId: buyerId,
        items: foodIds.map((foodId) => ({ foodId })),
        totalAmount: 250,
        status,
    });
    const mockSellers = (ids) => {
        const distinct = vitest_1.vi.fn().mockResolvedValue(ids);
        vitest_1.vi.mocked(food_model_1.default.find).mockReturnValue({ distinct });
        return distinct;
    };
    const createdDrafts = () => {
        const calls = vitest_1.vi.mocked(notificationRepository.createMany).mock.calls;
        return calls[calls.length - 1][0];
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(notificationRepository.createMany).mockResolvedValue(0);
        mockSellers(sellerIds);
    });
    (0, vitest_1.it)("creates one ORDER_PLACED notification per unique seller", async () => {
        mockSellers([...sellerIds, sellerIds[0]]);
        await notificationService.notifyOrderPlaced(orderFor("PENDING"));
        const drafts = createdDrafts();
        (0, vitest_1.expect)(food_model_1.default.find).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(drafts).toHaveLength(2);
        (0, vitest_1.expect)(drafts.map((draft) => draft.recipientId)).toEqual(sellerIds);
        (0, vitest_1.expect)(drafts.every((draft) => draft.type === "ORDER_PLACED")).toBe(true);
        (0, vitest_1.expect)(drafts[0].dedupeKey).toBe(`ORDER_PLACED:${orderId}:${sellerIds[0]}`);
        (0, vitest_1.expect)(drafts.some((draft) => draft.recipientId === buyerId)).toBe(false);
    });
    (0, vitest_1.it)("notifies the buyer when a seller accepts the order", async () => {
        await notificationService.notifyOrderStatusChange(orderFor("PREPARING"), "PENDING", sellerIds[0]);
        const drafts = createdDrafts();
        (0, vitest_1.expect)(drafts).toHaveLength(1);
        (0, vitest_1.expect)(drafts[0]).toMatchObject({
            recipientId: buyerId,
            actorId: sellerIds[0],
            type: "ORDER_ACCEPTED",
            dedupeKey: `ORDER_ACCEPTED:${orderId}`,
        });
    });
    (0, vitest_1.it)("notifies the buyer when the order goes out for delivery", async () => {
        await notificationService.notifyOrderStatusChange(orderFor("ON_THE_WAY"), "PREPARING", sellerIds[0]);
        const drafts = createdDrafts();
        (0, vitest_1.expect)(drafts).toHaveLength(1);
        (0, vitest_1.expect)(drafts[0]).toMatchObject({
            recipientId: buyerId,
            type: "ORDER_ON_THE_WAY",
            dedupeKey: `ORDER_ON_THE_WAY:${orderId}`,
        });
    });
    (0, vitest_1.it)("notifies every seller when the buyer confirms receipt", async () => {
        mockSellers([...sellerIds, buyerId]);
        await notificationService.notifyOrderStatusChange(orderFor("DELIVERED"), "ON_THE_WAY", buyerId);
        const drafts = createdDrafts();
        (0, vitest_1.expect)(drafts).toHaveLength(2);
        (0, vitest_1.expect)(drafts.every((draft) => draft.type === "ORDER_RECEIVED")).toBe(true);
        (0, vitest_1.expect)(drafts.map((draft) => draft.dedupeKey)).toEqual(sellerIds.map((sellerId) => `ORDER_RECEIVED:${orderId}:${sellerId}`));
        (0, vitest_1.expect)(drafts.some((draft) => draft.recipientId === buyerId)).toBe(false);
    });
    (0, vitest_1.it)("notifies the buyer when a seller declines a new order", async () => {
        await notificationService.notifyOrderStatusChange(orderFor("CANCELLED"), "PENDING", sellerIds[0]);
        const drafts = createdDrafts();
        (0, vitest_1.expect)(drafts).toHaveLength(1);
        (0, vitest_1.expect)(drafts[0]).toMatchObject({
            recipientId: buyerId,
            type: "ORDER_DECLINED",
            dedupeKey: `ORDER_DECLINED:${orderId}`,
        });
    });
    (0, vitest_1.it)("notifies the buyer and sellers when an admin cancels an order", async () => {
        await notificationService.notifyOrderStatusChange(orderFor("CANCELLED"), "PREPARING");
        const drafts = createdDrafts();
        (0, vitest_1.expect)(drafts).toHaveLength(3);
        (0, vitest_1.expect)(drafts.every((draft) => draft.type === "ORDER_CANCELLED")).toBe(true);
        (0, vitest_1.expect)(drafts.map((draft) => draft.recipientId)).toEqual([
            buyerId,
            ...sellerIds,
        ]);
    });
    (0, vitest_1.it)("never notifies the actor", async () => {
        mockSellers([sellerIds[0]]);
        await notificationService.notifyOrderStatusChange(orderFor("DELIVERED"), "ON_THE_WAY", sellerIds[0]);
        (0, vitest_1.expect)(vitest_1.vi.mocked(notificationRepository.createMany)).toHaveBeenLastCalledWith([]);
    });
});
//# sourceMappingURL=notification.service.test.js.map