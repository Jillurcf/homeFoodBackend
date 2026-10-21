"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvents = void 0;
const order_events_1 = __importDefault(require("../modules/orders/order.events"));
const auth_events_1 = __importDefault(require("../modules/auth/auth.events"));
const food_events_1 = __importDefault(require("../modules/foods/food.events"));
const registerEvents = () => {
    order_events_1.default.on("order.created", (order) => {
        console.log("Order created:", order._id);
    });
    order_events_1.default.on("order.status.updated", (order) => {
        console.log("Order status updated:", order.status);
    });
    auth_events_1.default.on("auth.user.registered", (user) => {
        console.log("User registered:", user.email);
    });
    food_events_1.default.on("food.created", (food) => {
        console.log("Food created:", food._id);
    });
    food_events_1.default.on("food.updated", (food) => {
        console.log("Food updated:", food._id);
    });
    food_events_1.default.on("food.deleted", (food) => {
        console.log("Food deleted:", food._id);
    });
};
exports.registerEvents = registerEvents;
//# sourceMappingURL=events.js.map