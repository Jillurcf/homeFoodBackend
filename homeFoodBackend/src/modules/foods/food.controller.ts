import { Request, Response } from "express";
import { ZodError } from "zod";
import * as foodService from "./food.service";
import {
  listFoodsQuerySchema,
  createFoodSchema,
  updateFoodSchema,
} from "./food.validation";
import { AuthRequest } from "../auth/auth.middleware";

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

export const listFoods = async (req: Request, res: Response) => {
  try {
    const query = listFoodsQuerySchema.parse(req.query);
    const { foods, total } = await foodService.listFoods(query);
    const totalPages = Math.ceil(total / query.limit);

    return res.json({
      success: true,
      data: {
        foods,
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await foodService.getCategories();

    return res.json({ success: true, data: categories });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const getMyFoods = async (req: AuthRequest, res: Response) => {
  try {
    const foods = await foodService.getSellerFoods(req.user!.id);

    return res.json({ success: true, data: foods });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const getFoodById = async (req: Request, res: Response) => {
  try {
    const food = await foodService.getFoodById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    return res.json({ success: true, data: food });
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(404).json({ success: false, message: "Food not found" });
    }
    return handleError(res, err);
  }
};

export const createFood = async (req: AuthRequest, res: Response) => {
  try {
    const payload = createFoodSchema.parse(req.body);
    const food = await foodService.createFood(req.user!.id, payload);

    return res.status(201).json({ success: true, data: food });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const updateFood = async (req: AuthRequest, res: Response) => {
  try {
    const payload = updateFoodSchema.parse(req.body);
    const food = await foodService.updateFood(
      req.params.id,
      req.user!.id,
      req.user!.role,
      payload
    );

    return res.json({ success: true, data: food });
  } catch (err: any) {
    return handleError(res, err);
  }
};

export const deleteFood = async (req: AuthRequest, res: Response) => {
  try {
    const food = await foodService.deleteFood(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    return res.json({ success: true, data: food });
  } catch (err: any) {
    return handleError(res, err);
  }
};
