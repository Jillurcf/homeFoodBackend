import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../../config/env";
import FoodMaker from "../foodMaker.model";
import * as foodMakerService from "../foodMaker.service";
import foodMakerRoutes from "../foodMaker.routes";

vi.mock("../foodMaker.service", () => ({
  getMyShop: vi.fn(),
  saveMyShop: vi.fn(),
  getPublicShop: vi.fn(),
  toPublicShop: vi.fn((shop) => shop),
  getMyStats: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/shops", foodMakerRoutes);

const shop = new FoodMaker({
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

function tokenFor(id: string, role: string) {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

describe("shop ownership routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(foodMakerService.getMyShop).mockImplementation(async (userId) =>
      userId === "owner-1" ? shop : null
    );
  });

  it("requires authentication for GET /me", async () => {
    const response = await request(app).get("/api/shops/me");

    expect(response.status).toBe(401);
    expect(foodMakerService.getMyShop).not.toHaveBeenCalled();
  });

  it("returns the authenticated owner's shop", async () => {
    const response = await request(app)
      .get("/api/shops/me")
      .set("Authorization", `Bearer ${tokenFor("owner-1", "buyer")}`);

    expect(response.status).toBe(200);
    expect(response.body.data.userId).toBe("owner-1");
    expect(foodMakerService.getMyShop).toHaveBeenCalledWith("owner-1");
  });

  it("returns 404 when the authenticated user has no shop", async () => {
    const response = await request(app)
      .get("/api/shops/me")
      .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No shop profile found");
    expect(response.body.data).toBeUndefined();
  });

  it("allows public lookup by shop id without exposing the owner-only route", async () => {
    vi.mocked(foodMakerService.getPublicShop).mockResolvedValue(shop);
    const shopId = shop._id.toString();

    const response = await request(app).get(`/api/shops/${shopId}`);

    expect(response.status).toBe(200);
    expect(foodMakerService.getPublicShop).toHaveBeenCalledWith(shopId);
    expect(foodMakerService.getMyShop).not.toHaveBeenCalled();
  });
});
