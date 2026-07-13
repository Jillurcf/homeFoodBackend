import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
type NodeEnv = "development" | "production" | "test";
const NODE_ENV: NodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/homefood";
const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
  ? Number(process.env.BCRYPT_SALT_ROUNDS)
  : 10;

export const env = {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  MONGO_URI,
  BCRYPT_SALT_ROUNDS
};
