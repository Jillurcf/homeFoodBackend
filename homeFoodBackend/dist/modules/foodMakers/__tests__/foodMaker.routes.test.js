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
const foodMaker_model_1 = __importDefault(require("../foodMaker.model"));
const foodMakerService = __importStar(require("../foodMaker.service"));
const foodMaker_routes_1 = __importDefault(require("../foodMaker.routes"));
vitest_1.vi.mock("../foodMaker.service", () => ({
    getMyShop: vitest_1.vi.fn(),
    saveMyShop: vitest_1.vi.fn(),
    getPublicShop: vitest_1.vi.fn(),
    toPublicShop: vitest_1.vi.fn((shop) => shop),
    getMyStats: vitest_1.vi.fn(),
}));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/shops", foodMaker_routes_1.default);
const shop = new foodMaker_model_1.default({
    userId: "owner-1",
    fullName: "Shop Owner",
    phone: "0123456789",
    email: "owner@example.com",
    shopName: "Home Kitchen",
    kitchenType: "home",
    area: "Central",
    address: "1 Market Street",
    areas: ["Central"],
});
function tokenFor(id, role) {
    return jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, { expiresIn: "1h" });
}
(0, vitest_1.describe)("shop ownership routes", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(foodMakerService.getMyShop).mockImplementation(async (userId) => userId === "owner-1" ? shop : null);
    });
    (0, vitest_1.it)("requires authentication for GET /me", async () => {
        const response = await (0, supertest_1.default)(app).get("/api/shops/me");
        (0, vitest_1.expect)(response.status).toBe(401);
        (0, vitest_1.expect)(foodMakerService.getMyShop).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("returns the authenticated owner's shop", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/api/shops/me")
            .set("Authorization", `Bearer ${tokenFor("owner-1", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.data.userId).toBe("owner-1");
        (0, vitest_1.expect)(foodMakerService.getMyShop).toHaveBeenCalledWith("owner-1");
    });
    (0, vitest_1.it)("returns 404 when the authenticated user has no shop", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/api/shops/me")
            .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);
        (0, vitest_1.expect)(response.status).toBe(404);
        (0, vitest_1.expect)(response.body.message).toBe("No shop profile found");
        (0, vitest_1.expect)(response.body.data).toBeUndefined();
    });
    (0, vitest_1.it)("allows public lookup by shop id without exposing the owner-only route", async () => {
        vitest_1.vi.mocked(foodMakerService.getPublicShop).mockResolvedValue(shop);
        const shopId = shop._id.toString();
        const response = await (0, supertest_1.default)(app).get(`/api/shops/${shopId}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(foodMakerService.getPublicShop).toHaveBeenCalledWith(shopId);
        (0, vitest_1.expect)(foodMakerService.getMyShop).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=foodMaker.routes.test.js.map