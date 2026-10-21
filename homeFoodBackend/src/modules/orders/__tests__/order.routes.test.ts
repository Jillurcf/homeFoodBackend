import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../../config/env";
import Order from "../order.model";
import * as orderService from "../order.service";
import orderRoutes from "../order.routes";

vi.mock("../order.service", () => ({
  createOrder: vi.fn(),
  getOrderById: vi.fn(),
  getUserOrders: vi.fn(),
  getSellerOrders: vi.fn(),
  getAllOrders: vi.fn(),
  sellerOwnsOrder: vi.fn(),
  updateStatus: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

const order = new Order({
  userId: "buyer-1",
  items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
  totalAmount: 10,
  status: "PENDING",
});

function tokenFor(id: string, role: string) {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

describe("order visibility routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderService.getOrderById).mockResolvedValue(order);
    vi.mocked(orderService.getUserOrders).mockResolvedValue([order]);
    vi.mocked(orderService.getSellerOrders).mockResolvedValue([order]);
    vi.mocked(orderService.getAllOrders).mockResolvedValue([order]);
    vi.mocked(orderService.sellerOwnsOrder).mockResolvedValue(false);
    vi.mocked(orderService.createOrder).mockResolvedValue(order);
    vi.mocked(orderService.updateStatus).mockResolvedValue(order);
  });

  it("requires buyers to access their own order list", async () => {
    const guest = await request(app).get("/api/orders/my-orders");
    const seller = await request(app)
      .get("/api/orders/my-orders")
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);

    expect(guest.status).toBe(401);
    expect(seller.status).toBe(403);
    expect(orderService.getUserOrders).not.toHaveBeenCalled();
  });

  it("requires authentication to create an order", async () => {
    const response = await request(app).post("/api/orders").send({
      items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
      totalAmount: 10,
    });

    expect(response.status).toBe(401);
    expect(orderService.createOrder).not.toHaveBeenCalled();
  });

  it("queries only the authenticated buyer's orders", async () => {
    const response = await request(app)
      .get("/api/orders/my-orders")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);

    expect(response.status).toBe(200);
    expect(orderService.getUserOrders).toHaveBeenCalledWith("buyer-1");
  });

  it("sets the order owner from the token instead of a submitted user id", async () => {
    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`)
      .send({
        userId: "buyer-2",
        items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
        totalAmount: 10,
      });

    expect(response.status).toBe(201);
    expect(orderService.createOrder).toHaveBeenCalledWith(
      expect.not.objectContaining({ userId: "buyer-2" }),
      "buyer-1"
    );
  });

  it("allows buyers to read only their own order", async () => {
    const owner = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
    const otherBuyer = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${tokenFor("buyer-2", "buyer")}`);

    expect(owner.status).toBe(200);
    expect(otherBuyer.status).toBe(404);
    expect(orderService.sellerOwnsOrder).not.toHaveBeenCalled();
  });

  it("allows a seller to read an order only when they own one of its foods", async () => {
    vi.mocked(orderService.sellerOwnsOrder).mockResolvedValueOnce(true);
    const owner = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);
    const otherSeller = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${tokenFor("seller-2", "seller")}`);

    expect(owner.status).toBe(200);
    expect(orderService.sellerOwnsOrder).toHaveBeenNthCalledWith(
      1,
      "seller-1",
      ["food-1"]
    );
    expect(otherSeller.status).toBe(404);
  });

  it("allows admins to read orders without seller ownership", async () => {
    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${tokenFor("admin-1", "admin")}`);

    expect(response.status).toBe(200);
    expect(orderService.sellerOwnsOrder).not.toHaveBeenCalled();
  });

  it("returns seller-owned orders to sellers and all orders to admins", async () => {
    const seller = await request(app)
      .get("/api/orders/seller-orders")
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);
    const admin = await request(app)
      .get("/api/orders/seller-orders")
      .set("Authorization", `Bearer ${tokenFor("admin-1", "admin")}`);

    expect(seller.status).toBe(200);
    expect(orderService.getSellerOrders).toHaveBeenCalledWith("seller-1");
    expect(admin.status).toBe(200);
    expect(orderService.getAllOrders).toHaveBeenCalledOnce();
  });

  it("denies buyers access to seller order lists and status updates", async () => {
    const sellerOrders = await request(app)
      .get("/api/orders/seller-orders")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
    const statusUpdate = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`)
      .send({ status: "PREPARING" });

    expect(sellerOrders.status).toBe(403);
    expect(statusUpdate.status).toBe(403);
    expect(orderService.getSellerOrders).not.toHaveBeenCalled();
    expect(orderService.updateStatus).not.toHaveBeenCalled();
  });

  it("validates status and sends seller identity for ownership enforcement", async () => {
    const invalid = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`)
      .send({ status: "UNKNOWN" });
    const valid = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`)
      .send({ status: "PREPARING" });

    expect(invalid.status).toBe(400);
    expect(valid.status).toBe(200);
    expect(orderService.updateStatus).toHaveBeenCalledWith(
      order._id.toString(),
      "PREPARING",
      "seller-1"
    );
  });

  it("allows admins to update status without seller ownership", async () => {
    const response = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set("Authorization", `Bearer ${tokenFor("admin-1", "admin")}`)
      .send({ status: "PREPARING" });

    expect(response.status).toBe(200);
    expect(orderService.updateStatus).toHaveBeenCalledWith(
      order._id.toString(),
      "PREPARING",
      undefined
    );
  });
});
