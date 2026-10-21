"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerOwnsOrder = exports.updateOrderStatus = exports.findOrdersBySeller = exports.findAllOrders = exports.findOrdersByUser = exports.findOrderById = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("./order.model"));
const food_model_1 = __importDefault(require("../foods/food.model"));
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
const findAllOrders = async () => {
    return await order_model_1.default.find().sort({ createdAt: -1 });
};
exports.findAllOrders = findAllOrders;
const findOrdersBySeller = async (sellerId) => {
    // Find orders where any item belongs to this seller's food
    const foods = await food_model_1.default.find({ sellerId }).select("_id");
    const foodIds = foods.map((f) => f._id.toString());
    if (foodIds.length === 0)
        return [];
    return await order_model_1.default.find({ "items.foodId": { $in: foodIds } }).sort({ createdAt: -1 });
};
exports.findOrdersBySeller = findOrdersBySeller;
const updateOrderStatus = async (orderId, status) => {
    return await order_model_1.default.findByIdAndUpdate(orderId, { status }, { new: true });
};
exports.updateOrderStatus = updateOrderStatus;
const sellerOwnsOrder = async (sellerId, foodIds) => {
    if (!foodIds.length)
        return false;
    const owned = await food_model_1.default.countDocuments({
        _id: { $in: foodIds },
        sellerId,
    });
    return owned > 0;
};
exports.sellerOwnsOrder = sellerOwnsOrder;
//# sourceMappingURL=order.repository.js.map