"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByUsername = exports.findUserByEmail = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../../model/user/user.model"));
const createUser = async (data) => {
    return await user_model_1.default.create(data);
};
exports.createUser = createUser;
const findUserByEmail = async (email) => {
    return await user_model_1.default.findOne({ email });
};
exports.findUserByEmail = findUserByEmail;
const findUserByUsername = async (username) => {
    return await user_model_1.default.findOne({ username });
};
exports.findUserByUsername = findUserByUsername;
const findUserById = async (id) => {
    return await user_model_1.default.findById(id).select("-password");
};
exports.findUserById = findUserById;
//# sourceMappingURL=auth.repository.js.map