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
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Mock the User model before any imports
const mockCreate = vitest_1.vi.fn();
const mockFindOne = vitest_1.vi.fn();
const mockFindById = vitest_1.vi.fn();
vitest_1.vi.mock("../../model/user/user.model", () => ({
    default: {
        create: mockCreate,
        findOne: mockFindOne,
        findById: mockFindById,
    },
}));
const authRepository = __importStar(require("../auth.repository"));
// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const mockUser = {
    _id: { toString: () => "user-123" },
    id: "user-123",
    name: "John Doe",
    username: "john_doe",
    email: "john@example.com",
    password: "hashed-password",
    phone: "+1234567890",
    role: "buyer",
};
const mockUserWithoutPassword = {
    _id: { toString: () => "user-123" },
    id: "user-123",
    name: "John Doe",
    username: "john_doe",
    email: "john@example.com",
    phone: "+1234567890",
    role: "buyer",
};
(0, vitest_1.describe)("authRepository", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    // -----------------------------------------------------------------------
    // createUser
    // -----------------------------------------------------------------------
    (0, vitest_1.describe)("createUser", () => {
        (0, vitest_1.it)("should create a user in the database and return the created user", async () => {
            mockCreate.mockResolvedValue(mockUser);
            const result = await authRepository.createUser({
                name: "John Doe",
                username: "john_doe",
                email: "john@example.com",
                password: "hashed-password",
                role: "buyer",
            });
            (0, vitest_1.expect)(mockCreate).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith({
                name: "John Doe",
                username: "john_doe",
                email: "john@example.com",
                password: "hashed-password",
                role: "buyer",
            });
            (0, vitest_1.expect)(result).toEqual(mockUser);
        });
        (0, vitest_1.it)("should create a user with optional phone field", async () => {
            const userWithPhone = { ...mockUser, phone: "+1234567890" };
            mockCreate.mockResolvedValue(userWithPhone);
            const result = await authRepository.createUser({
                name: "John Doe",
                username: "john_doe",
                email: "john@example.com",
                password: "hashed-password",
                phone: "+1234567890",
                role: "buyer",
            });
            (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ phone: "+1234567890" }));
            (0, vitest_1.expect)(result.phone).toBe("+1234567890");
        });
        (0, vitest_1.it)("should create a user without phone when not provided", async () => {
            mockCreate.mockResolvedValue(mockUser);
            await authRepository.createUser({
                name: "John Doe",
                username: "john_doe",
                email: "john@example.com",
                password: "hashed-password",
                role: "buyer",
            });
            (0, vitest_1.expect)(mockCreate).toHaveBeenCalledWith(vitest_1.expect.not.objectContaining({ phone: vitest_1.expect.any(String) }));
        });
        (0, vitest_1.it)("should throw an error if User.create fails", async () => {
            mockCreate.mockRejectedValue(new Error("Database error"));
            await (0, vitest_1.expect)(authRepository.createUser({
                name: "John",
                username: "john_doe",
                email: "john@example.com",
                password: "password",
                role: "buyer",
            })).rejects.toThrow("Database error");
        });
    });
    // -----------------------------------------------------------------------
    // findUserByEmail
    // -----------------------------------------------------------------------
    (0, vitest_1.describe)("findUserByEmail", () => {
        (0, vitest_1.it)("should find a user by email", async () => {
            mockFindOne.mockResolvedValue(mockUser);
            const result = await authRepository.findUserByEmail("john@example.com");
            (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledWith({ email: "john@example.com" });
            (0, vitest_1.expect)(result).toEqual(mockUser);
        });
        (0, vitest_1.it)("should return null when email does not exist", async () => {
            mockFindOne.mockResolvedValue(null);
            const result = await authRepository.findUserByEmail("nonexistent@example.com");
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)("should handle case-sensitive email search correctly", async () => {
            mockFindOne.mockResolvedValue(null);
            const result = await authRepository.findUserByEmail("John@Example.com");
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    // -----------------------------------------------------------------------
    // findUserByUsername
    // -----------------------------------------------------------------------
    (0, vitest_1.describe)("findUserByUsername", () => {
        (0, vitest_1.it)("should find a user by username", async () => {
            mockFindOne.mockResolvedValue(mockUser);
            const result = await authRepository.findUserByUsername("john_doe");
            (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(mockFindOne).toHaveBeenCalledWith({ username: "john_doe" });
            (0, vitest_1.expect)(result).toEqual(mockUser);
        });
        (0, vitest_1.it)("should return null when username does not exist", async () => {
            mockFindOne.mockResolvedValue(null);
            const result = await authRepository.findUserByUsername("unknown_user");
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)("should handle case-sensitive username search correctly", async () => {
            mockFindOne.mockResolvedValue(null);
            const result = await authRepository.findUserByUsername("John_Doe");
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    // -----------------------------------------------------------------------
    // findUserById
    // -----------------------------------------------------------------------
    (0, vitest_1.describe)("findUserById", () => {
        (0, vitest_1.it)("should find a user by id", async () => {
            mockFindById.mockResolvedValue(mockUserWithoutPassword);
            const result = await authRepository.findUserById("user-123");
            (0, vitest_1.expect)(mockFindById).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(mockFindById).toHaveBeenCalledWith("user-123");
            (0, vitest_1.expect)(result).toEqual(mockUserWithoutPassword);
        });
        (0, vitest_1.it)("should exclude password from the returned user", async () => {
            mockFindById.mockResolvedValue(mockUserWithoutPassword);
            const result = await authRepository.findUserById("user-123");
            (0, vitest_1.expect)(result).not.toHaveProperty("password");
        });
        (0, vitest_1.it)("should return null when id does not exist", async () => {
            mockFindById.mockResolvedValue(null);
            const result = await authRepository.findUserById("nonexistent-id");
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)("should return null when id is empty string", async () => {
            mockFindById.mockResolvedValue(null);
            const result = await authRepository.findUserById("");
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)("should handle Mongoose CastError for invalid ObjectId format", async () => {
            mockFindById.mockRejectedValue(new Error("Cast to ObjectId failed"));
            await (0, vitest_1.expect)(authRepository.findUserById("invalid-id-format")).rejects.toThrow();
        });
    });
});
//# sourceMappingURL=auth.repository.test.js.map