"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const orderItemSchema = zod_1.z
    .object({
    foodId: zod_1.z.string().min(1, "Food ID is required"),
    name: zod_1.z.string().min(1).optional(),
    price: zod_1.z.number().positive("Price must be greater than 0"),
    quantity: zod_1.z.number().int().min(1).optional(),
    qty: zod_1.z.number().int().min(1).optional(),
})
    .refine((data) => data.quantity !== undefined || data.qty !== undefined, {
    message: "quantity or qty is required",
});
const deliveryAddressSchema = zod_1.z
    .object({
    label: zod_1.z.string().optional(),
    addressLine: zod_1.z.string().optional(),
    area: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
})
    .optional();
exports.createOrderSchema = zod_1.z.object({
    restaurantId: zod_1.z.string().min(1).optional(),
    items: zod_1.z.array(orderItemSchema).min(1, "At least one item is required"),
    totalAmount: zod_1.z.number().positive().optional(),
    note: zod_1.z.string().trim().optional(),
    deliveryAddress: deliveryAddressSchema,
    paymentMethod: zod_1.z.enum(["cod", "bkash", "nagad", "card"]).optional().default("cod"),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "ON_THE_WAY",
        "DELIVERED",
        "CANCELLED",
    ]),
});
//# sourceMappingURL=order.validation.js.map