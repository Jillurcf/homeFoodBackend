import * as reviewRepository from "./review.repository";
import { CreateReviewInput, ListReviewsQuery } from "./review.validation";
import Food from "../foods/food.model";
import Order from "../orders/order.model";
import User from "../../model/user/user.model";

const syncFoodRating = async (foodId: string) => {
  const { rating, count } = await reviewRepository.getFoodRating(foodId);
  await Food.findByIdAndUpdate(foodId, { rating, reviewCount: count });
};

export const listReviews = async (query: ListReviewsQuery) => {
  const reviews = await reviewRepository.findByFoodId(
    query.foodId,
    query.limit
  );
  const total = await reviewRepository.countByFoodId(query.foodId);

  return { reviews, total };
};

export const listSellerReviews = async (sellerId: string) => {
  const foods = await Food.find({ sellerId }).select("_id name");
  if (foods.length === 0) return [];

  const foodNames = new Map(
    foods.map((food) => [food._id.toString(), food.name])
  );

  const reviews = await reviewRepository.findByFoodIds(
    foods.map((food) => food._id.toString())
  );

  return reviews.map((review) => ({
    ...review,
    foodName:
      foodNames.get(review.foodId.toString()) ?? "Dish",
  }));
};

export const createReview = async (
  buyerId: string,
  input: CreateReviewInput
) => {
  const food = await Food.findById(input.foodId);
  if (!food) throw { status: 404, message: "Food not found" };

  let area = "Dhaka";
  let order: any = null;

  if (input.orderId) {
    order = await Order.findById(input.orderId);
    if (!order) throw { status: 404, message: "Order not found" };
    if (order.userId !== buyerId) {
      throw { status: 403, message: "You cannot review this order" };
    }

    const orderedItem = (order.items ?? []).some(
      (item: any) => item.foodId === input.foodId
    );
    if (!orderedItem) {
      throw { status: 400, message: "This dish is not part of the order" };
    }

    const existing = await reviewRepository.findByBuyerFood(
      buyerId,
      input.foodId,
      input.orderId
    );
    if (existing) {
      throw { status: 409, message: "You already reviewed this dish" };
    }

    area = order.deliveryAddress?.area || area;
  } else {
    const existing = await reviewRepository.findByBuyerFood(
      buyerId,
      input.foodId
    );
    if (existing) {
      throw { status: 409, message: "You already reviewed this dish" };
    }
  }

  const user = await User.findById(buyerId);
  const text = (input.text ?? input.comment ?? "").trim();
  if (!text) throw { status: 400, message: "Please write a short comment" };

  const review = await reviewRepository.createReview({
    foodId: food._id,
    orderId: order?._id,
    buyerId: buyerId as any,
    authorName: user?.name || "Verified buyer",
    area,
    rating: input.rating,
    text,
  });

  await syncFoodRating(input.foodId);

  return review;
};

export const replyToReview = async (
  reviewId: string,
  userId: string,
  role: string,
  reply: string
) => {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw { status: 404, message: "Review not found" };

  const food = await Food.findById(review.foodId);
  if (!food) throw { status: 404, message: "Food not found" };

  if (food.sellerId.toString() !== userId && role !== "admin") {
    throw { status: 403, message: "You cannot reply to this review" };
  }

  const updated = await reviewRepository.saveReply(reviewId, reply);
  return updated;
};
