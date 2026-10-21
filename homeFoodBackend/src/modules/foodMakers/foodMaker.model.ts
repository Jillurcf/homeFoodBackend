import mongoose, { Schema, Document } from "mongoose";

export type KitchenType = "home" | "shared" | "home_catering";

export interface IFoodMaker extends Document {
  userId: string;
  fullName: string;
  photoUrl?: string;
  phone: string;
  email: string;
  shopName: string;
  kitchenType: KitchenType;
  area: string;
  address: string;
  areas: string[];
  openHours?: string;
  bio?: string;
  nidNumber?: string;
  verified: boolean;
}

const foodMakerSchema = new Schema<IFoodMaker>(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    photoUrl: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    shopName: { type: String, required: true, trim: true },
    kitchenType: {
      type: String,
      enum: ["home", "shared", "home_catering"],
      default: "home",
    },
    area: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    areas: [{ type: String, trim: true }],
    openHours: { type: String, trim: true },
    bio: { type: String, trim: true },
    nidNumber: { type: String, trim: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IFoodMaker>("FoodMaker", foodMakerSchema);
