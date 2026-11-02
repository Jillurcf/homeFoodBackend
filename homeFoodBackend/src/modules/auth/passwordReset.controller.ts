import { Request, Response } from "express";
import * as passwordResetService from "./passwordReset.service";
import { AuthRequest } from "./auth.middleware";

const handleError = (res: Response, err: any) => {
  const status = err?.status || 500;
  const body: Record<string, unknown> = {
    success: false,
    message: err?.message ?? "Something went wrong",
  };
  if (err?.retryAfter) body.retryAfter = err.retryAfter;
  return res.status(status).json(body);
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await passwordResetService.requestPasswordReset(
      req.body.email
    );
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err);
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const result = await passwordResetService.resendOtp(req.body.email);
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const result = await passwordResetService.verifyOtp(
      req.body.email,
      req.body.otp
    );
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const result = await passwordResetService.resetPassword(
      req.body.resetToken,
      req.body.newPassword
    );
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const result = await passwordResetService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    return res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err);
  }
};
