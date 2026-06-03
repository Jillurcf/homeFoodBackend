import * as orderRepository from "./order.repository";
import orderEvents from "./order.events";
import { IOrder } from "./order.model";

export const createOrder = async (payload: Partial<IOrder>) => {
  const order = await orderRepository.createOrder(payload);

  orderEvents.emit("order.created", order);

  return order;
};

export const getOrderById = async (id: string) => {
  return await orderRepository.findOrderById(id);
};

export const getUserOrders = async (userId: string) => {
  return await orderRepository.findOrdersByUser(userId);
};

export const updateStatus = async (orderId: string, status: IOrder["status"]) => {
  const updated = await orderRepository.updateOrderStatus(orderId, status);

  orderEvents.emit("order.status.updated", updated);

  return updated;
};