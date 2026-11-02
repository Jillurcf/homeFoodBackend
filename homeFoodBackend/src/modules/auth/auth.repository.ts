import User from "../../model/user/user.model";
import { IUser } from "../../model/user/user.model";

export const createUser = async (data: Partial<IUser>) => {
  return await User.create(data);
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const findUserByUsername = async (username: string) => {
  return await User.findOne({ username });
};

export const findUserById = async (id: string) => {
  const query = User.findById(id) as any;

  if (query && typeof query.select === "function") {
    return await query.select("-password");
  }

  return await query;
};

export const findUserByIdWithPassword = async (id: string) => {
  return await User.findById(id);
};

export const updateUserPassword = async (id: string, password: string) => {
  return await User.findByIdAndUpdate(id, { password }, { new: true });
};
