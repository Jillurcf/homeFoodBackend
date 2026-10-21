import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import * as authRepository from "./auth.repository";
import authEvents from "./auth.events";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (data: {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  nidNumber?: string;
  address?: string;
}) => {
  const existingEmail = await authRepository.findUserByEmail(data.email);
  if (existingEmail) {
    throw { status: 409, message: "Email already registered" };
  }

  const existingUsername = await authRepository.findUserByUsername(data.username);
  if (existingUsername) {
    throw { status: 409, message: "Username already taken" };
  }

  const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const user = await authRepository.createUser({
    name: data.name,
    username: data.username,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    nidNumber: data.nidNumber,
    address: data.address,
    role: "buyer",
  });

  const userId = user._id.toString();
  const token = generateToken(userId, user.role);

  authEvents.emit("auth.user.registered", user);

  return {
    user: {
      id: userId,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nidNumber: user.nidNumber,
      address: user.address,
      role: user.role,
    },
    token,
  };
};

export const login = async (email: string, password: string) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const userId = user._id.toString();
  const token = generateToken(userId, user.role);

  return {
    user: {
      id: userId,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nidNumber: user.nidNumber,
      address: user.address,
      role: user.role,
    },
    token,
  };
};

export const getMe = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return user;
};

export const refreshSession = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    },
    token: generateToken(user._id.toString(), user.role),
  };
};

export const checkUsername = async (username: string) => {
  const existing = await authRepository.findUserByUsername(username);
  return { available: !existing };
};
