import { beforeEach, describe, expect, it, vi } from "vitest";
import * as orderRepository from "../order.repository";
import * as orderService from "../order.service";

vi.mock("../order.repository", () => ({
  createOrder: vi.fn(),
  findOrderById: vi.fn(),
  findOrdersByUser: vi.fn(),
  findOrdersBySeller: vi.fn(),
  findAllOrders: vi.fn(),
  sellerOwnsOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

const pendingOrder = {
  status: "PENDING" as const,
  items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
};

describe("order status ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderRepository.findOrderById).mockResolvedValue(
      pendingOrder as never
    );
    vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(false);
    vi.mocked(orderRepository.updateOrderStatus).mockResolvedValue(
      pendingOrder as never
    );
  });

  it("blocks status changes when the seller owns none of the order's foods", async () => {
    await expect(
      orderService.updateStatus("order-1", "PREPARING", "seller-1")
    ).rejects.toMatchObject({ status: 403 });

    expect(orderRepository.sellerOwnsOrder).toHaveBeenCalledWith("seller-1", [
      "food-1",
    ]);
    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("allows an owning seller to make a valid status transition", async () => {
    vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);

    await orderService.updateStatus("order-1", "PREPARING", "seller-1");

    expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(
      "order-1",
      "PREPARING"
    );
  });

  it("rejects transitions that are not allowed", async () => {
    vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);

    await expect(
      orderService.updateStatus("order-1", "DELIVERED", "seller-1")
    ).rejects.toMatchObject({ status: 400 });

    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("lets admin override the transition while preserving order lookup", async () => {
    await orderService.adminUpdateStatus("order-1", "DELIVERED");

    expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(
      "order-1",
      "DELIVERED"
    );
    expect(orderRepository.sellerOwnsOrder).not.toHaveBeenCalled();
  });
});
