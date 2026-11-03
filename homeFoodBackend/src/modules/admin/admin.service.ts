import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { z } from "zod";
import { env } from "../../config/env";
import * as adminRepository from "./admin.repository";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  updateFoodSchema,
} from "./admin.validation";
import * as orderService from "../orders/order.service";
import * as contactService from "../contact/contact.service";
import { IOrder } from "../orders/order.model";

type CreateUserInput = z.infer<typeof adminCreateUserSchema>;
type UpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

const assertValidId = (id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw Object.assign(new Error("Invalid ID"), { status: 400 });
  }
};

const conflict = (message: string) =>
  Object.assign(new Error(message), { status: 409 });

const assertEmailAvailable = async (email: string, excludeId?: string) => {
  const existing = await adminRepository.findUserByEmail(email);
  if (existing && existing._id.toString() !== excludeId) {
    throw conflict("Email already registered");
  }
};

const assertUsernameAvailable = async (username: string, excludeId?: string) => {
  const existing = await adminRepository.findUserByUsername(username);
  if (existing && existing._id.toString() !== excludeId) {
    throw conflict("Username already taken");
  }
};

export const getStats = () => adminRepository.getStats();

export const listUsers = (role?: string) => adminRepository.findUsers(role);

export const getUser = async (id: string) => {
  assertValidId(id);
  const user = await adminRepository.findUserById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
};

export const createUser = async (input: CreateUserInput) => {
  await assertEmailAvailable(input.email);
  await assertUsernameAvailable(input.username);

  const password = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  return adminRepository.createUser({
    name: input.name,
    username: input.username,
    email: input.email,
    password,
    phone: input.phone,
    address: input.address,
    role: input.role,
  });
};

export const updateUser = async (id: string, fields: UpdateUserInput) => {
  assertValidId(id);

  if (fields.email) await assertEmailAvailable(fields.email, id);
  if (fields.username) await assertUsernameAvailable(fields.username, id);

  const updates: Record<string, unknown> = { ...fields };
  if (fields.password) {
    updates.password = await bcrypt.hash(
      fields.password,
      env.BCRYPT_SALT_ROUNDS
    );
  }

  const user = await adminRepository.updateUser(id, updates);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
};

export const deleteUser = async (id: string) => {
  assertValidId(id);
  const user = await adminRepository.deleteUser(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
};

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

  if (shop.userId) {
    await adminRepository.setUserVerification(shop.userId, verified);
  }

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

export const removeOrder = async (id: string) => {
  assertValidId(id);
  const order = await adminRepository.deleteOrder(id);
  if (!order) throw Object.assign(new Error("Order not found"), { status: 404 });
  return order;
};

export const listContactSubmissions = () =>
  contactService.listSubmissions();
