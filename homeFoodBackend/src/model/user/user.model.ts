import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  nidNumber?: string;
  address?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  role: "buyer" | "seller" | "admin";
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    nidNumber: { type: String },
    address: { type: String },
    avatarUrl: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
