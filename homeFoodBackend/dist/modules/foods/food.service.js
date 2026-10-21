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
exports.deleteFood = exports.updateFood = exports.createFood = exports.getCategories = exports.getSellerFoods = exports.getFoodById = exports.listFoods = void 0;
const mongoose_1 = require("mongoose");
const foodRepository = __importStar(require("./food.repository"));
const reviewRepository = __importStar(require("../reviews/review.repository"));
const foodMaker_model_1 = __importDefault(require("../foodMakers/foodMaker.model"));
const food_events_1 = __importDefault(require("./food.events"));
const listFoods = async (filters) => {
    return await foodRepository.listFoods(filters);
};
exports.listFoods = listFoods;
const getFoodById = async (id) => {
    const food = await foodRepository.findFoodById(id);
    if (!food)
        return null;
    const reviews = await reviewRepository.findByFoodId(food._id.toString());
    return { ...food.toObject(), reviews };
};
exports.getFoodById = getFoodById;
const getSellerFoods = async (sellerId) => {
    return await foodRepository.findFoodsBySeller(sellerId);
};
exports.getSellerFoods = getSellerFoods;
const getCategories = async () => {
    return await foodRepository.getCategoryCounts();
};
exports.getCategories = getCategories;
const createFood = async (sellerId, payload) => {
    const shop = await foodMaker_model_1.default.findOne({ userId: sellerId });
    if (!shop) {
        throw {
            status: 403,
            message: "Set up your kitchen profile before adding dishes",
        };
    }
    const food = await foodRepository.createFood({
        ...payload,
        sellerId: new mongoose_1.Types.ObjectId(sellerId),
    });
    food_events_1.default.emit("food.created", food);
    return food;
};
exports.createFood = createFood;
const updateFood = async (id, userId, role, payload) => {
    const food = await foodRepository.findFoodById(id);
    if (!food)
        throw { status: 404, message: "Food not found" };
    if (food.sellerId.toString() !== userId && role !== "admin") {
        throw { status: 403, message: "Not authorized to modify this food" };
    }
    const updated = await foodRepository.updateFood(id, payload);
    food_events_1.default.emit("food.updated", updated);
    return updated;
};
exports.updateFood = updateFood;
const deleteFood = async (id, userId, role) => {
    const food = await foodRepository.findFoodById(id);
    if (!food)
        throw { status: 404, message: "Food not found" };
    if (food.sellerId.toString() !== userId && role !== "admin") {
        throw { status: 403, message: "Not authorized to modify this food" };
    }
    const deleted = await foodRepository.deleteFood(id);
    await reviewRepository.deleteByFoodIds([id]);
    food_events_1.default.emit("food.deleted", deleted);
    return deleted;
};
exports.deleteFood = deleteFood;
//# sourceMappingURL=food.service.js.map