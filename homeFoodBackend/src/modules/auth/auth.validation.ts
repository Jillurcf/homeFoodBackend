import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const checkUsernameSchema = z.object({
  username: z.string().min(1, "Username is required"),
});
