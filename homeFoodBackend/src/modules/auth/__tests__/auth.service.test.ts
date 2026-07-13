import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
  sign: vi.fn(),
}));

vi.mock("../auth.repository", () => ({
  findUserByEmail: vi.fn(),
  findUserByUsername: vi.fn(),
  createUser: vi.fn(),
  findUserById: vi.fn(),
}));

vi.mock("../auth.events", () => ({
  default: {
    emit: vi.fn(),
  },
}));

vi.mock("../../config/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
    BCRYPT_SALT_ROUNDS: 10,
    MONGO_URI: "mongodb://localhost:27017/test",
    NODE_ENV: "test",
    PORT: 8080,
  },
}));

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepository from "../auth.repository";
import authEvents from "../auth.events";
import * as authService from "../auth.service";

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
  role: "buyer" as const,
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

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =====================================================================
  // register
  // =====================================================================
  describe("register", () => {
    it("should create a user with hashed password and return user + token", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password-here" as never);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument as any);
      vi.mocked(jwt.sign).mockReturnValue("jwt-token-123" as never);

      const result = await authService.register(mockRegistrationData);

      // Password should be hashed before storage
      expect(bcrypt.hash).toHaveBeenCalledWith("plain-password", 10);
      expect(authRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashed-password-here",
        })
      );

      // Return shape
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.token).toBe("jwt-token-123");
      expect(result.user).toMatchObject(expectedUserOutput);
    });

    it("should return user object without the password field", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password-here" as never);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument as any);
      vi.mocked(jwt.sign).mockReturnValue("token" as never);

      const result = await authService.register(mockRegistrationData);

      expect(result.user).not.toHaveProperty("password");
    });

    it("should generate a JWT token with correct payload", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hash" as never);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument as any);

      await authService.register(mockRegistrationData);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "user-123", role: "buyer" },
        "test-secret",
        { expiresIn: "7d" }
      );
    });

    // ---- Duplicate checks ------------------------------------------------
    it("should throw a 409 error when email already exists", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument as any);

      await expect(authService.register(mockRegistrationData)).rejects.toMatchObject({
        status: 409,
        message: "Email already registered",
      });

      expect(authRepository.createUser).not.toHaveBeenCalled();
    });

    it("should throw a 409 error when username already exists", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(mockUserDocument as any);

      await expect(authService.register(mockRegistrationData)).rejects.toMatchObject({
        status: 409,
        message: "Username already taken",
      });

      expect(authRepository.createUser).not.toHaveBeenCalled();
    });

    it("should check email before username", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument as any);
      // Even if username is available, should fail on email first
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);

      await expect(authService.register(mockRegistrationData)).rejects.toMatchObject({
        status: 409,
        message: "Email already registered",
      });

      expect(authRepository.findUserByUsername).not.toHaveBeenCalled();
    });

    // ---- Event emission --------------------------------------------------
    it("should emit 'auth.user.registered' event after successful registration", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hash" as never);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument as any);
      vi.mocked(jwt.sign).mockReturnValue("token" as never);

      await authService.register(mockRegistrationData);

      expect(authEvents.emit).toHaveBeenCalledTimes(1);
      expect(authEvents.emit).toHaveBeenCalledWith(
        "auth.user.registered",
        expect.objectContaining({
          email: "john@example.com",
          name: "John Doe",
        })
      );
    });

    it("should emit event with the full user document", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hash" as never);
      vi.mocked(authRepository.createUser).mockResolvedValue(mockUserDocument as any);
      vi.mocked(jwt.sign).mockReturnValue("token" as never);

      await authService.register(mockRegistrationData);

      expect(authEvents.emit).toHaveBeenCalledWith(
        "auth.user.registered",
        mockUserDocument
      );
    });

    // ---- Error propagation -----------------------------------------------
    it("should throw an error when bcrypt.hash fails", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockRejectedValue(new Error("Hash error") as never);

      await expect(authService.register(mockRegistrationData)).rejects.toThrow("Hash error");
    });

    it("should throw an error when createUser fails", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hash" as never);
      vi.mocked(authRepository.createUser).mockRejectedValue(new Error("DB error"));

      await expect(authService.register(mockRegistrationData)).rejects.toThrow("DB error");
    });
  });

  // =====================================================================
  // login
  // =====================================================================
  describe("login", () => {
    it("should return user (without password) and token for valid credentials", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("jwt-token-456" as never);

      const result = await authService.login("john@example.com", "plain-password");

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.token).toBe("jwt-token-456");
      expect(result.user).toMatchObject(expectedUserOutput);
      expect(result.user).not.toHaveProperty("password");
    });

    it("should generate a JWT token for the logged-in user", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await authService.login("john@example.com", "plain-password");

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "user-123", role: "buyer" },
        "test-secret",
        { expiresIn: "7d" }
      );
    });

    it("should compare the provided password with the stored hash", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("token" as never);

      await authService.login("john@example.com", "plain-password");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "plain-password",
        "hashed-password-here"
      );
    });

    // ---- Invalid credentials ---------------------------------------------
    it("should throw a 401 error when email does not exist", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      await expect(
        authService.login("unknown@example.com", "password")
      ).rejects.toMatchObject({
        status: 401,
        message: "Invalid email or password",
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should throw a 401 error when password is incorrect", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(mockUserDocument as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login("john@example.com", "wrong-password")
      ).rejects.toMatchObject({
        status: 401,
        message: "Invalid email or password",
      });

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should use a generic error message to not reveal which field is wrong", async () => {
      // Both wrong email and wrong password return the same message
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      const result = authService.login("unknown@example.com", "any-password");

      await expect(result).rejects.toMatchObject({
        message: "Invalid email or password",
      });
    });

    // ---- Database errors -------------------------------------------------
    it("should propagate database errors from findUserByEmail", async () => {
      vi.mocked(authRepository.findUserByEmail).mockRejectedValue(
        new Error("Database connection lost")
      );

      await expect(
        authService.login("john@example.com", "password")
      ).rejects.toThrow("Database connection lost");
    });
  });

  // =====================================================================
  // getMe
  // =====================================================================
  describe("getMe", () => {
    it("should return user when a valid userId is provided", async () => {
      const userData = {
        _id: "user-123",
        name: "John Doe",
        username: "john_doe",
        email: "john@example.com",
        phone: undefined,
        role: "buyer",
      };
      vi.mocked(authRepository.findUserById).mockResolvedValue(userData as any);

      const result = await authService.getMe("user-123");

      expect(authRepository.findUserById).toHaveBeenCalledWith("user-123");
      expect(result).toMatchObject({
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("should throw a 404 error when user is not found", async () => {
      vi.mocked(authRepository.findUserById).mockResolvedValue(null);

      await expect(authService.getMe("nonexistent-id")).rejects.toMatchObject({
        status: 404,
        message: "User not found",
      });
    });

    it("should propagate database errors from findUserById", async () => {
      vi.mocked(authRepository.findUserById).mockRejectedValue(
        new Error("Database error")
      );

      await expect(authService.getMe("user-123")).rejects.toThrow("Database error");
    });
  });

  // =====================================================================
  // checkUsername
  // =====================================================================
  describe("checkUsername", () => {
    it("should return { available: true } when username is not taken", async () => {
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(null);

      const result = await authService.checkUsername("new_user");

      expect(result).toEqual({ available: true });
    });

    it("should return { available: false } when username is already taken", async () => {
      vi.mocked(authRepository.findUserByUsername).mockResolvedValue(mockUserDocument as any);

      const result = await authService.checkUsername("john_doe");

      expect(result).toEqual({ available: false });
    });

    it("should propagate database errors from findUserByUsername", async () => {
      vi.mocked(authRepository.findUserByUsername).mockRejectedValue(
        new Error("Database error")
      );

      await expect(authService.checkUsername("test_user")).rejects.toThrow("Database error");
    });
  });
});
