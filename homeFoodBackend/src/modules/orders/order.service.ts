import * as orderRepository from "./order.repository";
import orderEvents from "./order.events";
import { IOrder } from "./order.model";
import { CreateOrderInput } from "./order.validation";

export const createOrder = async (payload: CreateOrderInput, userId: string) => {
  const order = await orderRepository.createOrder({
    ...payload,
    userId,
    items: payload.items.map((item) => ({
      foodId: item.foodId,
      name: item.name ?? "Untitled item",
      price: item.price,
      quantity: item.quantity ?? item.qty ?? 1,
    })),
  });

  orderEvents.emit("order.created", order);

  return order;
};

export const getOrderById = async (id: string) => {
  return await orderRepository.findOrderById(id);
};

export const getUserOrders = async (userId: string) => {
  return await orderRepository.findOrdersByUser(userId);
};

export const getSellerOrders = async (sellerId: string) => {
  return await orderRepository.findOrdersBySeller(sellerId);
};

export const getAllOrders = async () => {
  return await orderRepository.findAllOrders();
};

export const sellerOwnsOrder = async (sellerId: string, foodIds: string[]) => {
  return await orderRepository.sellerOwnsOrder(sellerId, foodIds);
};

const ALLOWED_TRANSITIONS: Record<IOrder["status"], IOrder["status"][]> = {
  PENDING: ["PREPARING", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["DELIVERED", "CANCELLED"],
  ON_THE_WAY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const updateStatus = async (
  orderId: string,
  status: IOrder["status"],
  sellerId?: string
) => {
  const existing = await orderRepository.findOrderById(orderId);
  if (!existing) {
    throw { status: 404, message: "Order not found" };
  }

  if (sellerId) {
    const owns = await orderRepository.sellerOwnsOrder(
      sellerId,
      existing.items.map((item) => item.foodId)
    );
    if (!owns) {
      throw { status: 403, message: "You cannot update this order" };
    }
  }

  const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(status)) {
    throw {
      status: 400,
      message: `Cannot change order status from ${existing.status} to ${status}`,
    };
  }

  const updated = await orderRepository.updateOrderStatus(orderId, status);

  orderEvents.emit("order.status.updated", updated);

  return updated;
};

export const adminUpdateStatus = async (
  orderId: string,
  status: IOrder["status"]
) => {
  const existing = await orderRepository.findOrderById(orderId);
  if (!existing) {
    throw { status: 404, message: "Order not found" };
  }

  const updated = await orderRepository.updateOrderStatus(orderId, status);
  orderEvents.emit("order.status.updated", updated);
  return updated;
};