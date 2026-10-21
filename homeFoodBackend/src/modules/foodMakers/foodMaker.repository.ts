import FoodMaker, { IFoodMaker } from "./foodMaker.model";

export const findByUserId = async (userId: string) => {
  return await FoodMaker.findOne({ userId });
};

export const findById = async (id: string) => {
  return await FoodMaker.findById(id);
};

export const createShop = async (userId: string, data: Partial<IFoodMaker>) => {
  return await FoodMaker.create({ ...data, userId });
};

export const updateByUserId = async (
  userId: string,
  data: Partial<IFoodMaker>
) => {
  return await FoodMaker.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }
  );
};
