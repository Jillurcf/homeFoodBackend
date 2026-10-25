"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const orderRepository = __importStar(require("../order.repository"));
const order_events_1 = __importDefault(require("../order.events"));
const orderService = __importStar(require("../order.service"));
const notificationService = __importStar(require("../../notifications/notification.service"));
vitest_1.vi.mock("../order.repository", () => ({
    createOrder: vitest_1.vi.fn(),
    findOrderById: vitest_1.vi.fn(),
    findOrdersByUser: vitest_1.vi.fn(),
    findOrdersBySeller: vitest_1.vi.fn(),
    findAllOrders: vitest_1.vi.fn(),
    sellerOwnsOrder: vitest_1.vi.fn(),
    updateOrderStatus: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../../notifications/notification.service", () => ({
    notifyOrderPlaced: vitest_1.vi.fn(),
    notifyOrderStatusChange: vitest_1.vi.fn(),
}));
const pendingOrder = {
    status: "PENDING",
    items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
};
(0, vitest_1.describe)("order status ownership", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(orderRepository.findOrderById).mockResolvedValue(pendingOrder);
        vitest_1.vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(false);
        vitest_1.vi.mocked(orderRepository.updateOrderStatus).mockResolvedValue(pendingOrder);
        vitest_1.vi.mocked(notificationService.notifyOrderStatusChange).mockResolvedValue(0);
    });
    (0, vitest_1.it)("blocks status changes when the seller owns none of the order's foods", async () => {
        await (0, vitest_1.expect)(orderService.updateStatus("order-1", "PREPARING", "seller-1")).rejects.toMatchObject({ status: 403 });
        (0, vitest_1.expect)(orderRepository.sellerOwnsOrder).toHaveBeenCalledWith("seller-1", [
            "food-1",
        ]);
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("allows an owning seller to make a valid status transition", async () => {
        vitest_1.vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
        await orderService.updateStatus("order-1", "PREPARING", "seller-1");
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).toHaveBeenCalledWith("order-1", "PREPARING");
    });
    (0, vitest_1.it)("waits for status notifications to be persisted before returning", async () => {
        vitest_1.vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
        let finishNotification;
        const notificationWrite = new Promise((resolve) => {
            finishNotification = resolve;
        });
        vitest_1.vi.mocked(notificationService.notifyOrderStatusChange).mockReturnValue(notificationWrite);
        let updateFinished = false;
        const update = orderService
            .updateStatus("order-1", "PREPARING", "seller-1")
            .then(() => {
            updateFinished = true;
        });
        await vitest_1.vi.waitFor(() => (0, vitest_1.expect)(notificationService.notifyOrderStatusChange).toHaveBeenCalledWith(pendingOrder, "PENDING", "seller-1"));
        (0, vitest_1.expect)(updateFinished).toBe(false);
        finishNotification(1);
        await update;
        (0, vitest_1.expect)(updateFinished).toBe(true);
    });
    (0, vitest_1.it)("rejects transitions that are not allowed", async () => {
        vitest_1.vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
        await (0, vitest_1.expect)(orderService.updateStatus("order-1", "DELIVERED", "seller-1")).rejects.toMatchObject({ status: 400 });
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("lets admin override the transition while preserving order lookup", async () => {
        await orderService.adminUpdateStatus("order-1", "DELIVERED");
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).toHaveBeenCalledWith("order-1", "DELIVERED");
        (0, vitest_1.expect)(orderRepository.sellerOwnsOrder).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("lets a seller mark a preparing order out for delivery", async () => {
        vitest_1.vi.mocked(orderRepository.findOrderById).mockResolvedValue({
            ...pendingOrder,
            status: "PREPARING",
        });
        vitest_1.vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
        await orderService.updateStatus("order-1", "ON_THE_WAY", "seller-1");
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).toHaveBeenCalledWith("order-1", "ON_THE_WAY");
    });
    (0, vitest_1.it)("does not let a seller mark an order as delivered", async () => {
        vitest_1.vi.mocked(orderRepository.findOrderById).mockResolvedValue({
            ...pendingOrder,
            status: "PREPARING",
        });
        vitest_1.vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
        await (0, vitest_1.expect)(orderService.updateStatus("order-1", "DELIVERED", "seller-1")).rejects.toMatchObject({ status: 400 });
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("includes the previous status and actor in status update events", async () => {
        vitest_1.vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
        const emit = vitest_1.vi.spyOn(order_events_1.default, "emit");
        await orderService.updateStatus("order-1", "PREPARING", "seller-1");
        (0, vitest_1.expect)(emit).toHaveBeenCalledWith("order.status.updated", pendingOrder, "PENDING", "seller-1");
    });
});
(0, vitest_1.describe)("buyer receipt confirmation", () => {
    const onTheWayOrder = {
        _id: "order-1",
        userId: "buyer-1",
        status: "ON_THE_WAY",
        items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
        totalAmount: 10,
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(notificationService.notifyOrderStatusChange).mockResolvedValue(0);
    });
    (0, vitest_1.it)("returns not found when the order does not exist", async () => {
        vitest_1.vi.mocked(orderRepository.findOrderById).mockResolvedValue(null);
        await (0, vitest_1.expect)(orderService.receiveOrder("order-1", "buyer-1")).rejects.toMatchObject({ status: 404 });
    });
    (0, vitest_1.it)("rejects buyers who do not own the order", async () => {
        vitest_1.vi.mocked(orderRepository.findOrderById).mockResolvedValue(onTheWayOrder);
        await (0, vitest_1.expect)(orderService.receiveOrder("order-1", "buyer-2")).rejects.toMatchObject({ status: 403 });
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("rejects receipt confirmation before the order is out for delivery", async () => {
        vitest_1.vi.mocked(orderRepository.findOrderById).mockResolvedValue({
            ...onTheWayOrder,
            status: "PREPARING",
        });
        await (0, vitest_1.expect)(orderService.receiveOrder("order-1", "buyer-1")).rejects.toMatchObject({ status: 400 });
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("marks the buyer's out-for-delivery order as delivered", async () => {
        vitest_1.vi.mocked(orderRepository.findOrderById).mockResolvedValue(onTheWayOrder);
        vitest_1.vi.mocked(orderRepository.updateOrderStatus).mockResolvedValue({
            ...onTheWayOrder,
            status: "DELIVERED",
        });
        const emit = vitest_1.vi.spyOn(order_events_1.default, "emit");
        await orderService.receiveOrder("order-1", "buyer-1");
        (0, vitest_1.expect)(orderRepository.updateOrderStatus).toHaveBeenCalledWith("order-1", "DELIVERED");
        (0, vitest_1.expect)(emit).toHaveBeenCalledWith("order.status.updated", vitest_1.expect.objectContaining({ status: "DELIVERED" }), "ON_THE_WAY", "buyer-1");
        (0, vitest_1.expect)(notificationService.notifyOrderStatusChange).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ status: "DELIVERED" }), "ON_THE_WAY", "buyer-1");
    });
});
(0, vitest_1.describe)("order creation notifications", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(notificationService.notifyOrderPlaced).mockResolvedValue(0);
    });
    (0, vitest_1.it)("waits for seller notifications to be persisted before returning", async () => {
        const createdOrder = {
            ...pendingOrder,
            _id: "order-1",
            userId: "buyer-1",
        };
        vitest_1.vi.mocked(orderRepository.createOrder).mockResolvedValue(createdOrder);
        let finishNotification;
        const notificationWrite = new Promise((resolve) => {
            finishNotification = resolve;
        });
        vitest_1.vi.mocked(notificationService.notifyOrderPlaced).mockReturnValue(notificationWrite);
        let creationFinished = false;
        const creation = orderService
            .createOrder({ items: [] }, "buyer-1")
            .then(() => {
            creationFinished = true;
        });
        await vitest_1.vi.waitFor(() => (0, vitest_1.expect)(notificationService.notifyOrderPlaced).toHaveBeenCalledWith(createdOrder));
        (0, vitest_1.expect)(creationFinished).toBe(false);
        finishNotification(1);
        await creation;
        (0, vitest_1.expect)(creationFinished).toBe(true);
    });
});
//# sourceMappingURL=order.service.test.js.map