import { z } from "zod";

export const availabilityEnum = z.enum(["available", "low", "sold_out"]);

export const listFoodsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  area: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListFoodsQuery = z.infer<typeof listFoodsQuerySchema>;

export const createFoodSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().min(1, "Description is required").max(1000),
  price: z.number().positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  perUnit: z.string().min(1, "Per unit is required"),
  prepTime: z.number().int().min(5, "Prep time must be at least 5 minutes"),
  maxOrdersPerDay: z
    .number()
    .int()
    .min(1, "Max orders per day must be at least 1"),
  availability: availabilityEnum.default("available"),
  imageUrl: z.string().default(""),
  dietaryTags: z.array(z.string()).default([]),
  deliveryFee: z.number().min(0).default(40),
  area: z.string().min(1, "Area is required"),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;

export const updateFoodSchema = createFoodSchema.partial();

export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
