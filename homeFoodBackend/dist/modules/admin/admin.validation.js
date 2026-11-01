"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.orderListQuerySchema = exports.updateFoodSchema = exports.foodListQuerySchema = exports.verifyShopSchema = exports.adminUpdateUserSchema = exports.adminCreateUserSchema = exports.updateUserRoleSchema = exports.userListQuerySchema = void 0;
const zod_1 = require("zod");
exports.userListQuerySchema = zod_1.z.object({
    role: zod_1.z.enum(["buyer", "seller", "admin"]).optional(),
});
const userRoleSchema = zod_1.z.enum(["buyer", "seller", "admin"]);
const usernameSchema = zod_1.z
    .string()
    .trim()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");
exports.updateUserRoleSchema = zod_1.z.object({
    role: userRoleSchema,
});
exports.adminCreateUserSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Name is required"),
    username: usernameSchema,
    email: zod_1.z.string().trim().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.z.string().trim().optional(),
    address: zod_1.z.string().trim().optional(),
    role: userRoleSchema.default("buyer"),
});
exports.adminUpdateUserSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1, "Name is required").optional(),
    username: usernameSchema.optional(),
    email: zod_1.z.string().trim().email("Invalid email address").optional(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
    phone: zod_1.z.string().trim().optional(),
    address: zod_1.z.string().trim().optional(),
    role: userRoleSchema.optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one user field must be provided",
});
exports.verifyShopSchema = zod_1.z.object({
    verified: zod_1.z.boolean(),
});
exports.foodListQuerySchema = zod_1.z.object({
    sellerId: zod_1.z.string().min(1).optional(),
});
exports.updateFoodSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1).optional(),
    description: zod_1.z.string().trim().min(1).optional(),
    price: zod_1.z.number().positive().optional(),
    category: zod_1.z.string().trim().min(1).optional(),
    perUnit: zod_1.z.string().trim().min(1).optional(),
    prepTime: zod_1.z.number().int().positive().optional(),
    maxOrdersPerDay: zod_1.z.number().int().positive().optional(),
    availability: zod_1.z.enum(["available", "low", "sold_out"]).optional(),
    imageUrl: zod_1.z.string().trim().optional(),
    dietaryTags: zod_1.z.array(zod_1.z.string().trim()).optional(),
    deliveryFee: zod_1.z.number().min(0).optional(),
    area: zod_1.z.string().trim().min(1).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one food field must be provided",
});
exports.orderListQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "ON_THE_WAY",
        "DELIVERED",
        "CANCELLED",
    ])
        .optional(),
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
//# sourceMappingURL=admin.validation.js.map