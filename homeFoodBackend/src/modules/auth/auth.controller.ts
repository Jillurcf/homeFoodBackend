import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequest } from "./auth.middleware";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.user!.id);
    return res.json({ success: true, data: user });
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const refreshSession = async (req: AuthRequest, res: Response) => {
  try {
    const result = await authService.refreshSession(req.user!.id);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const result = await authService.checkUsername(req.body.username);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
