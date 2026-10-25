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
exports.notifyOrderStatusChange = exports.notifyOrderPlaced = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getUnreadCount = exports.listNotifications = exports.decodeCursor = exports.encodeCursor = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const food_model_1 = __importDefault(require("../foods/food.model"));
const foodMaker_model_1 = __importDefault(require("../foodMakers/foodMaker.model"));
const user_model_1 = __importDefault(require("../../model/user/user.model"));
const notificationRepository = __importStar(require("./notification.repository"));
const encodeCursor = (createdAt, id) => {
    return Buffer.from(`${createdAt.toISOString()}|${id}`, "utf8").toString("base64url");
};
exports.encodeCursor = encodeCursor;
const decodeCursor = (cursor) => {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const separator = decoded.indexOf("|");
    const isoDate = separator === -1 ? "" : decoded.slice(0, separator);
    const id = separator === -1 ? "" : decoded.slice(separator + 1);
    const createdAt = new Date(isoDate);
    if (!id ||
        Number.isNaN(createdAt.getTime()) ||
        !mongoose_1.default.isValidObjectId(id)) {
        throw Object.assign(new Error("Invalid cursor"), { status: 400 });
    }
    return { createdAt, id };
};
exports.decodeCursor = decodeCursor;
const listNotifications = async (recipientId, query) => {
    const cursor = query.cursor ? (0, exports.decodeCursor)(query.cursor) : undefined;
    const [rows, unreadCount] = await Promise.all([
        notificationRepository.findForRecipient({
            recipientId,
            limit: query.limit,
            cursor,
            unreadOnly: query.unreadOnly,
        }),
        notificationRepository.countUnread(recipientId),
    ]);
    const hasMore = rows.length > query.limit;
    const items = hasMore ? rows.slice(0, query.limit) : rows;
    const last = items[items.length - 1];
    return {
        items,
        nextCursor: hasMore && last
            ? (0, exports.encodeCursor)(new Date(last.createdAt), String(last._id))
            : null,
        unreadCount,
    };
};
exports.listNotifications = listNotifications;
const getUnreadCount = async (recipientId) => {
    return notificationRepository.countUnread(recipientId);
};
exports.getUnreadCount = getUnreadCount;
const markNotificationRead = async (id, recipientId) => {
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw Object.assign(new Error("Invalid notification ID"), { status: 400 });
    }
    const notification = await notificationRepository.markRead(id, recipientId);
    if (!notification) {
        throw Object.assign(new Error("Notification not found"), { status: 404 });
    }
    return notification;
};
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = async (recipientId) => {
    return notificationRepository.markAllRead(recipientId);
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const unique = (values) => Array.from(new Set(values));
const getFoodIds = (order) => unique(order.items.map((item) => String(item.foodId)).filter(Boolean));
const getSellerIds = async (foodIds) => {
    if (foodIds.length === 0)
        return [];
    const sellerIds = await food_model_1.default.find({ _id: { $in: foodIds } }).distinct("sellerId");
    return unique(sellerIds.map((id) => String(id)).filter(Boolean));
};
const isDatabaseConnected = () => mongoose_1.default.connection.readyState === 1;
const getBuyerName = async (userId) => {
    if (!isDatabaseConnected())
        return undefined;
    try {
        const buyer = await user_model_1.default.findById(userId).select("name").lean();
        return buyer?.name;
    }
    catch {
        return undefined;
    }
};
const getShopName = async (sellerId) => {
    if (!sellerId || !isDatabaseConnected())
        return undefined;
    try {
        const shop = await foodMaker_model_1.default.findOne({ userId: sellerId })
            .select("shopName")
            .lean();
        return shop?.shopName;
    }
    catch {
        return undefined;
    }
};
const buildNotificationData = (orderId, foodIds, totalAmount, snapshots) => ({
    orderId,
    foodIds,
    totalAmount,
    ...(snapshots.buyerName ? { buyerName: snapshots.buyerName } : {}),
    ...(snapshots.shopName ? { shopName: snapshots.shopName } : {}),
});
const addDraft = (drafts, keys, draft, actorId) => {
    if (draft.recipientId === actorId)
        return;
    if (keys.has(draft.dedupeKey))
        return;
    keys.add(draft.dedupeKey);
    drafts.push(draft);
};
const notifyOrderPlaced = async (order) => {
    const orderId = String(order._id);
    const buyerId = String(order.userId);
    const foodIds = getFoodIds(order);
    const sellerIds = await getSellerIds(foodIds);
    const recipients = sellerIds.filter((sellerId) => sellerId !== buyerId);
    if (recipients.length === 0)
        return 0;
    const buyerName = await getBuyerName(buyerId);
    const data = buildNotificationData(orderId, foodIds, order.totalAmount, {
        buyerName,
    });
    return notificationRepository.createMany(recipients.map((sellerId) => ({
        recipientId: sellerId,
        actorId: buyerId,
        orderId,
        type: "ORDER_PLACED",
        title: "New order received",
        message: buyerName
            ? `${buyerName} placed an order. Review and accept it from your orders.`
            : "You received a new order. Review and accept it from your orders.",
        data,
        dedupeKey: `ORDER_PLACED:${orderId}:${sellerId}`,
    })));
};
exports.notifyOrderPlaced = notifyOrderPlaced;
const notifyOrderStatusChange = async (order, previousStatus, actorId) => {
    const orderId = String(order._id);
    const buyerId = String(order.userId);
    const actor = actorId ? String(actorId) : undefined;
    const foodIds = getFoodIds(order);
    const sellerIds = await getSellerIds(foodIds);
    const buyerName = await getBuyerName(buyerId);
    const shopName = await getShopName(actor);
    const data = buildNotificationData(orderId, foodIds, order.totalAmount, {
        buyerName,
        shopName,
    });
    const drafts = [];
    const keys = new Set();
    if (order.status === "PREPARING") {
        addDraft(drafts, keys, {
            recipientId: buyerId,
            actorId: actor,
            orderId,
            type: "ORDER_ACCEPTED",
            title: "Order accepted",
            message: shopName
                ? `${shopName} accepted your order and is preparing it.`
                : "Your order has been accepted and is being prepared.",
            data,
            dedupeKey: `ORDER_ACCEPTED:${orderId}`,
        }, actor);
    }
    if (order.status === "ON_THE_WAY") {
        addDraft(drafts, keys, {
            recipientId: buyerId,
            actorId: actor,
            orderId,
            type: "ORDER_ON_THE_WAY",
            title: "Order on the way",
            message: shopName
                ? `${shopName} marked your order out for delivery.`
                : "Your order is on the way.",
            data,
            dedupeKey: `ORDER_ON_THE_WAY:${orderId}`,
        }, actor);
    }
    if (order.status === "DELIVERED") {
        for (const sellerId of sellerIds) {
            addDraft(drafts, keys, {
                recipientId: sellerId,
                actorId: actor,
                orderId,
                type: "ORDER_RECEIVED",
                title: "Order received",
                message: buyerName
                    ? `${buyerName} confirmed receiving the order.`
                    : "The buyer confirmed receiving the order.",
                data,
                dedupeKey: `ORDER_RECEIVED:${orderId}:${sellerId}`,
            }, actor);
        }
    }
    if (order.status === "CANCELLED") {
        const actorIsBuyer = actor === buyerId;
        const actorIsSeller = Boolean(actor && sellerIds.includes(actor));
        const isSellerDecline = actorIsSeller &&
            (previousStatus === "PENDING" || previousStatus === "CONFIRMED");
        const type = isSellerDecline
            ? "ORDER_DECLINED"
            : "ORDER_CANCELLED";
        if (!actorIsBuyer) {
            addDraft(drafts, keys, {
                recipientId: buyerId,
                actorId: actor,
                orderId,
                type,
                title: isSellerDecline ? "Order declined" : "Order cancelled",
                message: isSellerDecline
                    ? shopName
                        ? `${shopName} declined your order.`
                        : "Your order was declined."
                    : "Your order has been cancelled.",
                data,
                dedupeKey: isSellerDecline
                    ? `ORDER_DECLINED:${orderId}`
                    : `ORDER_CANCELLED:${orderId}:${buyerId}`,
            }, actor);
        }
        if (actorIsBuyer || !actorIsSeller) {
            for (const sellerId of sellerIds) {
                addDraft(drafts, keys, {
                    recipientId: sellerId,
                    actorId: actor,
                    orderId,
                    type: "ORDER_CANCELLED",
                    title: "Order cancelled",
                    message: buyerName
                        ? `${buyerName}'s order was cancelled.`
                        : "An order in your shop was cancelled.",
                    data,
                    dedupeKey: `ORDER_CANCELLED:${orderId}:${sellerId}`,
                }, actor);
            }
        }
    }
    return notificationRepository.createMany(drafts);
};
exports.notifyOrderStatusChange = notifyOrderStatusChange;
//# sourceMappingURL=notification.service.js.map