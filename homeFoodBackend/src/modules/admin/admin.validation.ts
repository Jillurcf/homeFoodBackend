import { z } from "zod";

export const userListQuerySchema = z.object({
  role: z.enum(["buyer", "seller", "admin"]).optional(),
});

const userRoleSchema = z.enum(["buyer", "seller", "admin"]);
const usernameSchema = z
  .string()
  .trim()
  .min(1, "Username is required")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: usernameSchema,
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  role: userRoleSchema.default("buyer"),
});

export const adminUpdateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    username: usernameSchema.optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    role: userRoleSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one user field must be provided",
  });

export const verifyShopSchema = z.object({
  verified: z.boolean(),
});

export const foodListQuerySchema = z.object({
  sellerId: z.string().min(1).optional(),
});

export const updateFoodSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    price: z.number().positive().optional(),
    category: z.string().trim().min(1).optional(),
    perUnit: z.string().trim().min(1).optional(),
    prepTime: z.number().int().positive().optional(),
    maxOrdersPerDay: z.number().int().positive().optional(),
    availability: z.enum(["available", "low", "sold_out"]).optional(),
    imageUrl: z.string().trim().optional(),
    dietaryTags: z.array(z.string().trim()).optional(),
    deliveryFee: z.number().min(0).optional(),
    area: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one food field must be provided",
  });

export const orderListQuerySchema = z.object({
  status: z
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

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "ON_THE_WAY",
    "DELIVERED",
    "CANCELLED",
  ]),
});
