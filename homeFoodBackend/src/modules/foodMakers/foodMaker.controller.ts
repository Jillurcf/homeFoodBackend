import { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../auth/auth.middleware";
import * as foodMakerService from "./foodMaker.service";
import { shopSchema } from "./foodMaker.validation";

const handleError = (res: Response, err: any) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0]?.message || "Validation error",
      errors: err.issues,
    });
  }

  if (err?.name === "CastError") {
    return res.status(404).json({ success: false, message: "Shop not found" });
  }

  return res.status(500).json({ success: false, message: err.message });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const shop = await foodMakerService.getMyShop(userId!);

    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "No shop profile found" });
    }

    return res.json({ success: true, data: shop });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const upsertMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const input = shopSchema.parse(req.body);
    const shop = await foodMakerService.saveMyShop(userId!, input);

    return res.json({ success: true, data: shop });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const getPublicShop = async (req: Request, res: Response) => {
  try {
    const shop = await foodMakerService.getPublicShop(req.params.shopId);

    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    return res.json({
      success: true,
      data: foodMakerService.toPublicShop(shop),
    });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const getMyStats = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user.id;
    const stats = await foodMakerService.getMyStats(sellerId);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    return handleError(res, err);
  }
};
