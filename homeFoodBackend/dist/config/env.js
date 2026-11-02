"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env.local first (local overrides), then .env as the base config.
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env.local") });
dotenv_1.default.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/homefood";
const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
    ? Number(process.env.BCRYPT_SALT_ROUNDS)
    : 10;
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "HomeFood <no-reply@homefood.local>";
const APP_NAME = process.env.APP_NAME || "HomeFood";
const OTP_TTL_MINUTES = process.env.OTP_TTL_MINUTES
    ? Number(process.env.OTP_TTL_MINUTES)
    : 10;
const OTP_MAX_ATTEMPTS = process.env.OTP_MAX_ATTEMPTS
    ? Number(process.env.OTP_MAX_ATTEMPTS)
    : 5;
const OTP_RESEND_COOLDOWN_SECONDS = process.env.OTP_RESEND_COOLDOWN_SECONDS
    ? Number(process.env.OTP_RESEND_COOLDOWN_SECONDS)
    : 60;
exports.env = {
    PORT,
    NODE_ENV,
    JWT_SECRET,
    MONGO_URI,
    BCRYPT_SALT_ROUNDS,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    APP_NAME,
    OTP_TTL_MINUTES,
    OTP_MAX_ATTEMPTS,
    OTP_RESEND_COOLDOWN_SECONDS,
};
//# sourceMappingURL=env.js.map