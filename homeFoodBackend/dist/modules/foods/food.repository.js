"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryCounts = exports.deleteFood = exports.updateFood = exports.createFood = exports.findFoodsBySeller = exports.findFoodsByIds = exports.findFoodById = exports.listFoods = void 0;
const food_model_1 = __importDefault(require("./food.model"));
const SELLER_FIELDS = "name avatarUrl isVerified";
const buildQuery = (filters) => {
    const query = {};
    if (filters.category)
        query.category = filters.category;
    if (filters.area)
        query.area = filters.area;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined)
            query.price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined)
            query.price.$lte = filters.maxPrice;
    }
    if (filters.minRating !== undefined)
        query.rating = { $gte: filters.minRating };
    if (filters.inStock)
        query.availability = { $ne: "sold_out" };
    if (filters.search) {
        const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");
        query.$or = [{ name: regex }, { description: regex }];
    }
    return query;
};
const buildSort = (sort) => {
    switch (sort) {
        case "price_asc":
            return { price: 1 };
        case "price_desc":
            return { price: -1 };
        case "rating":
            return { rating: -1 };
        case "newest":
        default:
            return { createdAt: -1 };
    }
};
const listFoods = async (filters) => {
    const query = buildQuery(filters);
    const sort = buildSort(filters.sort);
    const skip = (filters.page - 1) * filters.limit;
    const [foods, total] = await Promise.all([
        food_model_1.default.find(query)
            .populate("sellerId", SELLER_FIELDS)
            .sort(sort)
            .skip(skip)
            .limit(filters.limit)
            .lean(),
        food_model_1.default.countDocuments(query),
    ]);
    return { foods, total };
};
exports.listFoods = listFoods;
const findFoodById = async (id) => {
    return await food_model_1.default.findById(id).populate("sellerId", SELLER_FIELDS);
};
exports.findFoodById = findFoodById;
const findFoodsByIds = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0)
        return [];
    const uniqueIds = Array.from(new Set(ids));
    return await food_model_1.default.find({ _id: { $in: uniqueIds } }).populate("sellerId", SELLER_FIELDS);
};
exports.findFoodsByIds = findFoodsByIds;
const findFoodsBySeller = async (sellerId) => {
    return await food_model_1.default.find({ sellerId }).sort({ createdAt: -1 });
};
exports.findFoodsBySeller = findFoodsBySeller;
const createFood = async (data) => {
    return await food_model_1.default.create(data);
};
exports.createFood = createFood;
const updateFood = async (id, data) => {
    return await food_model_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateFood = updateFood;
const deleteFood = async (id) => {
    return await food_model_1.default.findByIdAndDelete(id);
};
exports.deleteFood = deleteFood;
const getCategoryCounts = async () => {
    return await food_model_1.default.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
    ]);
};
exports.getCategoryCounts = getCategoryCounts;
//# sourceMappingURL=food.repository.js.map