"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
    restaurantId: zod_1.z.string().min(1, "Restaurant ID is required"),
    items: zod_1.z
        .array(zod_1.z.object({
        foodId: zod_1.z.string().min(1, "Food ID is required"),
        name: zod_1.z.string().min(1, "Food name is required"),
        price: zod_1.z
            .number()
            .positive("Price must be greater than 0"),
        quantity: zod_1.z
            .number()
            .int()
            .min(1, "Quantity must be at least 1"),
    }))
        .min(1, "At least one item is required"),
    totalAmount: zod_1.z
        .number()
        .positive("Total amount must be greater than 0"),
});
//# sourceMappingURL=order.validation.js.map