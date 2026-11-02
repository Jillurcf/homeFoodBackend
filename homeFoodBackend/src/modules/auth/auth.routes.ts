import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { registerSchema, loginSchema, checkUsernameSchema } from "./auth.validation";
import {
  forgotPasswordSchema,
  resendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./passwordReset.validation";
import * as authController from "./auth.controller";
import * as passwordResetController from "./passwordReset.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/refresh", authenticate, authController.refreshSession);
router.post("/check-username", validate(checkUsernameSchema), authController.checkUsername);

// Password reset (OTP) flow
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  passwordResetController.forgotPassword
);
router.post(
  "/resend-otp",
  validate(resendOtpSchema),
  passwordResetController.resendOtp
);
router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  passwordResetController.verifyOtp
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  passwordResetController.resetPassword
);

// Authenticated password change (web + mobile)
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  passwordResetController.changePassword
);

export default router;
