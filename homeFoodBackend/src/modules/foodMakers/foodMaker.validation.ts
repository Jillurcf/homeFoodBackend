import { z } from "zod";

export const KITCHEN_TYPES = ["home", "shared", "home_catering"] as const;

/** Step 1 — About you */
export const aboutYouSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  phone: z.string().trim().min(6, "Please enter a valid phone number."),
  email: z.string().trim().email("Please enter a valid email address."),
  area: z.string().trim().min(1, "Please choose the area your kitchen is in."),
  photoUrl: z.string().trim().optional(),
  bio: z.string().trim().optional(),
});

/** Step 2 — Your kitchen */
export const kitchenSchema = z.object({
  shopName: z.string().trim().min(2, "Please give your kitchen a name."),
  kitchenType: z.enum(KITCHEN_TYPES),
  address: z.string().trim().min(3, "Please enter your kitchen address."),
  areas: z
    .array(z.string().trim().min(1))
    .min(1, "Please select at least one delivery area."),
  openHours: z.string().trim().optional(),
});

/** Full payload submitted on step 3 — Review & go live */
export const shopSchema = aboutYouSchema.merge(kitchenSchema).extend({
  nidNumber: z.string().trim().optional(),
});

export type ShopInput = z.infer<typeof shopSchema>;
