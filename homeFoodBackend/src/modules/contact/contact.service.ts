import * as contactRepository from "./contact.repository";
import type { ContactSubmissionInput } from "./contact.validation";
import { sendContactSubmissionNotification } from "../../utils/mailer";

export const createSubmission = async (
  input: ContactSubmissionInput,
  sender?: { id: string; role: string }
) => {
  const submission = await contactRepository.createSubmission(input, sender);
  let emailSent = false;

  try {
    await sendContactSubmissionNotification({
      name: submission.name,
      email: submission.email,
      mobile: submission.mobile,
      topic: submission.topic,
      message: submission.message,
      senderRole: submission.senderRole,
    });
    emailSent = true;
  } catch (error) {
    console.error(
      `[contact] Email notification failed for submission ${submission._id}:`,
      error
    );
  }

  return {
    submission: submission.toObject(),
    emailSent,
  };
};

export const listSubmissions = () => contactRepository.findSubmissions();
