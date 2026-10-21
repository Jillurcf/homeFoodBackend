import { Router } from "express";
import * as foodMakerController from "./foodMaker.controller";
import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../../middlewares/requireRole";

const router = Router();

router.get("/me", authenticate, requireRole("buyer", "seller"), foodMakerController.getMe);
router.get("/me/stats", authenticate, requireRole("buyer", "seller"), foodMakerController.getMyStats);

router.post("/me", authenticate, requireRole("buyer", "seller"), foodMakerController.upsertMe);

router.get("/:shopId", foodMakerController.getPublicShop);

export default router;
