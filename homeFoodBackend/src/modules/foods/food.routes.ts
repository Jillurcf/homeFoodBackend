import { Router } from "express";
import * as foodController from "./food.controller";
import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../../middlewares/requireRole";

const router = Router();

router.get("/", foodController.listFoods);

router.get("/categories", foodController.getCategories);

router.get(
  "/seller/mine",
  authenticate,
  requireRole("seller", "admin"),
  foodController.getMyFoods
);

router.get("/:id", foodController.getFoodById);

router.post("/", authenticate, foodController.createFood);

router.patch("/:id", authenticate, foodController.updateFood);

router.delete("/:id", authenticate, foodController.deleteFood);

export default router;
