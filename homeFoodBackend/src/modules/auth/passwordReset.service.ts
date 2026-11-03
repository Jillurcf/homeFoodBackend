import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import * as authRepository from "./auth.repository";
import * as passwordResetRepository from "./passwordReset.repository";
import { sendPasswordResetOtp } from "../../utils/mailer";

const normalizeEmail = (email: string) => email.toLowerCase().trim();

const generateOtp = () =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const ttlMs = () => env.OTP_TTL_MINUTES * 60 * 1000;
const cooldownMs = () => env.OTP_RESEND_COOLDOWN_SECONDS * 1000;

const genericSentResponse = () => ({
  sent: true,
  expiresInMinutes: env.OTP_TTL_MINUTES,
  cooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
});

export const requestPasswordReset = async (email: string) => {
  const normalized = normalizeEmail(email);
  const existing = await passwordResetRepository.findAnyResetByEmail(normalized);
  const now = Date.now();

  if (existing?.lastSentAt) {
    const elapsed = now - new Date(existing.lastSentAt).getTime();
    if (elapsed < cooldownMs()) {
      const retryAfter = Math.ceil((cooldownMs() - elapsed) / 1000);
      throw {
        status: 429,
        message: `Please wait ${retryAfter} seconds before requesting another code.`,
        retryAfter,
      };
    }
  }

  const otp = generateOtp();
  const codeHash = await bcrypt.hash(otp, env.BCRYPT_SALT_ROUNDS);
  const expiresAt = new Date(now + ttlMs());

  // Store a code for every email so unknown/unregistered addresses behave
  // exactly like registered ones (prevents account enumeration).
  await passwordResetRepository.createOrUpdateReset({
    email: normalized,
    codeHash,
    expiresAt,
    lastSentAt: new Date(now),
  });

  const user = await authRepository.findUserByEmail(normalized);
  if (user) {
    try {
      await sendPasswordResetOtp(normalized, otp, env.OTP_TTL_MINUTES);
    } catch (error) {
      await passwordResetRepository.deleteResetByEmailAndCodeHash(
        normalized,
        codeHash
      );
      console.error("Failed to send password reset email:", error);
      throw {
        status: 503,
        message: "Unable to send a password reset email. Please try again later.",
      };
    }
  }

  return genericSentResponse();
};

export const resendOtp = async (email: string) => {
  return requestPasswordReset(email);
};

export const verifyOtp = async (email: string, otp: string) => {
  const normalized = normalizeEmail(email);
  const record = await passwordResetRepository.findActiveResetByEmail(normalized);

  if (!record) {
    throw { status: 400, message: "Invalid or expired code" };
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    await passwordResetRepository.deleteResetByEmail(normalized);
    throw {
      status: 429,
      message: "Too many attempts. Please request a new code.",
    };
  }

  const isMatch = await bcrypt.compare(otp, record.codeHash);
  if (!isMatch) {
    await passwordResetRepository.incrementAttempts(normalized);
    throw { status: 400, message: "Invalid or expired code" };
  }

  const user = await authRepository.findUserByEmail(normalized);
  if (!user) {
    throw { status: 400, message: "Invalid or expired code" };
  }

  await passwordResetRepository.consumeReset(normalized);

  const resetToken = jwt.sign(
    { id: user._id.toString(), purpose: "password_reset" },
    env.JWT_SECRET,
    { expiresIn: `${env.OTP_TTL_MINUTES}m` }
  );

  return { resetToken, expiresInMinutes: env.OTP_TTL_MINUTES };
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string
) => {
  let decoded: unknown;
  try {
    decoded = jwt.verify(resetToken, env.JWT_SECRET);
  } catch {
    throw { status: 400, message: "Reset code is invalid or has expired" };
  }

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    (decoded as { purpose?: string }).purpose !== "password_reset" ||
    typeof (decoded as { id?: unknown }).id !== "string"
  ) {
    throw { status: 400, message: "Reset code is invalid or has expired" };
  }

  const user = await authRepository.findUserByIdWithPassword(
    (decoded as { id: string }).id
  );
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    env.BCRYPT_SALT_ROUNDS
  );
  await authRepository.updateUserPassword(user._id.toString(), hashedPassword);
  await passwordResetRepository.deleteResetByEmail(user.email);

  return { message: "Password updated successfully" };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await authRepository.findUserByIdWithPassword(userId);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Current password is incorrect" };
  }

  if (currentPassword === newPassword) {
    throw {
      status: 400,
      message: "New password must be different from the current password",
    };
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    env.BCRYPT_SALT_ROUNDS
  );
  await authRepository.updateUserPassword(userId, hashedPassword);

  return { message: "Password updated successfully" };
};
