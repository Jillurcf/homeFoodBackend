import Order, { IOrder } from "./order.model";
import Food from "../foods/food.model";

export const createOrder = async (data: Partial<IOrder>) => {
  return await Order.create(data);
};

export const findOrderById = async (id: string) => {
  return await Order.findById(id);
};

export const findOrdersByUser = async (userId: string) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

export const findAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 });
};

export const findOrdersBySeller = async (sellerId: string) => {
  // Find orders where any item belongs to this seller's food
  const foods = await Food.find({ sellerId }).select("_id");
  const foodIds = foods.map((f) => f._id.toString());
  if (foodIds.length === 0) return [];
  return await Order.find({ "items.foodId": { $in: foodIds } }).sort({ createdAt: -1 });
};

export const updateOrderStatus = async (orderId: string, status: IOrder["status"]) => {
  return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};

export const sellerOwnsOrder = async (
  sellerId: string,
  foodIds: string[]
): Promise<boolean> => {
  if (!foodIds.length) return false;
  const owned = await Food.countDocuments({
    _id: { $in: foodIds },
    sellerId,
  });
  return owned > 0;
};