import { Request, Response } from "express";
import { createUser, getUserByEmail, validatePassword } from "../modules/user/user.service";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = await createUser(name, email, password);

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export default { register };
