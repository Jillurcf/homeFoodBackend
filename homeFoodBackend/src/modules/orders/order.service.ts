import * as orderRepository from "./order.repository";
import orderEvents from "./order.events";
import { IOrder } from "./order.model";
import { CreateOrderInput } from "./order.validation";
import * as notificationService from "../notifications/notification.service";

const notifyOrderPlaced = async (order: IOrder) => {
  try {
    await notificationService.notifyOrderPlaced(order);
  } catch (error) {
    console.error("Failed to notify sellers about a new order:", error);
  }
};

const notifyOrderStatusChange = async (
  order: IOrder,
  previousStatus: IOrder["status"],
  actorId?: string
) => {
  try {
    await notificationService.notifyOrderStatusChange(
      order,
      previousStatus,
      actorId
    );
  } catch (error) {
    console.error("Failed to notify order participants:", error);
  }
};

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
  await notifyOrderPlaced(order);

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
  PREPARING: ["ON_THE_WAY", "CANCELLED"],
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

  if (sellerId && status === "DELIVERED") {
    throw {
      status: 400,
      message: "Only the buyer can confirm that an order was received",
    };
  }

  const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(status)) {
    throw {
      status: 400,
      message: `Cannot change order status from ${existing.status} to ${status}`,
    };
  }

  const updated = await orderRepository.updateOrderStatus(orderId, status);
  if (!updated) {
    throw { status: 404, message: "Order not found" };
  }

  orderEvents.emit("order.status.updated", updated, existing.status, sellerId);
  await notifyOrderStatusChange(updated, existing.status, sellerId);

  return updated;
};

export const receiveOrder = async (orderId: string, buyerId: string) => {
  const existing = await orderRepository.findOrderById(orderId);

  if (!existing) {
    throw { status: 404, message: "Order not found" };
  }

  if (String(existing.userId) !== buyerId) {
    throw { status: 403, message: "You cannot confirm this order" };
  }

  if (existing.status !== "ON_THE_WAY") {
    throw {
      status: 400,
      message: `Cannot confirm receipt while the order is ${existing.status}`,
    };
  }

  const updated = await orderRepository.updateOrderStatus(orderId, "DELIVERED");
  if (!updated) {
    throw { status: 404, message: "Order not found" };
  }

  orderEvents.emit(
    "order.status.updated",
    updated,
    existing.status,
    buyerId
  );
  await notifyOrderStatusChange(updated, existing.status, buyerId);

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
  if (!updated) {
    throw { status: 404, message: "Order not found" };
  }
  orderEvents.emit("order.status.updated", updated, existing.status);
  await notifyOrderStatusChange(updated, existing.status);
  return updated;
};