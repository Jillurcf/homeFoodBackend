import { beforeEach, describe, expect, it, vi } from "vitest";
import Food from "../food.model";
import { findSellerIdsWithShops } from "../../foodMakers/foodMaker.repository";
import * as foodRepository from "../food.repository";

vi.mock("../food.model", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock("../../foodMakers/foodMaker.repository", () => ({
  findSellerIdsWithShops: vi.fn(),
}));

const filters = {
  inStock: false,
  page: 1,
  limit: 20,
};

describe("food repository active kitchen filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("limits public food listings and totals to sellers with kitchens", async () => {
    vi.mocked(findSellerIdsWithShops).mockResolvedValue(["active-seller"]);
    const query = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ _id: "food-1" }]),
    };
    vi.mocked(Food.find).mockReturnValue(query as never);
    vi.mocked(Food.countDocuments).mockResolvedValue(1 as never);

    const result = await foodRepository.listFoods(filters);

    expect(Food.find).toHaveBeenCalledWith({
      sellerId: { $in: ["active-seller"] },
    });
    expect(Food.countDocuments).toHaveBeenCalledWith({
      sellerId: { $in: ["active-seller"] },
    });
    expect(result).toEqual({ foods: [{ _id: "food-1" }], total: 1 });
  });

  it("returns no food when there are no active kitchens", async () => {
    vi.mocked(findSellerIdsWithShops).mockResolvedValue([]);

    await expect(foodRepository.listFoods(filters)).resolves.toEqual({
      foods: [],
      total: 0,
    });
    expect(Food.find).not.toHaveBeenCalled();
    expect(Food.countDocuments).not.toHaveBeenCalled();
  });
});
