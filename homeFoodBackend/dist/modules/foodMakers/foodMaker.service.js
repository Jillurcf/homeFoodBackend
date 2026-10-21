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
exports.getMyStats = exports.toPublicShop = exports.getPublicShop = exports.saveMyShop = exports.getMyShop = void 0;
const foodMakerRepository = __importStar(require("./foodMaker.repository"));
const order_model_1 = __importDefault(require("../orders/order.model"));
const food_model_1 = __importDefault(require("../foods/food.model"));
const review_model_1 = __importDefault(require("../reviews/review.model"));
const user_model_1 = __importDefault(require("../../model/user/user.model"));
const getMyShop = async (userId) => {
    return await foodMakerRepository.findByUserId(userId);
};
exports.getMyShop = getMyShop;
const saveMyShop = async (userId, input) => {
    const existing = await foodMakerRepository.findByUserId(userId);
    const shop = existing
        ? await foodMakerRepository.updateByUserId(userId, input)
        : await foodMakerRepository.createShop(userId, input);
    await user_model_1.default.findByIdAndUpdate(userId, { role: "seller" });
    return shop;
};
exports.saveMyShop = saveMyShop;
const getPublicShop = async (shopId) => {
    return await foodMakerRepository.findById(shopId);
};
exports.getPublicShop = getPublicShop;
const toPublicShop = (shop) => {
    const { nidNumber, ...publicShop } = shop.toObject();
    return publicShop;
};
exports.toPublicShop = toPublicShop;
const getMyStats = async (sellerId) => {
    // Find foods belonging to this seller
    const foods = await food_model_1.default.find({ sellerId }).select("_id name");
    const foodIds = foods.map((f) => f._id.toString());
    const foodIdSet = new Set(foodIds);
    // Find orders containing any of these foods
    let orders = [];
    if (foodIds.length > 0) {
        orders = await order_model_1.default.find({ "items.foodId": { $in: foodIds } });
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayMs = startOfDay.getTime();
    // Only count the seller's share of each order (multi-seller safe)
    const sellerTotal = (order) => (order.items || []).reduce((sum, item) => {
        if (!foodIdSet.has(item.foodId))
            return sum;
        return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
    const todayOrders = orders.filter((o) => {
        const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return created >= startOfDayMs && o.status !== "CANCELLED";
    });
    const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING").length;
    const completedOrders = orders.filter((o) => o.status === "DELIVERED");
    const completedToday = completedOrders.filter((o) => {
        const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return created >= startOfDayMs;
    });
    const todayEarnings = completedToday.reduce((sum, o) => sum + sellerTotal(o), 0);
    const totalEarnings = completedOrders.reduce((sum, o) => sum + sellerTotal(o), 0);
    // Calculate popular foods by quantity sold (completed orders)
    const soldCount = new Map();
    for (const order of completedOrders) {
        for (const item of order.items || []) {
            if (!foodIdSet.has(item.foodId))
                continue;
            soldCount.set(item.foodId, (soldCount.get(item.foodId) || 0) + (item.quantity || 1));
        }
    }
    const popular = [...soldCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([foodId, qty]) => ({
        foodId,
        name: foods.find((f) => f._id.toString() === foodId)?.name || "Dish",
        qty,
    }));
    // Get avg rating from reviews for seller's foods
    let avgRating = 0;
    if (foodIds.length > 0) {
        const reviews = await review_model_1.default.find({ foodId: { $in: foodIds } });
        if (reviews.length > 0) {
            avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
        }
    }
    return {
        todayOrders: todayOrders.length,
        pending: pendingOrders,
        completed: completedOrders.length,
        todayEarnings,
        totalEarnings,
        avgRating: Number(avgRating.toFixed(1)),
        popularFoods: popular,
    };
};
exports.getMyStats = getMyStats;
//# sourceMappingURL=foodMaker.service.js.map