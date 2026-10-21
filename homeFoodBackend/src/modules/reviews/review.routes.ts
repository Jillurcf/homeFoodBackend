import { Router } from "express";
import * as reviewController from "./review.controller";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

router.get("/", reviewController.listReviews);

router.get("/seller", authenticate, reviewController.listSellerReviews);

router.post("/", authenticate, reviewController.createReview);

router.post("/:id/reply", authenticate, reviewController.replyToReview);

export default router;
