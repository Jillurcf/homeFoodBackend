import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { registerSchema, loginSchema, checkUsernameSchema } from "./auth.validation";
import * as authController from "./auth.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/refresh", authenticate, authController.refreshSession);
router.post("/check-username", validate(checkUsernameSchema), authController.checkUsername);

export default router;