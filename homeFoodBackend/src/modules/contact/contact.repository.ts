import ContactSubmission from "./contact.model";
import type { ContactSenderRole } from "./contact.model";
import type { ContactSubmissionInput } from "./contact.validation";

export const createSubmission = (
  input: ContactSubmissionInput,
  sender?: { id: string; role: string }
) => {
  const senderRole =
    sender?.role === "buyer" ||
    sender?.role === "seller" ||
    sender?.role === "admin"
      ? sender.role
      : "guest";

  return ContactSubmission.create({
    ...input,
    userId: sender?.id,
    senderRole: senderRole satisfies ContactSenderRole,
  });
};

export const findSubmissions = () =>
  ContactSubmission.find().sort({ createdAt: -1 }).lean();
