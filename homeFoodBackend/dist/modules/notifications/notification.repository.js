"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markRead = exports.countUnread = exports.createMany = exports.findForRecipient = void 0;
const notification_model_1 = __importDefault(require("./notification.model"));
const findForRecipient = async ({ recipientId, limit, cursor, unreadOnly, }) => {
    const query = { recipientId };
    if (unreadOnly) {
        query.isRead = false;
    }
    if (cursor) {
        query.$or = [
            { createdAt: { $lt: cursor.createdAt } },
            { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
        ];
    }
    return notification_model_1.default.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean()
        .exec();
};
exports.findForRecipient = findForRecipient;
const createMany = async (notifications) => {
    if (notifications.length === 0)
        return 0;
    const now = new Date();
    const operations = notifications.map((notification) => ({
        updateOne: {
            filter: { dedupeKey: notification.dedupeKey },
            update: {
                $setOnInsert: {
                    ...notification,
                    isRead: false,
                    createdAt: now,
                    updatedAt: now,
                },
            },
            upsert: true,
        },
    }));
    const result = await notification_model_1.default.bulkWrite(operations, {
        ordered: false,
        timestamps: false,
    });
    return result.upsertedCount;
};
exports.createMany = createMany;
const countUnread = async (recipientId) => {
    return notification_model_1.default.countDocuments({ recipientId, isRead: false });
};
exports.countUnread = countUnread;
const markRead = async (id, recipientId) => {
    return notification_model_1.default.findOneAndUpdate({ _id: id, recipientId }, { $set: { isRead: true, readAt: new Date() } }, { new: true })
        .lean()
        .exec();
};
exports.markRead = markRead;
const markAllRead = async (recipientId) => {
    const result = await notification_model_1.default.updateMany({ recipientId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
    return result.modifiedCount;
};
exports.markAllRead = markAllRead;
//# sourceMappingURL=notification.repository.js.map