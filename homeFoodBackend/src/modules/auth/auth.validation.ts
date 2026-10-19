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
  nidNumber: z
    .string()
    .regex(/^\d{10,17}$/, "NID number must be 10 to 17 digits")
    .optional(),
  address: z.string().min(1, "Address is required").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const checkUsernameSchema = z.object({
  username: z.string().min(1, "Username is required"),
});
