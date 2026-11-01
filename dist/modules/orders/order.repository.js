"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.findOrdersByUser = exports.findOrderById = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("./order.model"));
const createOrder = async (data) => {
    return await order_model_1.default.create(data);
};
exports.createOrder = createOrder;
const findOrderById = async (id) => {
    return await order_model_1.default.findById(id);
};
exports.findOrderById = findOrderById;
const findOrdersByUser = async (userId) => {
    return await order_model_1.default.find({ userId }).sort({ createdAt: -1 });
};
exports.findOrdersByUser = findOrdersByUser;
const updateOrderStatus = async (orderId, status) => {
    return await order_model_1.default.findByIdAndUpdate(orderId, { status }, { new: true });
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=order.repository.js.map