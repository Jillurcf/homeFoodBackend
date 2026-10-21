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
const vitest_1 = require("vitest");
// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------
vitest_1.vi.mock("bcrypt", () => ({
    default: {
        hash: vitest_1.vi.fn(),
        compare: vitest_1.vi.fn(),
    },
    hash: vitest_1.vi.fn(),
    compare: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("jsonwebtoken", () => ({
    default: {
        sign: vitest_1.vi.fn(),
    },
    sign: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../auth.repository", () => ({
    findUserByEmail: vitest_1.vi.fn(),
    findUserByUsername: vitest_1.vi.fn(),
    createUser: vitest_1.vi.fn(),
    findUserById: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../auth.events", () => ({
    default: {
        emit: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock("../../config/env", () => ({
    env: {
        JWT_SECRET: "test-secret",
        BCRYPT_SALT_ROUNDS: 10,
        MONGO_URI: "mongodb://localhost:27017/test",
        NODE_ENV: "test",
        PORT: 8080,
    },
}));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authRepository = __importStar(require("../auth.repository"));
const auth_events_1 = __importDefault(require("../auth.events"));
const authService = __importStar(require("../auth.service"));
// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const mockUserDocument = {
    _id: { toString: () => "user-123" },
    name: "John Doe",
    username: "john_doe",
    email: "john@example.com",
    password: "hashed-password-here",
    phone: undefined,
    role: "buyer",
};
const mockRegistrationData = {
    name: "John Doe",
    username: "john_doe",
    email: "john@example.com",
    password: "plain-password",
};
const expectedUserOutput = {
    id: "user-123",
    name: "John Doe",
    username: "john_doe",
    email: "john@example.com",
    phone: undefined,
    role: "buyer",
};
(0, vitest_1.describe)("authService", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    // =====================================================================
    // register
    // =====================================================================
    (0, vitest_1.describe)("register", () => {
        (0, vitest_1.it)("should create a user with hashed password and return user + token", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hashed-password-here");
            vitest_1.vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(jsonwebtoken_1.default.sign).mockReturnValue("jwt-token-123");
            const result = await authService.register(mockRegistrationData);
            // Password should be hashed before storage
            (0, vitest_1.expect)(bcrypt_1.default.hash).toHaveBeenCalledWith("plain-password", 10);
            (0, vitest_1.expect)(authRepository.createUser).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                password: "hashed-password-here",
            }));
            // Return shape
            (0, vitest_1.expect)(result).toHaveProperty("user");
            (0, vitest_1.expect)(result).toHaveProperty("token");
            (0, vitest_1.expect)(result.token).toBe("jwt-token-123");
            (0, vitest_1.expect)(result.user).toMatchObject(expectedUserOutput);
        });
        (0, vitest_1.it)("should return user object without the password field", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hashed-password-here");
            vitest_1.vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(jsonwebtoken_1.default.sign).mockReturnValue("token");
            const result = await authService.register(mockRegistrationData);
            (0, vitest_1.expect)(result.user).not.toHaveProperty("password");
        });
        (0, vitest_1.it)("should generate a JWT token with correct payload", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hash");
            vitest_1.vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument);
            await authService.register(mockRegistrationData);
            (0, vitest_1.expect)(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: "user-123", role: "buyer" }, "test-secret", { expiresIn: "7d" });
        });
        // ---- Duplicate checks ------------------------------------------------
        (0, vitest_1.it)("should throw a 409 error when email already exists", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument);
            await (0, vitest_1.expect)(authService.register(mockRegistrationData)).rejects.toMatchObject({
                status: 409,
                message: "Email already registered",
            });
            (0, vitest_1.expect)(authRepository.createUser).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("should throw a 409 error when username already exists", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(mockUserDocument);
            await (0, vitest_1.expect)(authService.register(mockRegistrationData)).rejects.toMatchObject({
                status: 409,
                message: "Username already taken",
            });
            (0, vitest_1.expect)(authRepository.createUser).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("should check email before username", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument);
            // Even if username is available, should fail on email first
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            await (0, vitest_1.expect)(authService.register(mockRegistrationData)).rejects.toMatchObject({
                status: 409,
                message: "Email already registered",
            });
            (0, vitest_1.expect)(authRepository.findUserByUsername).not.toHaveBeenCalled();
        });
        // ---- Event emission --------------------------------------------------
        (0, vitest_1.it)("should emit 'auth.user.registered' event after successful registration", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hash");
            vitest_1.vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(jsonwebtoken_1.default.sign).mockReturnValue("token");
            await authService.register(mockRegistrationData);
            (0, vitest_1.expect)(auth_events_1.default.emit).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(auth_events_1.default.emit).toHaveBeenCalledWith("auth.user.registered", vitest_1.expect.objectContaining({
                email: "john@example.com",
                name: "John Doe",
            }));
        });
        (0, vitest_1.it)("should emit event with the full user document", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hash");
            vitest_1.vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(jsonwebtoken_1.default.sign).mockReturnValue("token");
            await authService.register(mockRegistrationData);
            (0, vitest_1.expect)(auth_events_1.default.emit).toHaveBeenCalledWith("auth.user.registered", mockUserDocument);
        });
        // ---- Error propagation -----------------------------------------------
        (0, vitest_1.it)("should throw an error when bcrypt.hash fails", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            vitest_1.vi.mocked(bcrypt_1.default.hash).mockRejectedValue(new Error("Hash error"));
            await (0, vitest_1.expect)(authService.register(mockRegistrationData)).rejects.toThrow("Hash error");
        });
        (0, vitest_1.it)("should throw an error when createUser fails", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hash");
            vitest_1.vi.mocked(authRepository.createUser).mockRejectedValue(new Error("DB error"));
            await (0, vitest_1.expect)(authService.register(mockRegistrationData)).rejects.toThrow("DB error");
        });
    });
    // =====================================================================
    // login
    // =====================================================================
    (0, vitest_1.describe)("login", () => {
        (0, vitest_1.it)("should return user (without password) and token for valid credentials", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(bcrypt_1.default.compare).mockResolvedValue(true);
            vitest_1.vi.mocked(jsonwebtoken_1.default.sign).mockReturnValue("jwt-token-456");
            const result = await authService.login("john@example.com", "plain-password");
            (0, vitest_1.expect)(result).toHaveProperty("user");
            (0, vitest_1.expect)(result).toHaveProperty("token");
            (0, vitest_1.expect)(result.token).toBe("jwt-token-456");
            (0, vitest_1.expect)(result.user).toMatchObject(expectedUserOutput);
            (0, vitest_1.expect)(result.user).not.toHaveProperty("password");
        });
        (0, vitest_1.it)("should generate a JWT token for the logged-in user", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(bcrypt_1.default.compare).mockResolvedValue(true);
            await authService.login("john@example.com", "plain-password");
            (0, vitest_1.expect)(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: "user-123", role: "buyer" }, "test-secret", { expiresIn: "7d" });
        });
        (0, vitest_1.it)("should compare the provided password with the stored hash", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(bcrypt_1.default.compare).mockResolvedValue(true);
            vitest_1.vi.mocked(jsonwebtoken_1.default.sign).mockReturnValue("token");
            await authService.login("john@example.com", "plain-password");
            (0, vitest_1.expect)(bcrypt_1.default.compare).toHaveBeenCalledWith("plain-password", "hashed-password-here");
        });
        // ---- Invalid credentials ---------------------------------------------
        (0, vitest_1.it)("should throw a 401 error when email does not exist", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            await (0, vitest_1.expect)(authService.login("unknown@example.com", "password")).rejects.toMatchObject({
                status: 401,
                message: "Invalid email or password",
            });
            (0, vitest_1.expect)(bcrypt_1.default.compare).not.toHaveBeenCalled();
            (0, vitest_1.expect)(jsonwebtoken_1.default.sign).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("should throw a 401 error when password is incorrect", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument);
            vitest_1.vi.mocked(bcrypt_1.default.compare).mockResolvedValue(false);
            await (0, vitest_1.expect)(authService.login("john@example.com", "wrong-password")).rejects.toMatchObject({
                status: 401,
                message: "Invalid email or password",
            });
            (0, vitest_1.expect)(jsonwebtoken_1.default.sign).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("should use a generic error message to not reveal which field is wrong", async () => {
            // Both wrong email and wrong password return the same message
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
            const result = authService.login("unknown@example.com", "any-password");
            await (0, vitest_1.expect)(result).rejects.toMatchObject({
                message: "Invalid email or password",
            });
        });
        // ---- Database errors -------------------------------------------------
        (0, vitest_1.it)("should propagate database errors from findUserByEmail", async () => {
            vitest_1.vi.mocked(authRepository.findUserByEmail).mockRejectedValue(new Error("Database connection lost"));
            await (0, vitest_1.expect)(authService.login("john@example.com", "password")).rejects.toThrow("Database connection lost");
        });
    });
    // =====================================================================
    // getMe
    // =====================================================================
    (0, vitest_1.describe)("getMe", () => {
        (0, vitest_1.it)("should return user when a valid userId is provided", async () => {
            const userData = {
                _id: "user-123",
                name: "John Doe",
                username: "john_doe",
                email: "john@example.com",
                phone: undefined,
                role: "buyer",
            };
            vitest_1.vi.mocked(authRepository.findUserById).mockResolvedValue(userData);
            const result = await authService.getMe("user-123");
            (0, vitest_1.expect)(authRepository.findUserById).toHaveBeenCalledWith("user-123");
            (0, vitest_1.expect)(result).toMatchObject({
                name: "John Doe",
                email: "john@example.com",
            });
        });
        (0, vitest_1.it)("should throw a 404 error when user is not found", async () => {
            vitest_1.vi.mocked(authRepository.findUserById).mockResolvedValue(null);
            await (0, vitest_1.expect)(authService.getMe("nonexistent-id")).rejects.toMatchObject({
                status: 404,
                message: "User not found",
            });
        });
        (0, vitest_1.it)("should propagate database errors from findUserById", async () => {
            vitest_1.vi.mocked(authRepository.findUserById).mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(authService.getMe("user-123")).rejects.toThrow("Database error");
        });
    });
    // =====================================================================
    // checkUsername
    // =====================================================================
    (0, vitest_1.describe)("checkUsername", () => {
        (0, vitest_1.it)("should return { available: true } when username is not taken", async () => {
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
            const result = await authService.checkUsername("new_user");
            (0, vitest_1.expect)(result).toEqual({ available: true });
        });
        (0, vitest_1.it)("should return { available: false } when username is already taken", async () => {
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockResolvedValue(mockUserDocument);
            const result = await authService.checkUsername("john_doe");
            (0, vitest_1.expect)(result).toEqual({ available: false });
        });
        (0, vitest_1.it)("should propagate database errors from findUserByUsername", async () => {
            vitest_1.vi.mocked(authRepository.findUserByUsername).mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(authService.checkUsername("test_user")).rejects.toThrow("Database error");
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map