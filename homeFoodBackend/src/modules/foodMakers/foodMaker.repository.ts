import FoodMaker, { IFoodMaker } from "./foodMaker.model";

export const findByUserId = async (userId: string) => {
  return await FoodMaker.findOne({ userId });
};

export const findById = async (id: string) => {
  return await FoodMaker.findById(id);
};

export const findAll = async () => {
  return await FoodMaker.find().sort({ createdAt: -1 });
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
