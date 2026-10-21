import orderEvents from "../modules/orders/order.events";

export const registerEvents = () => {
  orderEvents.on("order.created", (order) => {
    console.log("Order created:", order._id);
  });

  orderEvents.on("order.status.updated", (order) => {
    console.log("Order status updated:", order.status);
  });
};