import { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../auth/auth.middleware";
import * as reviewService from "./review.service";
import {
  createReviewSchema,
  listReviewsQuerySchema,
  replyReviewSchema,
} from "./review.validation";

const handleError = (res: Response, err: any) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues,
    });
  }

  const status = err.status || 500;
  return res.status(status).json({ success: false, message: err.message });
};

export const listReviews = async (req: Request, res: Response) => {
  try {
    const query = listReviewsQuerySchema.parse(req.query);
    const { reviews, total } = await reviewService.listReviews(query);

    return res.json({
      success: true,
      data: { reviews, total },
    });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const listSellerReviews = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as AuthRequest).user!.id;
    const reviews = await reviewService.listSellerReviews(sellerId);

    return res.json({ success: true, data: reviews });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const buyerId = (req as AuthRequest).user!.id;
    const input = createReviewSchema.parse(req.body);
    const review = await reviewService.createReview(buyerId, input);

    return res.status(201).json({ success: true, data: review });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const replyToReview = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    const { reply } = replyReviewSchema.parse(req.body);
    const updated = await reviewService.replyToReview(
      req.params.id,
      user.id,
      user.role,
      reply
    );

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return handleError(res, err);
  }
};
