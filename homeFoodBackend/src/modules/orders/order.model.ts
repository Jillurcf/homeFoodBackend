import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  restaurantId: string;
  items: {
    foodId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    items: [
      {
        foodId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);