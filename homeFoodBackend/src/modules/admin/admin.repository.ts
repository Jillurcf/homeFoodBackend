import mongoose from "mongoose";
import Food from "../foods/food.model";
import FoodMaker from "../foodMakers/foodMaker.model";
import * as foodMakerRepository from "../foodMakers/foodMaker.repository";
import Order, { IOrder } from "../orders/order.model";
import User from "../../model/user/user.model";

export const getStats = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const shops = await foodMakerRepository.findAll();
  const sellerIds = [...new Set(shops.map((shop) => shop.userId.toString()))];

  const [users, foods, orders, ordersToday] = await Promise.all([
    User.countDocuments(),
    Food.countDocuments({ sellerId: { $in: sellerIds } }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
  ]);

  return { users, shops: shops.length, foods, orders, ordersToday };
};

export const findUsers = async (role?: string) => {
  const query = role ? { role } : {};
  return User.find(query)
    .select("-password -nidNumber")
    .sort({ createdAt: -1 })
    .lean();
};

export const findUserById = async (id: string) => {
  return User.findById(id)
    .select("-password")
    .lean();
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ email }).select("_id").lean<{ _id: mongoose.Types.ObjectId }>();
};

export const findUserByUsername = async (username: string) => {
  return User.findOne({ username })
    .select("_id")
    .lean<{ _id: mongoose.Types.ObjectId }>();
};

export const createUser = async (data: Record<string, unknown>) => {
  const user = await User.create(data);
  return User.findById(user._id)
    .select("-password -nidNumber")
    .lean();
};

export const updateUser = async (
  id: string,
  fields: Record<string, unknown>
) => {
  return User.findByIdAndUpdate(
    id,
    { $set: fields },
    { new: true, runValidators: true }
  )
    .select("-password -nidNumber")
    .lean();
};

export const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id)
    .select("-password -nidNumber")
    .lean();
  if (!user) return null;

  await Promise.all([
    FoodMaker.deleteMany({ userId: id }),
    Food.deleteMany({ sellerId: new mongoose.Types.ObjectId(id) }),
  ]);

  return user;
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
  const shops = await foodMakerRepository.findAll();
  return shops.map((shop) => {
    const { nidNumber: _nidNumber, ...publicShop } = shop.toObject();
    return publicShop;
  });
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

export const setUserVerification = async (userId: string, verified: boolean) => {
  if (!mongoose.isValidObjectId(userId)) return null;
  return User.findByIdAndUpdate(userId, { isVerified: verified })
    .select("-password -nidNumber")
    .lean();
};

export const findFoods = async (sellerId?: string) => {
  const activeSellerIds = await foodMakerRepository.findSellerIdsWithShops();
  const query: { sellerId: { $in: mongoose.Types.ObjectId[] } } = {
    sellerId: { $in: activeSellerIds.map((id) => new mongoose.Types.ObjectId(id)) },
  };
  if (sellerId) {
    if (!mongoose.isValidObjectId(sellerId)) {
      throw Object.assign(new Error("Invalid seller ID"), { status: 400 });
    }
    query.sellerId.$in = query.sellerId.$in.filter(
      (id) => id.toString() === sellerId
    );
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

export const deleteOrder = async (id: string) => {
  return Order.findByIdAndDelete(id).lean();
};
