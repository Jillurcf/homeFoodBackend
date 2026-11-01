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
exports.updateStatus = exports.getMyOrders = exports.getOrderById = exports.createOrder = void 0;
const orderService = __importStar(require("./order.service"));
const order_validation_1 = require("./order.validation");
const zod_1 = require("zod");
const createOrder = async (req, res) => {
    try {
        // Zod validation
        const validatedData = order_validation_1.createOrderSchema.parse(req.body);
        const order = await orderService.createOrder(validatedData);
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
        const order = await orderService.getOrderById(req.params.orderId);
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
        const userId = req.user.id;
        const orders = await orderService.getUserOrders(userId);
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
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateStatus(req.params.orderId, status);
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
exports.updateStatus = updateStatus;
//# sourceMappingURL=order.controller.js.map