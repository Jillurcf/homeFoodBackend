"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyReviewSchema = exports.createReviewSchema = exports.listReviewsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listReviewsQuerySchema = zod_1.z.object({
    foodId: zod_1.z.string().min(1, "foodId is required"),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
});
exports.createReviewSchema = zod_1.z
    .object({
    foodId: zod_1.z.string().min(1, "foodId is required"),
    orderId: zod_1.z.string().min(1).optional(),
    rating: zod_1.z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
    text: zod_1.z.string().trim().optional(),
    comment: zod_1.z.string().trim().optional(),
})
    .refine((data) => (data.text ?? data.comment)?.trim(), {
    message: "Please write a short comment",
});
exports.replyReviewSchema = zod_1.z.object({
    reply: zod_1.z.string().trim().min(1, "Reply cannot be empty").max(1000),
});
//# sourceMappingURL=review.validation.js.map