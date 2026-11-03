import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  mobile: z
    .string()
    .trim()
    .max(25)
    .refine((value) => !value || /^\d{6,15}$/.test(value), {
      message: "Enter a valid mobile number",
    })
    .default(""),
  topic: z.enum([
    "Order issue",
    "Delivery & payment",
    "Becoming a Kitchen Queen",
    "Account & verification",
    "Feedback & suggestions",
    "Something else",
  ]),
  message: z.string().trim().min(10).max(5000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
