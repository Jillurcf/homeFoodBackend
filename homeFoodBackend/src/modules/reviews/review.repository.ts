import { Types } from "mongoose";
import Review, { IReview } from "./review.model";

export const findByFoodId = async (foodId: string, limit = 20) => {
  return await Review.find({ foodId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const countByFoodId = async (foodId: string) => {
  return await Review.countDocuments({ foodId });
};

export const findById = async (id: string) => {
  return await Review.findById(id);
};

export const findByFoodIds = async (foodIds: string[]) => {
  if (!foodIds.length) return [];
  return await Review.find({ foodId: { $in: foodIds } })
    .sort({ createdAt: -1 })
    .lean();
};

export const findByBuyerFood = async (
  buyerId: string,
  foodId: string,
  orderId?: string
) => {
  const query: Record<string, unknown> = { buyerId, foodId };
  if (orderId) query.orderId = orderId;
  return await Review.findOne(query);
};

export const createReview = async (data: Partial<IReview>) => {
  return await Review.create(data);
};

export const saveReply = async (id: string, reply: string) => {
  return await Review.findByIdAndUpdate(
    id,
    { sellerReply: reply, repliedAt: new Date() },
    { new: true }
  );
};

export const getFoodRating = async (foodId: string) => {
  const [stats] = await Review.aggregate([
    { $match: { foodId: new Types.ObjectId(foodId) } },
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

export const createReviews = async (docs: Partial<IReview>[]) => {
  return await Review.insertMany(docs);
};

export const deleteByFoodIds = async (foodIds: string[]) => {
  return await Review.deleteMany({ foodId: { $in: foodIds } });
};
