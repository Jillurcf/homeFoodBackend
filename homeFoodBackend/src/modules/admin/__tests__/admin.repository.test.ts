import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Food from "../../foods/food.model";
import FoodMaker from "../../foodMakers/foodMaker.model";
import User from "../../../model/user/user.model";
import * as adminRepository from "../admin.repository";

vi.mock("../../foods/food.model", () => ({
  default: { deleteMany: vi.fn() },
}));

vi.mock("../../foodMakers/foodMaker.model", () => ({
  default: { deleteMany: vi.fn() },
}));

vi.mock("../orders/order.model", () => ({
  default: {},
}));

vi.mock("../../../model/user/user.model", () => ({
  default: { findByIdAndDelete: vi.fn() },
}));

vi.mock("../../foodMakers/foodMaker.repository", () => ({
  findAll: vi.fn(),
}));

const userId = "64c13ab08edf48a008793cad";

describe("admin repository user deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes a deleted seller's shop and food listings", async () => {
    const userQuery = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({ _id: userId }),
    };
    vi.mocked(User.findByIdAndDelete).mockReturnValue(userQuery as never);
    vi.mocked(FoodMaker.deleteMany).mockResolvedValue({ deletedCount: 1 } as never);
    vi.mocked(Food.deleteMany).mockResolvedValue({ deletedCount: 2 } as never);

    await adminRepository.deleteUser(userId);

    expect(FoodMaker.deleteMany).toHaveBeenCalledWith({ userId });
    expect(Food.deleteMany).toHaveBeenCalledWith({
      sellerId: new mongoose.Types.ObjectId(userId),
    });
  });

  it("does not delete seller data when the user does not exist", async () => {
    const userQuery = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null),
    };
    vi.mocked(User.findByIdAndDelete).mockReturnValue(userQuery as never);

    await expect(adminRepository.deleteUser(userId)).resolves.toBeNull();
    expect(FoodMaker.deleteMany).not.toHaveBeenCalled();
    expect(Food.deleteMany).not.toHaveBeenCalled();
  });
});
