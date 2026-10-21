"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrders = exports.deleteFood = exports.updateFood = exports.findFoods = exports.setShopVerification = exports.findShops = exports.updateUserRole = exports.findUsers = exports.getStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const food_model_1 = __importDefault(require("../foods/food.model"));
const foodMaker_model_1 = __importDefault(require("../foodMakers/foodMaker.model"));
const order_model_1 = __importDefault(require("../orders/order.model"));
const user_model_1 = __importDefault(require("../../model/user/user.model"));
const getStats = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [users, shops, foods, orders, ordersToday] = await Promise.all([
        user_model_1.default.countDocuments(),
        foodMaker_model_1.default.countDocuments(),
        food_model_1.default.countDocuments(),
        order_model_1.default.countDocuments(),
        order_model_1.default.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);
    return { users, shops, foods, orders, ordersToday };
};
exports.getStats = getStats;
const findUsers = async (role) => {
    const query = role ? { role } : {};
    return user_model_1.default.find(query)
        .select("-password -nidNumber")
        .sort({ createdAt: -1 })
        .lean();
};
exports.findUsers = findUsers;
const updateUserRole = async (id, role) => {
    return user_model_1.default.findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
        .select("-password -nidNumber")
        .lean();
};
exports.updateUserRole = updateUserRole;
const findShops = async () => {
    return foodMaker_model_1.default.find()
        .select("-nidNumber")
        .sort({ createdAt: -1 })
        .lean();
};
exports.findShops = findShops;
const setShopVerification = async (id, verified) => {
    return foodMaker_model_1.default.findByIdAndUpdate(id, { verified }, { new: true, runValidators: true })
        .select("-nidNumber")
        .lean();
};
exports.setShopVerification = setShopVerification;
const findFoods = async (sellerId) => {
    const query = {};
    if (sellerId) {
        if (!mongoose_1.default.isValidObjectId(sellerId)) {
            throw Object.assign(new Error("Invalid seller ID"), { status: 400 });
        }
        query.sellerId = new mongoose_1.default.Types.ObjectId(sellerId);
    }
    return food_model_1.default.find(query).sort({ createdAt: -1 }).lean();
};
exports.findFoods = findFoods;
const updateFood = async (id, fields) => {
    return food_model_1.default.findByIdAndUpdate(id, { $set: fields }, { new: true, runValidators: true }).lean();
};
exports.updateFood = updateFood;
const deleteFood = async (id) => {
    return food_model_1.default.findByIdAndDelete(id).lean();
};
exports.deleteFood = deleteFood;
const findOrders = async (status) => {
    const query = status ? { status } : {};
    return order_model_1.default.find(query).sort({ createdAt: -1 }).lean();
};
exports.findOrders = findOrders;
//# sourceMappingURL=admin.repository.js.map