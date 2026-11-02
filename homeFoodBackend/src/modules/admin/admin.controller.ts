import { Request, Response } from "express";
import { ZodError } from "zod";
import * as adminService from "./admin.service";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  foodListQuerySchema,
  orderListQuerySchema,
  updateFoodSchema,
  updateOrderStatusSchema,
  userListQuerySchema,
  verifyShopSchema,
} from "./admin.validation";
import { IOrder } from "../orders/order.model";

const handleError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues,
    });
  }
  const err = error as { status?: number; message?: string };
  return res.status(err.status ?? 500).json({
    success: false,
    message: err.message ?? "Internal server error",
  });
};

const respond = async (
  res: Response,
  action: () => Promise<unknown> | unknown,
  status = 200
) => {
  try {
    const data = await action();
    return res.status(status).json({ success: true, data });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getStats = (_req: Request, res: Response) =>
  respond(res, adminService.getStats);

export const listUsers = (req: Request, res: Response) =>
  respond(res, () => {
    const { role } = userListQuerySchema.parse(req.query);
    return adminService.listUsers(role);
  });

export const getUser = (req: Request, res: Response) =>
  respond(res, () => adminService.getUser(req.params.id));

export const createUser = (req: Request, res: Response) =>
  respond(
    res,
    () => {
      const input = adminCreateUserSchema.parse(req.body);
      return adminService.createUser(input);
    },
    201
  );

export const updateUser = (req: Request, res: Response) =>
  respond(res, () => {
    const input = adminUpdateUserSchema.parse(req.body);
    return adminService.updateUser(req.params.id, input);
  });

export const deleteUser = (req: Request, res: Response) =>
  respond(res, () => adminService.deleteUser(req.params.id));

export const listShops = (_req: Request, res: Response) =>
  respond(res, adminService.listShops);

export const verifyShop = (req: Request, res: Response) =>
  respond(res, () => {
    const { verified } = verifyShopSchema.parse(req.body);
    return adminService.verifyShop(req.params.id, verified);
  });

export const listFoods = (req: Request, res: Response) =>
  respond(res, () => {
    const { sellerId } = foodListQuerySchema.parse(req.query);
    return adminService.listFoods(sellerId);
  });

export const updateFood = (req: Request, res: Response) =>
  respond(res, () => {
    updateFoodSchema.parse(req.body);
    return adminService.editFood(req.params.id, req.body);
  });

export const deleteFood = (req: Request, res: Response) =>
  respond(res, () => adminService.removeFood(req.params.id));

export const listOrders = (req: Request, res: Response) =>
  respond(res, () => {
    const { status } = orderListQuerySchema.parse(req.query);
    return adminService.listOrders(status as IOrder["status"] | undefined);
  });

export const updateOrderStatus = (req: Request, res: Response) =>
  respond(res, () => {
    const { status } = updateOrderStatusSchema.parse(req.body);
    return adminService.changeOrderStatus(
      req.params.id,
      status as IOrder["status"]
    );
  });

export const listContactSubmissions = (_req: Request, res: Response) =>
  respond(res, adminService.listContactSubmissions);
