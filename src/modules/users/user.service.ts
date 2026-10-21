import User, { IUser } from "../../model/user/user.model"; // or from models folder
import bcrypt from "bcrypt";
import { env } from "../../config/env";

export const createUser = async (name: string, email: string, password: string): Promise<IUser> => {
  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  return user;
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

export const validatePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
