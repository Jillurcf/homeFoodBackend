import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authRepository from "../auth.repository";
import * as passwordResetRepository from "../passwordReset.repository";
import * as mailer from "../../../utils/mailer";
import * as passwordResetService from "../passwordReset.service";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-otp"),
    compare: vi.fn(),
  },
}));

vi.mock("../auth.repository", () => ({
  findUserByEmail: vi.fn(),
  findUserByIdWithPassword: vi.fn(),
  updateUserPassword: vi.fn(),
}));

vi.mock("../passwordReset.repository", () => ({
  findAnyResetByEmail: vi.fn(),
  findActiveResetByEmail: vi.fn(),
  createOrUpdateReset: vi.fn(),
  deleteResetByEmail: vi.fn(),
  deleteResetByEmailAndCodeHash: vi.fn(),
  incrementAttempts: vi.fn(),
  consumeReset: vi.fn(),
}));

vi.mock("../../../utils/mailer", () => ({
  sendPasswordResetOtp: vi.fn(),
}));

describe("password reset email delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(passwordResetRepository.findAnyResetByEmail).mockResolvedValue(
      null
    );
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
      _id: { toString: () => "user-id" },
    } as never);
    vi.mocked(mailer.sendPasswordResetOtp).mockResolvedValue(undefined);
  });

  it("sends an OTP to the normalized account email", async () => {
    const result = await passwordResetService.requestPasswordReset(
      "  USER@example.com "
    );

    expect(mailer.sendPasswordResetOtp).toHaveBeenCalledWith(
      "user@example.com",
      expect.stringMatching(/^\d{6}$/),
      expect.any(Number)
    );
    expect(result.sent).toBe(true);
  });

  it("reports delivery failure and clears the failed code so retry is possible", async () => {
    vi.mocked(mailer.sendPasswordResetOtp).mockRejectedValue(
      new Error("SMTP authentication failed")
    );

    await expect(
      passwordResetService.requestPasswordReset("user@example.com")
    ).rejects.toMatchObject({
      status: 503,
      message: "Unable to send a password reset email. Please try again later.",
    });

    expect(
      passwordResetRepository.deleteResetByEmailAndCodeHash
    ).toHaveBeenCalledWith("user@example.com", "hashed-otp");
  });

  it("keeps the generic response for addresses without an account", async () => {
    vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

    const result = await passwordResetService.requestPasswordReset(
      "unknown@example.com"
    );

    expect(result.sent).toBe(true);
    expect(mailer.sendPasswordResetOtp).not.toHaveBeenCalled();
  });
});
