import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

export function isMailerConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export async function sendPasswordResetOtp(
  email: string,
  otp: string,
  expiresInMinutes: number
) {
  const client = getTransporter();

  if (!client) {
    if (env.NODE_ENV !== "production") {
      console.warn(
        `[mailer] SMTP is not configured. Password reset OTP for ${email}: ${otp}`
      );
      return;
    }
    throw new Error("Email service is not configured");
  }

  const subject = `Your ${env.APP_NAME} password reset code`;
  const text = [
    `Your ${env.APP_NAME} password reset code is ${otp}.`,
    `It expires in ${expiresInMinutes} minutes.`,
    "If you did not request a password reset, you can safely ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 12px; color: #1f2937;">Reset your ${env.APP_NAME} password</h2>
      <p style="color: #4b5563; font-size: 14px;">Use the code below to reset your password:</p>
      <div style="margin: 20px 0; padding: 16px; text-align: center; letter-spacing: 8px; font-size: 28px; font-weight: 700; color: #111827; background: #f3f4f6; border-radius: 12px;">
        ${otp}
      </div>
      <p style="color: #4b5563; font-size: 14px;">This code expires in ${expiresInMinutes} minutes.</p>
      <p style="color: #9ca3af; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  await client.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject,
    text,
    html,
  });
}
