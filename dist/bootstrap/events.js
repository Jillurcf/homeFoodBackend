"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvents = void 0;
const order_events_1 = __importDefault(require("../modules/orders/order.events"));
const registerEvents = () => {
    order_events_1.default.on("order.created", (order) => {
        console.log("Order created:", order._id);
    });
    order_events_1.default.on("order.status.updated", (order) => {
        console.log("Order status updated:", order.status);
    });
};
exports.registerEvents = registerEvents;
//# sourceMappingURL=events.js.map