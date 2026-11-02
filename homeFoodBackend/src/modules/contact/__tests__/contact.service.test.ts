import { beforeEach, describe, expect, it, vi } from "vitest";
import * as contactRepository from "../contact.repository";
import * as mailer from "../../../utils/mailer";
import * as contactService from "../contact.service";

vi.mock("../contact.repository", () => ({
  createSubmission: vi.fn(),
  findSubmissions: vi.fn(),
}));

vi.mock("../../../utils/mailer", () => ({
  sendContactSubmissionNotification: vi.fn(),
}));

const input = {
  name: "Buyer Name",
  email: "buyer@example.com",
  mobile: "0123456789",
  topic: "Order issue",
  message: "I need help with my order.",
};
const document = {
  ...input,
  senderRole: "buyer",
  _id: "submission-1",
  toObject: () => ({ ...input, senderRole: "buyer", _id: "submission-1" }),
};

describe("contact service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contactRepository.createSubmission).mockResolvedValue(
      document as never
    );
    vi.mocked(mailer.sendContactSubmissionNotification).mockResolvedValue();
  });

  it("saves the message and sends an email notification", async () => {
    const result = await contactService.createSubmission(input, {
      id: "buyer-1",
      role: "buyer",
    });

    expect(contactRepository.createSubmission).toHaveBeenCalledWith(input, {
      id: "buyer-1",
      role: "buyer",
    });
    expect(mailer.sendContactSubmissionNotification).toHaveBeenCalledWith({
      ...input,
      senderRole: "buyer",
    });
    expect(result).toEqual({
      submission: document.toObject(),
      emailSent: true,
    });
  });

  it("keeps the message available when email delivery fails", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(mailer.sendContactSubmissionNotification).mockRejectedValue(
      new Error("SMTP unavailable")
    );

    const result = await contactService.createSubmission(input);

    expect(result).toEqual({
      submission: document.toObject(),
      emailSent: false,
    });
    expect(contactRepository.createSubmission).toHaveBeenCalledOnce();
    expect(logError).toHaveBeenCalledOnce();
    logError.mockRestore();
  });
});
