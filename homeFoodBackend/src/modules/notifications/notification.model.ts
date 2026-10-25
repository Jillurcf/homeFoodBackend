import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationType =
  | "ORDER_PLACED"
  | "ORDER_ACCEPTED"
  | "ORDER_DECLINED"
  | "ORDER_ON_THE_WAY"
  | "ORDER_RECEIVED"
  | "ORDER_CANCELLED";

export interface INotificationData {
  orderId: string;
  foodIds: string[];
  totalAmount: number;
  buyerName?: string;
  shopName?: string;
}

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  actorId?: Types.ObjectId;
  orderId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data: INotificationData;
  isRead: boolean;
  readAt?: Date;
  dedupeKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "ORDER_ACCEPTED",
        "ORDER_DECLINED",
        "ORDER_ON_THE_WAY",
        "ORDER_RECEIVED",
        "ORDER_CANCELLED",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    data: {
      orderId: { type: String, required: true },
      foodIds: { type: [String], default: [] },
      totalAmount: { type: Number, default: 0 },
      buyerName: { type: String, trim: true },
      shopName: { type: String, trim: true },
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    dedupeKey: { type: String, required: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ dedupeKey: 1 }, { unique: true });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
