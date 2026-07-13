import orderEvents from "../modules/orders/order.events";
import authEvents from "../modules/auth/auth.events";

export const registerEvents = () => {
  orderEvents.on("order.created", (order) => {
    console.log("Order created:", order._id);
  });

  orderEvents.on("order.status.updated", (order) => {
    console.log("Order status updated:", order.status);
  });

  authEvents.on("auth.user.registered", (user) => {
    console.log("User registered:", user.email);
  });
};