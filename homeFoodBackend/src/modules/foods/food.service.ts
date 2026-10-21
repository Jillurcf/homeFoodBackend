import { Types } from "mongoose";
import * as foodRepository from "./food.repository";
import * as reviewRepository from "../reviews/review.repository";
import FoodMaker from "../foodMakers/foodMaker.model";
import foodEvents from "./food.events";
import { CreateFoodInput, UpdateFoodInput } from "./food.validation";

export const listFoods = async (filters: import("./food.validation").ListFoodsQuery) => {
  return await foodRepository.listFoods(filters);
};

export const getFoodById = async (id: string) => {
  const food = await foodRepository.findFoodById(id);
  if (!food) return null;

  const reviews = await reviewRepository.findByFoodId(food._id.toString());

  return { ...food.toObject(), reviews };
};

export const getSellerFoods = async (sellerId: string) => {
  return await foodRepository.findFoodsBySeller(sellerId);
};

export const getCategories = async () => {
  return await foodRepository.getCategoryCounts();
};

export const createFood = async (sellerId: string, payload: CreateFoodInput) => {
  const shop = await FoodMaker.findOne({ userId: sellerId });
  if (!shop) {
    throw {
      status: 403,
      message: "Set up your kitchen profile before adding dishes",
    };
  }

  const food = await foodRepository.createFood({
    ...payload,
    sellerId: new Types.ObjectId(sellerId),
  });

  foodEvents.emit("food.created", food);

  return food;
};

export const updateFood = async (
  id: string,
  userId: string,
  role: string,
  payload: UpdateFoodInput
) => {
  const food = await foodRepository.findFoodById(id);
  if (!food) throw { status: 404, message: "Food not found" };
  if (food.sellerId.toString() !== userId && role !== "admin") {
    throw { status: 403, message: "Not authorized to modify this food" };
  }

  const updated = await foodRepository.updateFood(id, payload);

  foodEvents.emit("food.updated", updated);

  return updated;
};

export const deleteFood = async (id: string, userId: string, role: string) => {
  const food = await foodRepository.findFoodById(id);
  if (!food) throw { status: 404, message: "Food not found" };
  if (food.sellerId.toString() !== userId && role !== "admin") {
    throw { status: 403, message: "Not authorized to modify this food" };
  }

  const deleted = await foodRepository.deleteFood(id);

  await reviewRepository.deleteByFoodIds([id]);

  foodEvents.emit("food.deleted", deleted);

  return deleted;
};
