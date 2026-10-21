import { IFoodMaker } from "./foodMaker.model";
import * as foodMakerRepository from "./foodMaker.repository";
import { ShopInput } from "./foodMaker.validation";
import Order from "../orders/order.model";
import Food from "../foods/food.model";
import Review from "../reviews/review.model";
import User from "../../model/user/user.model";

export const getMyShop = async (userId: string) => {
  return await foodMakerRepository.findByUserId(userId);
};

export const saveMyShop = async (userId: string, input: ShopInput) => {
  const existing = await foodMakerRepository.findByUserId(userId);

  const shop = existing
    ? await foodMakerRepository.updateByUserId(userId, input)
    : await foodMakerRepository.createShop(userId, input);

  await User.findByIdAndUpdate(userId, { role: "seller" });

  return shop;
};

export const getPublicShop = async (shopId: string) => {
  return await foodMakerRepository.findById(shopId);
};

export const toPublicShop = (shop: IFoodMaker) => {
  const { nidNumber, ...publicShop } = shop.toObject();
  return publicShop;
};

export const getMyStats = async (sellerId: string) => {
  // Find foods belonging to this seller
  const foods = await Food.find({ sellerId }).select("_id name");
  const foodIds = foods.map((f) => f._id.toString());
  const foodIdSet = new Set(foodIds);

  // Find orders containing any of these foods
  let orders: any[] = [];
  if (foodIds.length > 0) {
    orders = await Order.find({ "items.foodId": { $in: foodIds } });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayMs = startOfDay.getTime();

  // Only count the seller's share of each order (multi-seller safe)
  const sellerTotal = (order: any) =>
    (order.items || []).reduce((sum: number, item: any) => {
      if (!foodIdSet.has(item.foodId)) return sum;
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);

  const todayOrders = orders.filter((o) => {
    const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return created >= startOfDayMs && o.status !== "CANCELLED";
  });

  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PREPARING"
  ).length;

  const completedOrders = orders.filter((o) => o.status === "DELIVERED");
  const completedToday = completedOrders.filter((o) => {
    const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return created >= startOfDayMs;
  });

  const todayEarnings = completedToday.reduce(
    (sum, o) => sum + sellerTotal(o),
    0
  );
  const totalEarnings = completedOrders.reduce(
    (sum, o) => sum + sellerTotal(o),
    0
  );

  // Calculate popular foods by quantity sold (completed orders)
  const soldCount = new Map<string, number>();
  for (const order of completedOrders) {
    for (const item of order.items || []) {
      if (!foodIdSet.has(item.foodId)) continue;
      soldCount.set(item.foodId, (soldCount.get(item.foodId) || 0) + (item.quantity || 1));
    }
  }
  const popular = [...soldCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([foodId, qty]) => ({
      foodId,
      name: foods.find((f) => f._id.toString() === foodId)?.name || "Dish",
      qty,
    }));

  // Get avg rating from reviews for seller's foods
  let avgRating = 0;
  if (foodIds.length > 0) {
    const reviews = await Review.find({ foodId: { $in: foodIds } });
    if (reviews.length > 0) {
      avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length;
    }
  }

  return {
    todayOrders: todayOrders.length,
    pending: pendingOrders,
    completed: completedOrders.length,
    todayEarnings,
    totalEarnings,
    avgRating: Number(avgRating.toFixed(1)),
    popularFoods: popular,
  };
};
