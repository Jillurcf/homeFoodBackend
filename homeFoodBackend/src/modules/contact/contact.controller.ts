import { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import * as contactService from "./contact.service";
import { contactSubmissionSchema } from "./contact.validation";

export const createSubmission = async (req: AuthRequest, res: Response) => {
  const parsed = contactSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: parsed.error.issues,
    });
  }

  try {
    const data = await contactService.createSubmission(parsed.data, req.user);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("[contact] Failed to save contact submission:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save your message. Please try again.",
    });
  }
};

export const listSubmissions = async (_req: Request, res: Response) => {
  try {
    const data = await contactService.listSubmissions();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[contact] Failed to load contact submissions:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load contact submissions.",
    });
  }
};
