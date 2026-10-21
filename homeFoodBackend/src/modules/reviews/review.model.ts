import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  foodId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  buyerId?: mongoose.Types.ObjectId;
  authorName: string;
  area: string;
  rating: number;
  text: string;
  sellerReply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    foodId: { type: Schema.Types.ObjectId, ref: "Food", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    buyerId: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
    sellerReply: { type: String, trim: true },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

reviewSchema.index({ foodId: 1, createdAt: -1 });
reviewSchema.index({ orderId: 1, foodId: 1 });

export default mongoose.model<IReview>("Review", reviewSchema);
