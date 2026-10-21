import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IDeliveryAddress {
  label?: string;
  addressLine?: string;
  area?: string;
  city?: string;
  phone?: string;
}

export interface IOrder extends Document {
  userId: string;
  restaurantId: string;
  items: IOrderItem[];
  totalAmount: number;
  note?: string;
  deliveryAddress?: IDeliveryAddress;
  paymentMethod: "cod" | "bkash" | "nagad" | "card";
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    restaurantId: { type: String, required: false },
    items: [
      {
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    note: { type: String, trim: true },
    deliveryAddress: {
      label: String,
      addressLine: String,
      area: String,
      city: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash", "nagad", "card"],
      default: "cod",
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);