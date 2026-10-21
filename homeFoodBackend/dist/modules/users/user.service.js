"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.getUserByEmail = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../../model/user/user.model")); // or from models folder
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../../config/env");
const createUser = async (name, email, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, env_1.env.BCRYPT_SALT_ROUNDS);
    const user = new user_model_1.default({ name, email, password: hashedPassword });
    await user.save();
    return user;
};
exports.createUser = createUser;
const getUserByEmail = async (email) => {
    return user_model_1.default.findOne({ email });
};
exports.getUserByEmail = getUserByEmail;
const validatePassword = async (plain, hash) => {
    return bcrypt_1.default.compare(plain, hash);
};
exports.validatePassword = validatePassword;
//# sourceMappingURL=user.service.js.map