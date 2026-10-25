"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotificationsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listNotificationsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    cursor: zod_1.z.string().trim().min(1).optional(),
    unreadOnly: zod_1.z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),
});
//# sourceMappingURL=notification.validation.js.map