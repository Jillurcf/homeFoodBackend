"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsernameSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    username: zod_1.z
        .string()
        .min(1, "Username is required")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.z.string().optional(),
    nidNumber: zod_1.z
        .string()
        .regex(/^\d{10,17}$/, "NID number must be 10 to 17 digits")
        .optional(),
    address: zod_1.z.string().min(1, "Address is required").optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.checkUsernameSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
});
//# sourceMappingURL=auth.validation.js.map