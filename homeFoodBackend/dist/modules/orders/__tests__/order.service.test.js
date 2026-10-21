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
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const orderRepository = __importStar(require("../order.repository"));
const orderService = __importStar(require("../order.service"));
vitest_1.vi.mock("../order.repository", () => ({
    createOrder: vitest_1.vi.fn(),
    findOrderById: vitest_1.vi.fn(),
    findOrdersByUser: vitest_1.vi.fn(),
    findOrdersBySeller: vitest_1.vi.fn(),
    findAllOrders: vitest_1.vi.fn(),
    sellerOwnsOrder: vitest_1.vi.fn(),
    updateOrderStatus: vitest_1.vi.fn(),
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
});
//# sourceMappingURL=order.service.test.js.map