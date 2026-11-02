import { NextFunction, Request, Response, Router } from "express";
import { AuthRequest, authenticate } from "../auth/auth.middleware";
import * as contactController from "./contact.controller";

const router = Router();

const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) return next();
  return authenticate(req as AuthRequest, res, next);
};

router.post("/", optionalAuthenticate, contactController.createSubmission);

export default router;
