"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFoodSchema = exports.createFoodSchema = exports.listFoodsQuerySchema = exports.availabilityEnum = void 0;
const zod_1 = require("zod");
exports.availabilityEnum = zod_1.z.enum(["available", "low", "sold_out"]);
exports.listFoodsQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    area: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().min(0).optional(),
    minRating: zod_1.z.coerce.number().min(0).max(5).optional(),
    inStock: zod_1.z
        .enum(["true", "false"])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === "true")),
    sort: zod_1.z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(12),
});
exports.createFoodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(120),
    description: zod_1.z.string().min(1, "Description is required").max(1000),
    price: zod_1.z.number().positive("Price must be greater than 0"),
    category: zod_1.z.string().min(1, "Category is required"),
    perUnit: zod_1.z.string().min(1, "Per unit is required"),
    prepTime: zod_1.z.number().int().min(5, "Prep time must be at least 5 minutes"),
    maxOrdersPerDay: zod_1.z
        .number()
        .int()
        .min(1, "Max orders per day must be at least 1"),
    availability: exports.availabilityEnum.default("available"),
    imageUrl: zod_1.z.string().default(""),
    dietaryTags: zod_1.z.array(zod_1.z.string()).default([]),
    deliveryFee: zod_1.z.number().min(0).default(40),
    area: zod_1.z.string().min(1, "Area is required"),
});
exports.updateFoodSchema = exports.createFoodSchema.partial();
//# sourceMappingURL=food.validation.js.map