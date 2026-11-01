"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsernameSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const terms_1 = require("../../config/terms");
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
    role: zod_1.z.enum(["buyer", "seller"]).default("buyer"),
    acceptedTerms: zod_1.z
        .boolean()
        .refine((value) => value === true, "You must accept the terms and conditions"),
    termsVersion: zod_1.z
        .string()
        .refine((value) => value === terms_1.TERMS_VERSION, `Terms version must be ${terms_1.TERMS_VERSION}`),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.checkUsernameSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
});
//# sourceMappingURL=auth.validation.js.map