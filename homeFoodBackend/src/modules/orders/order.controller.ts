// import { Request, Response } from "express";
// import * as orderService from "./order.service";
// import { createOrderSchema } from "./order.validation";

// export const createOrder = async (req: Request, res: Response) => {
//   try {
//     const { error } = createOrderSchema.validate(req.body);

//     if (error) {
//       return res.status(400).json({ message: error.message });
//     }

//     const order = await orderService.createOrder(req.body);

//     return res.status(201).json({
//       success: true,
//       data: order,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// export const getOrderById = async (req: Request, res: Response) => {
//   try {
//     const order = await orderService.getOrderById(req.params.orderId);

//     return res.json({
//       success: true,
//       data: order,
//     });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

// export const getMyOrders = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user.id;

//     const orders = await orderService.getUserOrders(userId);

//     return res.json({
//       success: true,
//       data: orders,
//     });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

// export const updateStatus = async (req: Request, res: Response) => {
//   try {
//     const { status } = req.body;

//     const order = await orderService.updateStatus(
//       req.params.orderId,
//       status
//     );

//     return res.json({
//       success: true,
//       data: order,
//     });
//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };

import { Request, Response } from "express";
import * as orderService from "./order.service";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "./order.validation";
import { ZodError } from "zod";
import { AuthRequest } from "../auth/auth.middleware";

const getAuthenticatedUser = (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (!user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }
  return user;
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const user = getAuthenticatedUser(req, res);
    if (!user) return;
    const order = await orderService.createOrder(validatedData, user.id);

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.issues,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req, res);
    if (!user) return;
    const order = await orderService.getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isBuyer = order.userId === user.id;
    const isAdmin = user.role === "admin";
    const isSeller =
      user.role === "seller" &&
      (await orderService.sellerOwnsOrder(
        user.id,
        order.items.map((item) => item.foodId)
      ));

    if (!isBuyer && !isAdmin && !isSeller) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req, res);
    if (!user) return;

    const orders = await orderService.getUserOrders(user.id);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req, res);
    if (!user) return;

    const orders =
      user.role === "admin"
        ? await orderService.getAllOrders()
        : await orderService.getSellerOrders(user.id);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = updateOrderStatusSchema.parse(req.body);
    const user = getAuthenticatedUser(req, res);
    if (!user) return;
    const sellerId = user.role === "admin" ? undefined : user.id;

    const order = await orderService.updateStatus(
      req.params.orderId,
      status,
      sellerId
    );

    return res.json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.issues,
      });
    }

    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};