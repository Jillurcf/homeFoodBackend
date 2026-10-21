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
const adminService = __importStar(require("../admin.service"));
const admin_routes_1 = __importDefault(require("../admin.routes"));
vitest_1.vi.mock("../admin.service", () => ({
    getStats: vitest_1.vi.fn(),
    listUsers: vitest_1.vi.fn(),
    changeUserRole: vitest_1.vi.fn(),
    listShops: vitest_1.vi.fn(),
    verifyShop: vitest_1.vi.fn(),
    listFoods: vitest_1.vi.fn(),
    editFood: vitest_1.vi.fn(),
    removeFood: vitest_1.vi.fn(),
    listOrders: vitest_1.vi.fn(),
    changeOrderStatus: vitest_1.vi.fn(),
}));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/admin", admin_routes_1.default);
function tokenFor(id, role) {
    return jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, { expiresIn: "1h" });
}
const adminToken = tokenFor("admin-1", "admin");
const id = "64c13ab08edf48a008793cac";
(0, vitest_1.describe)("admin API routes", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(adminService.getStats).mockResolvedValue({
            users: 4,
            shops: 2,
            foods: 5,
            orders: 3,
            ordersToday: 1,
        });
        vitest_1.vi.mocked(adminService.listUsers).mockResolvedValue([]);
        vitest_1.vi.mocked(adminService.changeUserRole).mockResolvedValue({ _id: id, role: "seller" });
        vitest_1.vi.mocked(adminService.listShops).mockResolvedValue([]);
        vitest_1.vi.mocked(adminService.verifyShop).mockResolvedValue({ _id: id, verified: true });
        vitest_1.vi.mocked(adminService.listFoods).mockResolvedValue([]);
        vitest_1.vi.mocked(adminService.editFood).mockResolvedValue({ _id: id, name: "Soup" });
        vitest_1.vi.mocked(adminService.removeFood).mockResolvedValue({ _id: id });
        vitest_1.vi.mocked(adminService.listOrders).mockResolvedValue([]);
        vitest_1.vi.mocked(adminService.changeOrderStatus).mockResolvedValue({ _id: id, status: "DELIVERED" });
    });
    (0, vitest_1.it)("rejects guests and non-admin users before invoking admin handlers", async () => {
        const guest = await (0, supertest_1.default)(app).get("/api/admin/stats");
        const buyer = await (0, supertest_1.default)(app)
            .get("/api/admin/stats")
            .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
        const seller = await (0, supertest_1.default)(app)
            .get("/api/admin/users")
            .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);
        (0, vitest_1.expect)(guest.status).toBe(401);
        (0, vitest_1.expect)(buyer.status).toBe(403);
        (0, vitest_1.expect)(seller.status).toBe(403);
        (0, vitest_1.expect)(adminService.getStats).not.toHaveBeenCalled();
        (0, vitest_1.expect)(adminService.listUsers).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("returns dashboard stats to an authenticated admin", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/api/admin/stats")
            .set("Authorization", `Bearer ${adminToken}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.data).toEqual({
            users: 4,
            shops: 2,
            foods: 5,
            orders: 3,
            ordersToday: 1,
        });
    });
    (0, vitest_1.it)("supports filtering users by role and validates role changes", async () => {
        const users = await (0, supertest_1.default)(app)
            .get("/api/admin/users?role=seller")
            .set("Authorization", `Bearer ${adminToken}`);
        const invalid = await (0, supertest_1.default)(app)
            .patch(`/api/admin/users/${id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ role: "owner" });
        const update = await (0, supertest_1.default)(app)
            .patch(`/api/admin/users/${id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ role: "seller" });
        (0, vitest_1.expect)(users.status).toBe(200);
        (0, vitest_1.expect)(adminService.listUsers).toHaveBeenCalledWith("seller");
        (0, vitest_1.expect)(invalid.status).toBe(400);
        (0, vitest_1.expect)(update.status).toBe(200);
        (0, vitest_1.expect)(adminService.changeUserRole).toHaveBeenCalledWith(id, "seller");
    });
    (0, vitest_1.it)("can list and verify shops with a validated boolean", async () => {
        const invalid = await (0, supertest_1.default)(app)
            .patch(`/api/admin/shops/${id}/verify`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ verified: "yes" });
        const verify = await (0, supertest_1.default)(app)
            .patch(`/api/admin/shops/${id}/verify`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ verified: true });
        (0, vitest_1.expect)(invalid.status).toBe(400);
        (0, vitest_1.expect)(verify.status).toBe(200);
        (0, vitest_1.expect)(adminService.verifyShop).toHaveBeenCalledWith(id, true);
    });
    (0, vitest_1.it)("supports food filtering, editing, and removal", async () => {
        const foods = await (0, supertest_1.default)(app)
            .get(`/api/admin/foods?sellerId=${id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        const edit = await (0, supertest_1.default)(app)
            .patch(`/api/admin/foods/${id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ availability: "sold_out" });
        const remove = await (0, supertest_1.default)(app)
            .delete(`/api/admin/foods/${id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        (0, vitest_1.expect)(foods.status).toBe(200);
        (0, vitest_1.expect)(adminService.listFoods).toHaveBeenCalledWith(id);
        (0, vitest_1.expect)(edit.status).toBe(200);
        (0, vitest_1.expect)(adminService.editFood).toHaveBeenCalledWith(id, {
            availability: "sold_out",
        });
        (0, vitest_1.expect)(remove.status).toBe(200);
        (0, vitest_1.expect)(adminService.removeFood).toHaveBeenCalledWith(id);
    });
    (0, vitest_1.it)("supports filtered order listing and status updates", async () => {
        const orders = await (0, supertest_1.default)(app)
            .get("/api/admin/orders?status=PENDING")
            .set("Authorization", `Bearer ${adminToken}`);
        const invalid = await (0, supertest_1.default)(app)
            .patch(`/api/admin/orders/${id}/status`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "UNKNOWN" });
        const update = await (0, supertest_1.default)(app)
            .patch(`/api/admin/orders/${id}/status`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "DELIVERED" });
        (0, vitest_1.expect)(orders.status).toBe(200);
        (0, vitest_1.expect)(adminService.listOrders).toHaveBeenCalledWith("PENDING");
        (0, vitest_1.expect)(invalid.status).toBe(400);
        (0, vitest_1.expect)(update.status).toBe(200);
        (0, vitest_1.expect)(adminService.changeOrderStatus).toHaveBeenCalledWith(id, "DELIVERED");
    });
});
//# sourceMappingURL=admin.routes.test.js.map