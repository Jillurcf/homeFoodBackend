import { z } from "zod";

export const createOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),

  restaurantId: z.string().min(1, "Restaurant ID is required"),

  items: z
    .array(
      z.object({
        foodId: z.string().min(1, "Food ID is required"),

        name: z.string().min(1, "Food name is required"),

        price: z
          .number()
          .positive("Price must be greater than 0"),

        quantity: z
          .number()
          .int()
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),

  totalAmount: z
    .number()
    .positive("Total amount must be greater than 0"),
});