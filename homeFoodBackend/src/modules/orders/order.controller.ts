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
import { createOrderSchema } from "./order.validation";
import { ZodError } from "zod";

export const createOrder = async (req: Request, res: Response) => {
  try {
    // Zod validation
    const validatedData = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder(validatedData);

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
    const order = await orderService.getOrderById(req.params.orderId);

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
    const userId = (req as any).user.id;

    const orders = await orderService.getUserOrders(userId);

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
    const { status } = req.body;

    const order = await orderService.updateStatus(
      req.params.orderId,
      status
    );

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