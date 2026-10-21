import orderEvents from "../modules/orders/order.events";
import authEvents from "../modules/auth/auth.events";
import foodEvents from "../modules/foods/food.events";

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

  foodEvents.on("food.created", (food) => {
    console.log("Food created:", food._id);
  });

  foodEvents.on("food.updated", (food) => {
    console.log("Food updated:", food._id);
  });

  foodEvents.on("food.deleted", (food) => {
    console.log("Food deleted:", food._id);
  });
};