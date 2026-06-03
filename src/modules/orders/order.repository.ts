import Order, { IOrder } from "./order.model";

export const createOrder = async (data: Partial<IOrder>) => {
  return await Order.create(data);
};

export const findOrderById = async (id: string) => {
  return await Order.findById(id);
};

export const findOrdersByUser = async (userId: string) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

export const updateOrderStatus = async (orderId: string, status: IOrder["status"]) => {
  return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};