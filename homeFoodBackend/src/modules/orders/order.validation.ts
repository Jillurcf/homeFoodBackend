import { z } from "zod";

const orderItemSchema = z
  .object({
    foodId: z.string().min(1, "Food ID is required"),
    name: z.string().min(1).optional(),
    price: z.number().positive("Price must be greater than 0"),
    quantity: z.number().int().min(1).optional(),
    qty: z.number().int().min(1).optional(),
  })
  .refine((data) => data.quantity !== undefined || data.qty !== undefined, {
    message: "quantity or qty is required",
  });

const deliveryAddressSchema = z
  .object({
    label: z.string().optional(),
    addressLine: z.string().optional(),
    area: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
  })
  .optional();

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().positive().optional(),
  note: z.string().trim().optional(),
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: z.enum(["cod", "bkash", "nagad", "card"]).optional().default("cod"),
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

export type CreateOrderInput = z.infer<typeof createOrderSchema>;