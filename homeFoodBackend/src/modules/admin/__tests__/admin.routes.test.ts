import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../../config/env";
import * as adminService from "../admin.service";
import adminRoutes from "../admin.routes";

vi.mock("../admin.service", () => ({
  getStats: vi.fn(),
  listUsers: vi.fn(),
  changeUserRole: vi.fn(),
  listShops: vi.fn(),
  verifyShop: vi.fn(),
  listFoods: vi.fn(),
  editFood: vi.fn(),
  removeFood: vi.fn(),
  listOrders: vi.fn(),
  changeOrderStatus: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

function tokenFor(id: string, role: string) {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

const adminToken = tokenFor("admin-1", "admin");
const id = "64c13ab08edf48a008793cac";

describe("admin API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.getStats).mockResolvedValue({
      users: 4,
      shops: 2,
      foods: 5,
      orders: 3,
      ordersToday: 1,
    });
    vi.mocked(adminService.listUsers).mockResolvedValue([]);
    vi.mocked(adminService.changeUserRole).mockResolvedValue({ _id: id, role: "seller" } as never);
    vi.mocked(adminService.listShops).mockResolvedValue([]);
    vi.mocked(adminService.verifyShop).mockResolvedValue({ _id: id, verified: true } as never);
    vi.mocked(adminService.listFoods).mockResolvedValue([]);
    vi.mocked(adminService.editFood).mockResolvedValue({ _id: id, name: "Soup" } as never);
    vi.mocked(adminService.removeFood).mockResolvedValue({ _id: id } as never);
    vi.mocked(adminService.listOrders).mockResolvedValue([]);
    vi.mocked(adminService.changeOrderStatus).mockResolvedValue({ _id: id, status: "DELIVERED" } as never);
  });

  it("rejects guests and non-admin users before invoking admin handlers", async () => {
    const guest = await request(app).get("/api/admin/stats");
    const buyer = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${tokenFor("buyer-1", "buyer")}`);
    const seller = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${tokenFor("seller-1", "seller")}`);

    expect(guest.status).toBe(401);
    expect(buyer.status).toBe(403);
    expect(seller.status).toBe(403);
    expect(adminService.getStats).not.toHaveBeenCalled();
    expect(adminService.listUsers).not.toHaveBeenCalled();
  });

  it("returns dashboard stats to an authenticated admin", async () => {
    const response = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      users: 4,
      shops: 2,
      foods: 5,
      orders: 3,
      ordersToday: 1,
    });
  });

  it("supports filtering users by role and validates role changes", async () => {
    const users = await request(app)
      .get("/api/admin/users?role=seller")
      .set("Authorization", `Bearer ${adminToken}`);
    const invalid = await request(app)
      .patch(`/api/admin/users/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "owner" });
    const update = await request(app)
      .patch(`/api/admin/users/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "seller" });

    expect(users.status).toBe(200);
    expect(adminService.listUsers).toHaveBeenCalledWith("seller");
    expect(invalid.status).toBe(400);
    expect(update.status).toBe(200);
    expect(adminService.changeUserRole).toHaveBeenCalledWith(id, "seller");
  });

  it("can list and verify shops with a validated boolean", async () => {
    const invalid = await request(app)
      .patch(`/api/admin/shops/${id}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ verified: "yes" });
    const verify = await request(app)
      .patch(`/api/admin/shops/${id}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ verified: true });

    expect(invalid.status).toBe(400);
    expect(verify.status).toBe(200);
    expect(adminService.verifyShop).toHaveBeenCalledWith(id, true);
  });

  it("supports food filtering, editing, and removal", async () => {
    const foods = await request(app)
      .get(`/api/admin/foods?sellerId=${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    const edit = await request(app)
      .patch(`/api/admin/foods/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ availability: "sold_out" });
    const remove = await request(app)
      .delete(`/api/admin/foods/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(foods.status).toBe(200);
    expect(adminService.listFoods).toHaveBeenCalledWith(id);
    expect(edit.status).toBe(200);
    expect(adminService.editFood).toHaveBeenCalledWith(id, {
      availability: "sold_out",
    });
    expect(remove.status).toBe(200);
    expect(adminService.removeFood).toHaveBeenCalledWith(id);
  });

  it("supports filtered order listing and status updates", async () => {
    const orders = await request(app)
      .get("/api/admin/orders?status=PENDING")
      .set("Authorization", `Bearer ${adminToken}`);
    const invalid = await request(app)
      .patch(`/api/admin/orders/${id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "UNKNOWN" });
    const update = await request(app)
      .patch(`/api/admin/orders/${id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DELIVERED" });

    expect(orders.status).toBe(200);
    expect(adminService.listOrders).toHaveBeenCalledWith("PENDING");
    expect(invalid.status).toBe(400);
    expect(update.status).toBe(200);
    expect(adminService.changeOrderStatus).toHaveBeenCalledWith(
      id,
      "DELIVERED"
    );
  });
});
