import { api } from "./clients";

export interface OtpSentResponse {
  sent: boolean;
  expiresInMinutes: number;
  cooldownSeconds: number;
}

export interface VerifyOtpResponse {
  resetToken: string;
  expiresInMinutes: number;
}

export interface MessageResponse {
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const unwrap = <T,>(json: ApiResponse<T>) => json.data;

export const requestPasswordReset = (email: string) =>
  api
    .post<ApiResponse<OtpSentResponse>>("/auth/forgot-password", {
      email: email.trim(),
    })
    .then(unwrap);

export const resendOtp = (email: string) =>
  api
    .post<ApiResponse<OtpSentResponse>>("/auth/resend-otp", {
      email: email.trim(),
    })
    .then(unwrap);

export const verifyOtp = (email: string, otp: string) =>
  api
    .post<ApiResponse<VerifyOtpResponse>>("/auth/verify-otp", {
      email: email.trim(),
      otp,
    })
    .then(unwrap);

export const resetPassword = (resetToken: string, newPassword: string) =>
  api
    .post<ApiResponse<MessageResponse>>("/auth/reset-password", {
      resetToken,
      newPassword,
    })
    .then(unwrap);

export const changePassword = (
  token: string,
  currentPassword: string,
  newPassword: string
) =>
  api
    .post<ApiResponse<MessageResponse>>(
      "/auth/change-password",
      { currentPassword, newPassword },
      token
    )
    .then(unwrap);
