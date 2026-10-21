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
exports.replyToReview = exports.createReview = exports.listSellerReviews = exports.listReviews = void 0;
const reviewRepository = __importStar(require("./review.repository"));
const food_model_1 = __importDefault(require("../foods/food.model"));
const order_model_1 = __importDefault(require("../orders/order.model"));
const user_model_1 = __importDefault(require("../../model/user/user.model"));
const syncFoodRating = async (foodId) => {
    const { rating, count } = await reviewRepository.getFoodRating(foodId);
    await food_model_1.default.findByIdAndUpdate(foodId, { rating, reviewCount: count });
};
const listReviews = async (query) => {
    const reviews = await reviewRepository.findByFoodId(query.foodId, query.limit);
    const total = await reviewRepository.countByFoodId(query.foodId);
    return { reviews, total };
};
exports.listReviews = listReviews;
const listSellerReviews = async (sellerId) => {
    const foods = await food_model_1.default.find({ sellerId }).select("_id name");
    if (foods.length === 0)
        return [];
    const foodNames = new Map(foods.map((food) => [food._id.toString(), food.name]));
    const reviews = await reviewRepository.findByFoodIds(foods.map((food) => food._id.toString()));
    return reviews.map((review) => ({
        ...review,
        foodName: foodNames.get(review.foodId.toString()) ?? "Dish",
    }));
};
exports.listSellerReviews = listSellerReviews;
const createReview = async (buyerId, input) => {
    const food = await food_model_1.default.findById(input.foodId);
    if (!food)
        throw { status: 404, message: "Food not found" };
    let area = "Dhaka";
    let order = null;
    if (input.orderId) {
        order = await order_model_1.default.findById(input.orderId);
        if (!order)
            throw { status: 404, message: "Order not found" };
        if (order.userId !== buyerId) {
            throw { status: 403, message: "You cannot review this order" };
        }
        const orderedItem = (order.items ?? []).some((item) => item.foodId === input.foodId);
        if (!orderedItem) {
            throw { status: 400, message: "This dish is not part of the order" };
        }
        const existing = await reviewRepository.findByBuyerFood(buyerId, input.foodId, input.orderId);
        if (existing) {
            throw { status: 409, message: "You already reviewed this dish" };
        }
        area = order.deliveryAddress?.area || area;
    }
    else {
        const existing = await reviewRepository.findByBuyerFood(buyerId, input.foodId);
        if (existing) {
            throw { status: 409, message: "You already reviewed this dish" };
        }
    }
    const user = await user_model_1.default.findById(buyerId);
    const text = (input.text ?? input.comment ?? "").trim();
    if (!text)
        throw { status: 400, message: "Please write a short comment" };
    const review = await reviewRepository.createReview({
        foodId: food._id,
        orderId: order?._id,
        buyerId: buyerId,
        authorName: user?.name || "Verified buyer",
        area,
        rating: input.rating,
        text,
    });
    await syncFoodRating(input.foodId);
    return review;
};
exports.createReview = createReview;
const replyToReview = async (reviewId, userId, role, reply) => {
    const review = await reviewRepository.findById(reviewId);
    if (!review)
        throw { status: 404, message: "Review not found" };
    const food = await food_model_1.default.findById(review.foodId);
    if (!food)
        throw { status: 404, message: "Food not found" };
    if (food.sellerId.toString() !== userId && role !== "admin") {
        throw { status: 403, message: "You cannot reply to this review" };
    }
    const updated = await reviewRepository.saveReply(reviewId, reply);
    return updated;
};
exports.replyToReview = replyToReview;
//# sourceMappingURL=review.service.js.map