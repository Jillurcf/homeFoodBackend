import { z } from "zod";

export const listReviewsQuerySchema = z.object({
  foodId: z.string().min(1, "foodId is required"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;

export const createReviewSchema = z
  .object({
    foodId: z.string().min(1, "foodId is required"),
    orderId: z.string().min(1).optional(),
    rating: z
      .number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    text: z.string().trim().optional(),
    comment: z.string().trim().optional(),
  })
  .refine((data) => (data.text ?? data.comment)?.trim(), {
    message: "Please write a short comment",
  });

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const replyReviewSchema = z.object({
  reply: z.string().trim().min(1, "Reply cannot be empty").max(1000),
});

export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
