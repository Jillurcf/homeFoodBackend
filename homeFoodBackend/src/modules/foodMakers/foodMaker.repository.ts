import FoodMaker, { IFoodMaker } from "./foodMaker.model";
import User from "../../model/user/user.model";

export const findByUserId = async (userId: string) => {
  return await FoodMaker.findOne({ userId });
};

export const findById = async (id: string) => {
  return await FoodMaker.findById(id);
};

export const findAll = async () => {
  const sellers = await User.find({ role: "seller" }).select("_id").lean();
  const sellerIds = sellers.map((seller) => seller._id.toString());
  if (sellerIds.length === 0) return [];

  const shops = await FoodMaker.find({ userId: { $in: sellerIds } }).sort({
    createdAt: -1,
  });
  const seenUserIds = new Set<string>();

  return shops.filter((shop) => {
    const userId = shop.userId.toString();
    if (seenUserIds.has(userId)) return false;
    seenUserIds.add(userId);
    return true;
  });
};

export const createShop = async (userId: string, data: Partial<IFoodMaker> & { acceptedTerms?: boolean; termsVersion?: string }) => {
  const { acceptedTerms, termsVersion, ...shopData } = data as Record<string, unknown>;
  return await FoodMaker.create({ ...shopData, userId });
};

export const updateByUserId = async (
  userId: string,
  data: Partial<IFoodMaker> & { acceptedTerms?: boolean; termsVersion?: string }
) => {
  const { acceptedTerms, termsVersion, ...shopData } = data as Record<string, unknown>;
  return await FoodMaker.findOneAndUpdate(
    { userId },
    { $set: shopData },
    { new: true, runValidators: true }
  );
};
