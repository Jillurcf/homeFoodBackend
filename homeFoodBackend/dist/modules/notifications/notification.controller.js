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
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getUnreadCount = exports.listNotifications = void 0;
const zod_1 = require("zod");
const notificationService = __importStar(require("./notification.service"));
const notification_validation_1 = require("./notification.validation");
const handleError = (res, error) => {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.issues,
        });
    }
    const err = error;
    return res.status(err.status ?? 500).json({
        success: false,
        message: err.message ?? "Internal server error",
    });
};
const getUserId = (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return null;
    }
    return user.id;
};
const respond = async (res, action) => {
    try {
        const data = await action();
        return res.json({ success: true, data });
    }
    catch (error) {
        return handleError(res, error);
    }
};
const listNotifications = async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId)
        return;
    return respond(res, () => {
        const query = notification_validation_1.listNotificationsQuerySchema.parse(req.query);
        return notificationService.listNotifications(userId, query);
    });
};
exports.listNotifications = listNotifications;
const getUnreadCount = async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId)
        return;
    return respond(res, async () => ({
        unreadCount: await notificationService.getUnreadCount(userId),
    }));
};
exports.getUnreadCount = getUnreadCount;
const markNotificationRead = async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId)
        return;
    return respond(res, () => notificationService.markNotificationRead(req.params.id, userId));
};
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId)
        return;
    return respond(res, async () => ({
        modifiedCount: await notificationService.markAllNotificationsRead(userId),
    }));
};
exports.markAllNotificationsRead = markAllNotificationsRead;
//# sourceMappingURL=notification.controller.js.map