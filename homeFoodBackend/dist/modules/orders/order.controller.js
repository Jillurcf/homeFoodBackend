"use strict";
// import { Request, Response } from "express";
// import * as orderService from "./order.service";
// import { createOrderSchema } from "./order.validation";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getSellerOrders = exports.getMyOrders = exports.getOrderById = exports.createOrder = void 0;
const orderService = __importStar(require("./order.service"));
const order_validation_1 = require("./order.validation");
const zod_1 = require("zod");
const getAuthenticatedUser = (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return null;
    }
    return user;
};
const createOrder = async (req, res) => {
    try {
        const validatedData = order_validation_1.createOrderSchema.parse(req.body);
        const user = getAuthenticatedUser(req, res);
        if (!user)
            return;
        const order = await orderService.createOrder(validatedData, user.id);
        return res.status(201).json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
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
exports.createOrder = createOrder;
const getOrderById = async (req, res) => {
    try {
        const user = getAuthenticatedUser(req, res);
        if (!user)
            return;
        const order = await orderService.getOrderById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        const isBuyer = order.userId === user.id;
        const isAdmin = user.role === "admin";
        const isSeller = user.role === "seller" &&
            (await orderService.sellerOwnsOrder(user.id, order.items.map((item) => item.foodId)));
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.getOrderById = getOrderById;
const getMyOrders = async (req, res) => {
    try {
        const user = getAuthenticatedUser(req, res);
        if (!user)
            return;
        const orders = await orderService.getUserOrders(user.id);
        return res.json({
            success: true,
            data: orders,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.getMyOrders = getMyOrders;
const getSellerOrders = async (req, res) => {
    try {
        const user = getAuthenticatedUser(req, res);
        if (!user)
            return;
        const orders = user.role === "admin"
            ? await orderService.getAllOrders()
            : await orderService.getSellerOrders(user.id);
        return res.json({
            success: true,
            data: orders,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.getSellerOrders = getSellerOrders;
const updateStatus = async (req, res) => {
    try {
        const { status } = order_validation_1.updateOrderStatusSchema.parse(req.body);
        const user = getAuthenticatedUser(req, res);
        if (!user)
            return;
        const sellerId = user.role === "admin" ? undefined : user.id;
        const order = await orderService.updateStatus(req.params.orderId, status, sellerId);
        return res.json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
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
exports.updateStatus = updateStatus;
//# sourceMappingURL=order.controller.js.map