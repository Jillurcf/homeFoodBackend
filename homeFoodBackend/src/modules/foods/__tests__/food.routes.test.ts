import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../../config/env";
import Food from "../food.model";
import * as foodService from "../food.service";
import foodRoutes from "../food.routes";

vi.mock("../food.service", () => ({
  listFoods: vi.fn(),
  getFoodById: vi.fn(),
  getSellerFoods: vi.fn(),
  getCategories: vi.fn(),
  createFood: vi.fn(),
  updateFood: vi.fn(),
  deleteFood: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/foods", foodRoutes);

function tokenFor(id: string, role: string) {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

const payload = {
  name: "Chicken Biryani",
  description: "A home-cooked biryani.",
  price: 250,
  category: "Biryani",
  perUnit: "plate",
  prepTime: 30,
  maxOrdersPerDay: 10,
  availability: "available",
  imageUrl: "",
  area: "Uttara",
};

describe("food creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("only lets sellers and admins create dishes", async () => {
    const response = await request(app)
      .post("/api/foods")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`)
      .send(payload);

    expect(response.status).toBe(403);
    expect(foodService.createFood).not.toHaveBeenCalled();
  });

  it("creates a dish for the authenticated seller", async () => {
    vi.mocked(foodService.createFood).mockResolvedValue(new Food({
      ...payload,
      sellerId: "000000000000000000000001",
    }));

    const response = await request(app)
      .post("/api/foods")
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(foodService.createFood).toHaveBeenCalledWith(
      "seller-1",
      expect.objectContaining({ name: payload.name })
    );
  });
});
