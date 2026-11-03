import { beforeEach, describe, expect, it, vi } from "vitest";
import * as adminRepository from "../admin.repository";
import * as adminService from "../admin.service";

vi.mock("../admin.repository", () => ({
  setShopVerification: vi.fn(),
  setUserVerification: vi.fn(),
  deleteOrder: vi.fn(),
}));

vi.mock("../../orders/order.service", () => ({
  adminUpdateStatus: vi.fn(),
}));

const shopId = "64c13ab08edf48a008793cac";
const userId = "64c13ab08edf48a008793cad";

describe("admin service shop verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs the seller account when a shop is approved", async () => {
    vi.mocked(adminRepository.setShopVerification).mockResolvedValue({
      _id: shopId,
      userId,
      verified: true,
    } as never);
    vi.mocked(adminRepository.setUserVerification).mockResolvedValue({
      _id: userId,
      isVerified: true,
    } as never);

    const shop = await adminService.verifyShop(shopId, true);

    expect(adminRepository.setShopVerification).toHaveBeenCalledWith(
      shopId,
      true
    );
    expect(adminRepository.setUserVerification).toHaveBeenCalledWith(
      userId,
      true
    );
    expect(shop).toMatchObject({ _id: shopId, verified: true });
  });

  it("rejects invalid shop IDs before touching the database", async () => {
    await expect(adminService.verifyShop("not-an-id", true)).rejects.toMatchObject(
      { status: 400 }
    );
    expect(adminRepository.setShopVerification).not.toHaveBeenCalled();
  });

  it("returns 404 when the shop does not exist", async () => {
    vi.mocked(adminRepository.setShopVerification).mockResolvedValue(null);

    await expect(adminService.verifyShop(shopId, true)).rejects.toMatchObject({
      status: 404,
    });
    expect(adminRepository.setUserVerification).not.toHaveBeenCalled();
  });

  it("deletes an order after validating its ID", async () => {
    vi.mocked(adminRepository.deleteOrder).mockResolvedValue({
      _id: shopId,
    } as never);

    await expect(adminService.removeOrder(shopId)).resolves.toMatchObject({
      _id: shopId,
    });
    expect(adminRepository.deleteOrder).toHaveBeenCalledWith(shopId);
  });

  it("rejects invalid order IDs without querying the repository", async () => {
    await expect(adminService.removeOrder("not-an-id")).rejects.toMatchObject({
      status: 400,
    });
    expect(adminRepository.deleteOrder).not.toHaveBeenCalled();
  });

  it("returns 404 when the order to delete does not exist", async () => {
    vi.mocked(adminRepository.deleteOrder).mockResolvedValue(null);

    await expect(adminService.removeOrder(shopId)).rejects.toMatchObject({
      status: 404,
    });
  });
});
