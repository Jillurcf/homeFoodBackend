"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateStatus = exports.updateStatus = exports.sellerOwnsOrder = exports.getAllOrders = exports.getSellerOrders = exports.getUserOrders = exports.getOrderById = exports.createOrder = void 0;
const orderRepository = __importStar(require("./order.repository"));
const order_events_1 = __importDefault(require("./order.events"));
const createOrder = async (payload, userId) => {
    const order = await orderRepository.createOrder({
        ...payload,
        userId,
        items: payload.items.map((item) => ({
            foodId: item.foodId,
            name: item.name ?? "Untitled item",
            price: item.price,
            quantity: item.quantity ?? item.qty ?? 1,
        })),
    });
    order_events_1.default.emit("order.created", order);
    return order;
};
exports.createOrder = createOrder;
const getOrderById = async (id) => {
    return await orderRepository.findOrderById(id);
};
exports.getOrderById = getOrderById;
const getUserOrders = async (userId) => {
    return await orderRepository.findOrdersByUser(userId);
};
exports.getUserOrders = getUserOrders;
const getSellerOrders = async (sellerId) => {
    return await orderRepository.findOrdersBySeller(sellerId);
};
exports.getSellerOrders = getSellerOrders;
const getAllOrders = async () => {
    return await orderRepository.findAllOrders();
};
exports.getAllOrders = getAllOrders;
const sellerOwnsOrder = async (sellerId, foodIds) => {
    return await orderRepository.sellerOwnsOrder(sellerId, foodIds);
};
exports.sellerOwnsOrder = sellerOwnsOrder;
const ALLOWED_TRANSITIONS = {
    PENDING: ["PREPARING", "CANCELLED"],
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["DELIVERED", "CANCELLED"],
    ON_THE_WAY: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
};
const updateStatus = async (orderId, status, sellerId) => {
    const existing = await orderRepository.findOrderById(orderId);
    if (!existing) {
        throw { status: 404, message: "Order not found" };
    }
    if (sellerId) {
        const owns = await orderRepository.sellerOwnsOrder(sellerId, existing.items.map((item) => item.foodId));
        if (!owns) {
            throw { status: 403, message: "You cannot update this order" };
        }
    }
    const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(status)) {
        throw {
            status: 400,
            message: `Cannot change order status from ${existing.status} to ${status}`,
        };
    }
    const updated = await orderRepository.updateOrderStatus(orderId, status);
    order_events_1.default.emit("order.status.updated", updated);
    return updated;
};
exports.updateStatus = updateStatus;
const adminUpdateStatus = async (orderId, status) => {
    const existing = await orderRepository.findOrderById(orderId);
    if (!existing) {
        throw { status: 404, message: "Order not found" };
    }
    const updated = await orderRepository.updateOrderStatus(orderId, status);
    order_events_1.default.emit("order.status.updated", updated);
    return updated;
};
exports.adminUpdateStatus = adminUpdateStatus;
//# sourceMappingURL=order.service.js.map