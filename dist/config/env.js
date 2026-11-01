"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/homefood";
const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
    ? Number(process.env.BCRYPT_SALT_ROUNDS)
    : 10;
exports.env = {
    PORT,
    NODE_ENV,
    JWT_SECRET,
    MONGO_URI,
    BCRYPT_SALT_ROUNDS
};
//# sourceMappingURL=env.js.map