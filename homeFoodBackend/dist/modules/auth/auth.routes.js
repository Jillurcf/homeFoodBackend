"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../../middlewares/validate");
const auth_validation_1 = require("./auth.validation");
const passwordReset_validation_1 = require("./passwordReset.validation");
const authController = __importStar(require("./auth.controller"));
const passwordResetController = __importStar(require("./passwordReset.controller"));
const auth_middleware_1 = require("./auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", (0, validate_1.validate)(auth_validation_1.registerSchema), authController.register);
router.post("/login", (0, validate_1.validate)(auth_validation_1.loginSchema), authController.login);
router.get("/me", auth_middleware_1.authenticate, authController.getMe);
router.post("/refresh", auth_middleware_1.authenticate, authController.refreshSession);
router.post("/check-username", (0, validate_1.validate)(auth_validation_1.checkUsernameSchema), authController.checkUsername);
// Password reset (OTP) flow
router.post("/forgot-password", (0, validate_1.validate)(passwordReset_validation_1.forgotPasswordSchema), passwordResetController.forgotPassword);
router.post("/resend-otp", (0, validate_1.validate)(passwordReset_validation_1.resendOtpSchema), passwordResetController.resendOtp);
router.post("/verify-otp", (0, validate_1.validate)(passwordReset_validation_1.verifyOtpSchema), passwordResetController.verifyOtp);
router.post("/reset-password", (0, validate_1.validate)(passwordReset_validation_1.resetPasswordSchema), passwordResetController.resetPassword);
// Authenticated password change (web + mobile)
router.post("/change-password", auth_middleware_1.authenticate, (0, validate_1.validate)(passwordReset_validation_1.changePasswordSchema), passwordResetController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map