import mongoose, { Schema, Document } from "mongoose";

export type FoodAvailability = "available" | "low" | "sold_out";

export interface IFood extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  perUnit: string;
  prepTime: number;
  maxOrdersPerDay: number;
  availability: FoodAvailability;
  imageUrl: string;
  dietaryTags: string[];
  deliveryFee: number;
  sellerId: mongoose.Types.ObjectId;
  area: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const foodSchema = new Schema<IFood>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    perUnit: { type: String, required: true, default: "1 plate" },
    prepTime: { type: Number, required: true },
    maxOrdersPerDay: { type: Number, required: true },
    availability: {
      type: String,
      enum: ["available", "low", "sold_out"],
      default: "available",
    },
    imageUrl: { type: String, default: "" },
    dietaryTags: { type: [String], default: [] },
    deliveryFee: { type: Number, default: 40, min: 0 },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    area: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

foodSchema.index({ name: "text", description: "text" });
foodSchema.index({ category: 1 });
foodSchema.index({ area: 1 });
foodSchema.index({ sellerId: 1 });

export default mongoose.model<IFood>("Food", foodSchema);
