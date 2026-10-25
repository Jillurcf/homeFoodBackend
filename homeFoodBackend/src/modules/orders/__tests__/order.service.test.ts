import { beforeEach, describe, expect, it, vi } from "vitest";
import * as orderRepository from "../order.repository";
import orderEvents from "../order.events";
import * as orderService from "../order.service";
import * as notificationService from "../../notifications/notification.service";

vi.mock("../order.repository", () => ({
  createOrder: vi.fn(),
  findOrderById: vi.fn(),
  findOrdersByUser: vi.fn(),
  findOrdersBySeller: vi.fn(),
  findAllOrders: vi.fn(),
  sellerOwnsOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

vi.mock("../../notifications/notification.service", () => ({
  notifyOrderPlaced: vi.fn(),
  notifyOrderStatusChange: vi.fn(),
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
    vi.mocked(notificationService.notifyOrderStatusChange).mockResolvedValue(0);
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

  it("waits for status notifications to be persisted before returning", async () => {
    vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
    let finishNotification!: (count: number) => void;
    const notificationWrite = new Promise<number>((resolve) => {
      finishNotification = resolve;
    });
    vi.mocked(notificationService.notifyOrderStatusChange).mockReturnValue(
      notificationWrite
    );
    let updateFinished = false;

    const update = orderService
      .updateStatus("order-1", "PREPARING", "seller-1")
      .then(() => {
        updateFinished = true;
      });

    await vi.waitFor(() =>
      expect(notificationService.notifyOrderStatusChange).toHaveBeenCalledWith(
        pendingOrder,
        "PENDING",
        "seller-1"
      )
    );
    expect(updateFinished).toBe(false);

    finishNotification(1);
    await update;

    expect(updateFinished).toBe(true);
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

  it("lets a seller mark a preparing order out for delivery", async () => {
    vi.mocked(orderRepository.findOrderById).mockResolvedValue({
      ...pendingOrder,
      status: "PREPARING",
    } as never);
    vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);

    await orderService.updateStatus("order-1", "ON_THE_WAY", "seller-1");

    expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(
      "order-1",
      "ON_THE_WAY"
    );
  });

  it("does not let a seller mark an order as delivered", async () => {
    vi.mocked(orderRepository.findOrderById).mockResolvedValue({
      ...pendingOrder,
      status: "PREPARING",
    } as never);
    vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);

    await expect(
      orderService.updateStatus("order-1", "DELIVERED", "seller-1")
    ).rejects.toMatchObject({ status: 400 });

    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("includes the previous status and actor in status update events", async () => {
    vi.mocked(orderRepository.sellerOwnsOrder).mockResolvedValue(true);
    const emit = vi.spyOn(orderEvents, "emit");

    await orderService.updateStatus("order-1", "PREPARING", "seller-1");

    expect(emit).toHaveBeenCalledWith(
      "order.status.updated",
      pendingOrder,
      "PENDING",
      "seller-1"
    );
  });
});

describe("buyer receipt confirmation", () => {
  const onTheWayOrder = {
    _id: "order-1",
    userId: "buyer-1",
    status: "ON_THE_WAY" as const,
    items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
    totalAmount: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationService.notifyOrderStatusChange).mockResolvedValue(0);
  });

  it("returns not found when the order does not exist", async () => {
    vi.mocked(orderRepository.findOrderById).mockResolvedValue(null);

    await expect(
      orderService.receiveOrder("order-1", "buyer-1")
    ).rejects.toMatchObject({ status: 404 });
  });

  it("rejects buyers who do not own the order", async () => {
    vi.mocked(orderRepository.findOrderById).mockResolvedValue(
      onTheWayOrder as never
    );

    await expect(
      orderService.receiveOrder("order-1", "buyer-2")
    ).rejects.toMatchObject({ status: 403 });

    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("rejects receipt confirmation before the order is out for delivery", async () => {
    vi.mocked(orderRepository.findOrderById).mockResolvedValue({
      ...onTheWayOrder,
      status: "PREPARING",
    } as never);

    await expect(
      orderService.receiveOrder("order-1", "buyer-1")
    ).rejects.toMatchObject({ status: 400 });

    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("marks the buyer's out-for-delivery order as delivered", async () => {
    vi.mocked(orderRepository.findOrderById).mockResolvedValue(
      onTheWayOrder as never
    );
    vi.mocked(orderRepository.updateOrderStatus).mockResolvedValue({
      ...onTheWayOrder,
      status: "DELIVERED",
    } as never);
    const emit = vi.spyOn(orderEvents, "emit");

    await orderService.receiveOrder("order-1", "buyer-1");

    expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(
      "order-1",
      "DELIVERED"
    );
    expect(emit).toHaveBeenCalledWith(
      "order.status.updated",
      expect.objectContaining({ status: "DELIVERED" }),
      "ON_THE_WAY",
      "buyer-1"
    );
    expect(notificationService.notifyOrderStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: "DELIVERED" }),
      "ON_THE_WAY",
      "buyer-1"
    );
  });
});

describe("order creation notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationService.notifyOrderPlaced).mockResolvedValue(0);
  });

  it("waits for seller notifications to be persisted before returning", async () => {
    const createdOrder = {
      ...pendingOrder,
      _id: "order-1",
      userId: "buyer-1",
    };
    vi.mocked(orderRepository.createOrder).mockResolvedValue(
      createdOrder as never
    );
    let finishNotification!: (count: number) => void;
    const notificationWrite = new Promise<number>((resolve) => {
      finishNotification = resolve;
    });
    vi.mocked(notificationService.notifyOrderPlaced).mockReturnValue(
      notificationWrite
    );
    let creationFinished = false;

    const creation = orderService
      .createOrder({ items: [] } as never, "buyer-1")
      .then(() => {
        creationFinished = true;
      });

    await vi.waitFor(() =>
      expect(notificationService.notifyOrderPlaced).toHaveBeenCalledWith(
        createdOrder
      )
    );
    expect(creationFinished).toBe(false);

    finishNotification(1);
    await creation;

    expect(creationFinished).toBe(true);
  });
});
