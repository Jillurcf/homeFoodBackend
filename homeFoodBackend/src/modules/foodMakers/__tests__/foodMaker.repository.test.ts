import { beforeEach, describe, expect, it, vi } from "vitest";
import FoodMaker from "../foodMaker.model";
import User from "../../../model/user/user.model";
import * as foodMakerRepository from "../foodMaker.repository";

vi.mock("../foodMaker.model", () => ({
  default: { find: vi.fn() },
}));

vi.mock("../../../model/user/user.model", () => ({
  default: { find: vi.fn() },
}));

const sellerId = "64c13ab08edf48a008793cad";

describe("food maker repository public shop list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries active sellers and keeps the newest shop per seller", async () => {
    const sellersQuery = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ _id: { toString: () => sellerId } }]),
    };
    const shops = [
      { userId: sellerId, shopName: "Newest Kitchen" },
      { userId: sellerId, shopName: "Older duplicate" },
    ];
    const shopsQuery = {
      sort: vi.fn().mockResolvedValue(shops),
    };
    vi.mocked(User.find).mockReturnValue(sellersQuery as never);
    vi.mocked(FoodMaker.find).mockReturnValue(shopsQuery as never);

    const result = await foodMakerRepository.findAll();

    expect(User.find).toHaveBeenCalledWith({ role: "seller" });
    expect(FoodMaker.find).toHaveBeenCalledWith({
      userId: { $in: [sellerId] },
    });
    expect(result).toEqual([shops[0]]);
  });

  it("does not query or return shops when no seller accounts exist", async () => {
    const sellersQuery = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(User.find).mockReturnValue(sellersQuery as never);

    await expect(foodMakerRepository.findAll()).resolves.toEqual([]);
    expect(FoodMaker.find).not.toHaveBeenCalled();
  });
});
