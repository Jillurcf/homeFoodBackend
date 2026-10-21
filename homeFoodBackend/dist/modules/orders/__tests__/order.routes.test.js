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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const env_1 = require("../../../config/env");
const order_model_1 = __importDefault(require("../order.model"));
const orderService = __importStar(require("../order.service"));
const order_routes_1 = __importDefault(require("../order.routes"));
vitest_1.vi.mock("../order.service", () => ({
    createOrder: vitest_1.vi.fn(),
    getOrderById: vitest_1.vi.fn(),
    getUserOrders: vitest_1.vi.fn(),
    getSellerOrders: vitest_1.vi.fn(),
    getAllOrders: vitest_1.vi.fn(),
    sellerOwnsOrder: vitest_1.vi.fn(),
    updateStatus: vitest_1.vi.fn(),
}));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/orders", order_routes_1.default);
const order = new order_model_1.default({
    userId: "buyer-1",
    items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
    totalAmount: 10,
    status: "PENDING",
});
function tokenFor(id, role) {
    return jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, { expiresIn: "1h" });
}
(0, vitest_1.describe)("order visibility routes", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(orderService.getOrderById).mockResolvedValue(order);
        vitest_1.vi.mocked(orderService.getUserOrders).mockResolvedValue([order]);
        vitest_1.vi.mocked(orderService.getSellerOrders).mockResolvedValue([order]);
        vitest_1.vi.mocked(orderService.getAllOrders).mockResolvedValue([order]);
        vitest_1.vi.mocked(orderService.sellerOwnsOrder).mockResolvedValue(false);
        vitest_1.vi.mocked(orderService.createOrder).mockResolvedValue(order);
        vitest_1.vi.mocked(orderService.updateStatus).mockResolvedValue(order);
    });
    (0, vitest_1.it)("requires buyers to access their own order list", async () => {
        const guest = await (0, supertest_1.default)(app).get("/api/orders/my-orders");
        const seller = await (0, supertest_1.default)(app)
            .get("/api/orders/my-orders")
            .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);
        (0, vitest_1.expect)(guest.status).toBe(401);
        (0, vitest_1.expect)(seller.status).toBe(403);
        (0, vitest_1.expect)(orderService.getUserOrders).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("requires authentication to create an order", async () => {
        const response = await (0, supertest_1.default)(app).post("/api/orders").send({
            items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
            totalAmount: 10,
        });
        (0, vitest_1.expect)(response.status).toBe(401);
        (0, vitest_1.expect)(orderService.createOrder).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("queries only the authenticated buyer's orders", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/api/orders/my-orders")
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(orderService.getUserOrders).toHaveBeenCalledWith("buyer-1");
    });
    (0, vitest_1.it)("sets the order owner from the token instead of a submitted user id", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`)
            .send({
            userId: "buyer-2",
            items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
            totalAmount: 10,
        });
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(orderService.createOrder).toHaveBeenCalledWith(vitest_1.expect.not.objectContaining({ userId: "buyer-2" }), "buyer-1");
    });
    (0, vitest_1.it)("allows buyers to read only their own order", async () => {
        const owner = await (0, supertest_1.default)(app)
            .get(`/api/orders/${order._id}`)
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
        const otherBuyer = await (0, supertest_1.default)(app)
            .get(`/api/orders/${order._id}`)
            .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);
        (0, vitest_1.expect)(owner.status).toBe(200);
        (0, vitest_1.expect)(otherBuyer.status).toBe(404);
        (0, vitest_1.expect)(orderService.sellerOwnsOrder).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("allows a seller to read an order only when they own one of its foods", async () => {
        vitest_1.vi.mocked(orderService.sellerOwnsOrder).mockResolvedValueOnce(true);
        const owner = await (0, supertest_1.default)(app)
            .get(`/api/orders/${order._id}`)
            .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);
        const otherSeller = await (0, supertest_1.default)(app)
            .get(`/api/orders/${order._id}`)
            .set("Authorization", `Bearer ${tokenFor("seller-2", "seller")}`);
        (0, vitest_1.expect)(owner.status).toBe(200);
        (0, vitest_1.expect)(orderService.sellerOwnsOrder).toHaveBeenNthCalledWith(1, "seller-1", ["food-1"]);
        (0, vitest_1.expect)(otherSeller.status).toBe(404);
    });
    (0, vitest_1.it)("allows admins to read orders without seller ownership", async () => {
        const response = await (0, supertest_1.default)(app)
            .get(`/api/orders/${order._id}`)
            .set("Authorization", `Bearer ${tokenFor("admin-1", "admin")}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(orderService.sellerOwnsOrder).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("returns seller-owned orders to sellers and all orders to admins", async () => {
        const seller = await (0, supertest_1.default)(app)
            .get("/api/orders/seller-orders")
            .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);
        const admin = await (0, supertest_1.default)(app)
            .get("/api/orders/seller-orders")
            .set("Authorization", `Bearer ${tokenFor("admin-1", "admin")}`);
        (0, vitest_1.expect)(seller.status).toBe(200);
        (0, vitest_1.expect)(orderService.getSellerOrders).toHaveBeenCalledWith("seller-1");
        (0, vitest_1.expect)(admin.status).toBe(200);
        (0, vitest_1.expect)(orderService.getAllOrders).toHaveBeenCalledOnce();
    });
    (0, vitest_1.it)("denies buyers access to seller order lists and status updates", async () => {
        const sellerOrders = await (0, supertest_1.default)(app)
            .get("/api/orders/seller-orders")
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
        const statusUpdate = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`)
            .send({ status: "PREPARING" });
        (0, vitest_1.expect)(sellerOrders.status).toBe(403);
        (0, vitest_1.expect)(statusUpdate.status).toBe(403);
        (0, vitest_1.expect)(orderService.getSellerOrders).not.toHaveBeenCalled();
        (0, vitest_1.expect)(orderService.updateStatus).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("validates status and sends seller identity for ownership enforcement", async () => {
        const invalid = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`)
            .send({ status: "UNKNOWN" });
        const valid = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`)
            .send({ status: "PREPARING" });
        (0, vitest_1.expect)(invalid.status).toBe(400);
        (0, vitest_1.expect)(valid.status).toBe(200);
        (0, vitest_1.expect)(orderService.updateStatus).toHaveBeenCalledWith(order._id.toString(), "PREPARING", "seller-1");
    });
    (0, vitest_1.it)("allows admins to update status without seller ownership", async () => {
        const response = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set("Authorization", `Bearer ${tokenFor("admin-1", "admin")}`)
            .send({ status: "PREPARING" });
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(orderService.updateStatus).toHaveBeenCalledWith(order._id.toString(), "PREPARING", undefined);
    });
});
//# sourceMappingURL=order.routes.test.js.map