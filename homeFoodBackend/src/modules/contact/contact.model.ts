import mongoose, { Document, Schema } from "mongoose";

export type ContactSenderRole = "buyer" | "seller" | "admin" | "guest";

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  mobile: string;
  topic: string;
  message: string;
  userId?: string;
  senderRole: ContactSenderRole;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, default: "" },
    topic: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    userId: { type: String },
    senderRole: {
      type: String,
      enum: ["buyer", "seller", "admin", "guest"],
      default: "guest",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContactSubmission>(
  "ContactSubmission",
  contactSubmissionSchema
);
