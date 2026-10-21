import mongoose from "mongoose";
import * as adminRepository from "./admin.repository";
import { updateFoodSchema } from "./admin.validation";
import * as orderService from "../orders/order.service";
import { IOrder } from "../orders/order.model";

const assertValidId = (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw Object.assign(new Error("Invalid ID"), { status: 400 });
  }
};

export const getStats = () => adminRepository.getStats();

export const listUsers = (role?: string) => adminRepository.findUsers(role);

export const changeUserRole = async (
  id: string,
  role: "buyer" | "seller" | "admin"
) => {
  assertValidId(id);
  const user = await adminRepository.updateUserRole(id, role);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
};

export const listShops = () => adminRepository.findShops();

export const verifyShop = async (id: string, verified: boolean) => {
  assertValidId(id);
  const shop = await adminRepository.setShopVerification(id, verified);
  if (!shop) throw Object.assign(new Error("Shop not found"), { status: 404 });
  return shop;
};

export const listFoods = (sellerId?: string) =>
  adminRepository.findFoods(sellerId);

export const editFood = async (id: string, fields: unknown) => {
  assertValidId(id);
  const input = updateFoodSchema.parse(fields);
  const food = await adminRepository.updateFood(id, input);
  if (!food) throw Object.assign(new Error("Food not found"), { status: 404 });
  return food;
};

export const removeFood = async (id: string) => {
  assertValidId(id);
  const food = await adminRepository.deleteFood(id);
  if (!food) throw Object.assign(new Error("Food not found"), { status: 404 });
  return food;
};

export const listOrders = (status?: IOrder["status"]) =>
  adminRepository.findOrders(status);

export const changeOrderStatus = (id: string, status: IOrder["status"]) => {
  assertValidId(id);
  return orderService.adminUpdateStatus(id, status);
};
