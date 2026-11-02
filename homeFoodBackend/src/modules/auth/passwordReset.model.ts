import mongoose, { Schema, Document } from "mongoose";

export interface IPasswordResetOtp extends Document {
  email: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  lastSentAt: Date;
  consumedAt?: Date | null;
}

const passwordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// MongoDB TTL index: expired reset codes are removed automatically.
passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetOtp =
  (mongoose.models?.PasswordResetOtp as mongoose.Model<IPasswordResetOtp>) ||
  mongoose.model<IPasswordResetOtp>(
    "PasswordResetOtp",
    passwordResetOtpSchema
  );

export default PasswordResetOtp;
