"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsername = exports.refreshSession = exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const authRepository = __importStar(require("./auth.repository"));
const auth_events_1 = __importDefault(require("./auth.events"));
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
};
const register = async (data) => {
    const existingEmail = await authRepository.findUserByEmail(data.email);
    if (existingEmail) {
        throw { status: 409, message: "Email already registered" };
    }
    const existingUsername = await authRepository.findUserByUsername(data.username);
    if (existingUsername) {
        throw { status: 409, message: "Username already taken" };
    }
    const hashedPassword = await bcrypt_1.default.hash(data.password, env_1.env.BCRYPT_SALT_ROUNDS);
    const user = await authRepository.createUser({
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        nidNumber: data.nidNumber,
        address: data.address,
        role: "buyer",
    });
    const userId = user._id.toString();
    const token = generateToken(userId, user.role);
    auth_events_1.default.emit("auth.user.registered", user);
    return {
        user: {
            id: userId,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            nidNumber: user.nidNumber,
            address: user.address,
            role: user.role,
        },
        token,
    };
};
exports.register = register;
const login = async (email, password) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
        throw { status: 401, message: "Invalid email or password" };
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw { status: 401, message: "Invalid email or password" };
    }
    const userId = user._id.toString();
    const token = generateToken(userId, user.role);
    return {
        user: {
            id: userId,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            nidNumber: user.nidNumber,
            address: user.address,
            role: user.role,
        },
        token,
    };
};
exports.login = login;
const getMe = async (userId) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
        throw { status: 404, message: "User not found" };
    }
    return user;
};
exports.getMe = getMe;
const refreshSession = async (userId) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
        throw { status: 404, message: "User not found" };
    }
    return {
        user: {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
        },
        token: generateToken(user._id.toString(), user.role),
    };
};
exports.refreshSession = refreshSession;
const checkUsername = async (username) => {
    const existing = await authRepository.findUserByUsername(username);
    return { available: !existing };
};
exports.checkUsername = checkUsername;
//# sourceMappingURL=auth.service.js.map