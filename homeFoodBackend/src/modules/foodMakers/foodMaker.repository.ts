import FoodMaker, { IFoodMaker } from "./foodMaker.model";
import User from "../../model/user/user.model";

export const findByUserId = async (userId: string) => {
  return await FoodMaker.findOne({ userId });
};

export const findById = async (id: string) => {
  return await FoodMaker.findById(id);
};

export const findActiveSellerIds = async () => {
  const sellers = await User.find({ role: "seller" }).select("_id").lean();
  return sellers.map((seller) => seller._id.toString());
};

export const findAll = async () => {
  const sellerIds = await findActiveSellerIds();
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

export const findSellerIdsWithShops = async () => {
  const shops = await findAll();
  return [...new Set(shops.map((shop) => shop.userId.toString()))];
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
