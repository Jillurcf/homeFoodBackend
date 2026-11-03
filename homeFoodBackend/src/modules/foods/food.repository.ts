import Food, { IFood } from "./food.model";
import { ListFoodsQuery } from "./food.validation";
import { findSellerIdsWithShops } from "../foodMakers/foodMaker.repository";

const SELLER_FIELDS = "name avatarUrl isVerified";

const buildQuery = (filters: ListFoodsQuery) => {
  const query: Record<string, any> = {};

  if (filters.category) query.category = filters.category;
  if (filters.area) query.area = filters.area;
  if (filters.sellerId) query.sellerId = filters.sellerId;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
  }

  if (filters.minRating !== undefined) query.rating = { $gte: filters.minRating };
  if (filters.inStock) query.availability = { $ne: "sold_out" };

  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    query.$or = [{ name: regex }, { description: regex }];
  }

  return query;
};

const buildSort = (sort?: ListFoodsQuery["sort"]): Record<string, 1 | -1> => {
  switch (sort) {
    case "price_asc":
      return { price: 1 as const };
    case "price_desc":
      return { price: -1 as const };
    case "rating":
      return { rating: -1 as const };
    case "newest":
    default:
      return { createdAt: -1 as const };
  }
};

export const listFoods = async (filters: ListFoodsQuery) => {
  const query = buildQuery(filters);
  const sort = buildSort(filters.sort);
  const skip = (filters.page - 1) * filters.limit;
  const activeSellerIds = await findSellerIdsWithShops();
  const sellerIds = filters.sellerId
    ? activeSellerIds.filter((sellerId) => sellerId === filters.sellerId)
    : activeSellerIds;
  if (sellerIds.length === 0) return { foods: [], total: 0 };
  query.sellerId = { $in: sellerIds };

  const [foods, total] = await Promise.all([
    Food.find(query)
      .populate("sellerId", SELLER_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(filters.limit)
      .lean(),
    Food.countDocuments(query),
  ]);

  return { foods, total };
};

export const findFoodById = async (id: string) => {
  const sellerIds = await findSellerIdsWithShops();
  if (sellerIds.length === 0) return null;
  return await Food.findOne({
    _id: id,
    sellerId: { $in: sellerIds },
  }).populate("sellerId", SELLER_FIELDS);
};

export const findFoodsByIds = async (ids: string[]) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const uniqueIds = Array.from(new Set(ids));
  return await Food.find({ _id: { $in: uniqueIds } }).populate(
    "sellerId",
    SELLER_FIELDS
  );
};

export const findFoodsBySeller = async (sellerId: string) => {
  const activeSellerIds = await findSellerIdsWithShops();
  if (!activeSellerIds.includes(sellerId)) return [];
  return await Food.find({ sellerId }).sort({ createdAt: -1 });
};

export const createFood = async (data: Partial<IFood>) => {
  return await Food.create(data);
};

export const updateFood = async (id: string, data: Partial<IFood>) => {
  return await Food.findByIdAndUpdate(id, data, { new: true });
};

export const deleteFood = async (id: string) => {
  return await Food.findByIdAndDelete(id);
};

export const getCategoryCounts = async () => {
  const sellerIds = await findSellerIdsWithShops();
  if (sellerIds.length === 0) return [];
  return await Food.aggregate([
    { $match: { sellerId: { $in: sellerIds } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
  ]);
};
