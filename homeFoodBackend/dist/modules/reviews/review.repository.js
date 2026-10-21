"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteByFoodIds = exports.createReviews = exports.getFoodRating = exports.saveReply = exports.createReview = exports.findByBuyerFood = exports.findByFoodIds = exports.findById = exports.countByFoodId = exports.findByFoodId = void 0;
const mongoose_1 = require("mongoose");
const review_model_1 = __importDefault(require("./review.model"));
const findByFoodId = async (foodId, limit = 20) => {
    return await review_model_1.default.find({ foodId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
exports.findByFoodId = findByFoodId;
const countByFoodId = async (foodId) => {
    return await review_model_1.default.countDocuments({ foodId });
};
exports.countByFoodId = countByFoodId;
const findById = async (id) => {
    return await review_model_1.default.findById(id);
};
exports.findById = findById;
const findByFoodIds = async (foodIds) => {
    if (!foodIds.length)
        return [];
    return await review_model_1.default.find({ foodId: { $in: foodIds } })
        .sort({ createdAt: -1 })
        .lean();
};
exports.findByFoodIds = findByFoodIds;
const findByBuyerFood = async (buyerId, foodId, orderId) => {
    const query = { buyerId, foodId };
    if (orderId)
        query.orderId = orderId;
    return await review_model_1.default.findOne(query);
};
exports.findByBuyerFood = findByBuyerFood;
const createReview = async (data) => {
    return await review_model_1.default.create(data);
};
exports.createReview = createReview;
const saveReply = async (id, reply) => {
    return await review_model_1.default.findByIdAndUpdate(id, { sellerReply: reply, repliedAt: new Date() }, { new: true });
};
exports.saveReply = saveReply;
const getFoodRating = async (foodId) => {
    const [stats] = await review_model_1.default.aggregate([
        { $match: { foodId: new mongoose_1.Types.ObjectId(foodId) } },
        {
            $group: {
                _id: "$foodId",
                avg: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);
    return {
        rating: stats ? Number(stats.avg.toFixed(1)) : 0,
        count: stats?.count ?? 0,
    };
};
exports.getFoodRating = getFoodRating;
const createReviews = async (docs) => {
    return await review_model_1.default.insertMany(docs);
};
exports.createReviews = createReviews;
const deleteByFoodIds = async (foodIds) => {
    return await review_model_1.default.deleteMany({ foodId: { $in: foodIds } });
};
exports.deleteByFoodIds = deleteByFoodIds;
//# sourceMappingURL=review.repository.js.map