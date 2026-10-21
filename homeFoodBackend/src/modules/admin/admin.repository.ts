import mongoose from "mongoose";
import Food from "../foods/food.model";
import FoodMaker from "../foodMakers/foodMaker.model";
import Order, { IOrder } from "../orders/order.model";
import User from "../../model/user/user.model";

export const getStats = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [users, shops, foods, orders, ordersToday] = await Promise.all([
    User.countDocuments(),
    FoodMaker.countDocuments(),
    Food.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
  ]);

  return { users, shops, foods, orders, ordersToday };
};

export const findUsers = async (role?: string) => {
  const query = role ? { role } : {};
  return User.find(query)
    .select("-password -nidNumber")
    .sort({ createdAt: -1 })
    .lean();
};

export const updateUserRole = async (
  id: string,
  role: "buyer" | "seller" | "admin"
) => {
  return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
    .select("-password -nidNumber")
    .lean();
};

export const findShops = async () => {
  return FoodMaker.find()
    .select("-nidNumber")
    .sort({ createdAt: -1 })
    .lean();
};

export const setShopVerification = async (id: string, verified: boolean) => {
  return FoodMaker.findByIdAndUpdate(
    id,
    { verified },
    { new: true, runValidators: true }
  )
    .select("-nidNumber")
    .lean();
};

export const findFoods = async (sellerId?: string) => {
  const query: { sellerId?: mongoose.Types.ObjectId } = {};
  if (sellerId) {
    if (!mongoose.isValidObjectId(sellerId)) {
      throw Object.assign(new Error("Invalid seller ID"), { status: 400 });
    }
    query.sellerId = new mongoose.Types.ObjectId(sellerId);
  }
  return Food.find(query).sort({ createdAt: -1 }).lean();
};

export const updateFood = async (id: string, fields: Record<string, unknown>) => {
  return Food.findByIdAndUpdate(
    id,
    { $set: fields },
    { new: true, runValidators: true }
  ).lean();
};

export const deleteFood = async (id: string) => {
  return Food.findByIdAndDelete(id).lean();
};

export const findOrders = async (status?: IOrder["status"]) => {
  const query = status ? { status } : {};
  return Order.find(query).sort({ createdAt: -1 }).lean();
};
