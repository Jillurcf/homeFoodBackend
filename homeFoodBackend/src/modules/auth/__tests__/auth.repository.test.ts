import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the User model before any imports
const mockCreate = vi.fn();
const mockFindOne = vi.fn();
const mockFindById = vi.fn();

vi.mock("../../model/user/user.model", () => ({
  default: {
    create: mockCreate,
    findOne: mockFindOne,
    findById: mockFindById,
  },
}));

import * as authRepository from "../auth.repository";

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

describe("authRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // createUser
  // -----------------------------------------------------------------------
  describe("createUser", () => {
    it("should create a user in the database and return the created user", async () => {
      mockCreate.mockResolvedValue(mockUser);

      const result = await authRepository.createUser({
        name: "John Doe",
        username: "john_doe",
        email: "john@example.com",
        password: "hashed-password",
        role: "buyer",
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        name: "John Doe",
        username: "john_doe",
        email: "john@example.com",
        password: "hashed-password",
        role: "buyer",
      });
      expect(result).toEqual(mockUser);
    });

    it("should create a user with optional phone field", async () => {
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

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "+1234567890" })
      );
      expect(result.phone).toBe("+1234567890");
    });

    it("should create a user without phone when not provided", async () => {
      mockCreate.mockResolvedValue(mockUser);

      await authRepository.createUser({
        name: "John Doe",
        username: "john_doe",
        email: "john@example.com",
        password: "hashed-password",
        role: "buyer",
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.not.objectContaining({ phone: expect.any(String) })
      );
    });

    it("should throw an error if User.create fails", async () => {
      mockCreate.mockRejectedValue(new Error("Database error"));

      await expect(
        authRepository.createUser({
          name: "John",
          username: "john_doe",
          email: "john@example.com",
          password: "password",
          role: "buyer",
        })
      ).rejects.toThrow("Database error");
    });
  });

  // -----------------------------------------------------------------------
  // findUserByEmail
  // -----------------------------------------------------------------------
  describe("findUserByEmail", () => {
    it("should find a user by email", async () => {
      mockFindOne.mockResolvedValue(mockUser);

      const result = await authRepository.findUserByEmail("john@example.com");

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ email: "john@example.com" });
      expect(result).toEqual(mockUser);
    });

    it("should return null when email does not exist", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await authRepository.findUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });

    it("should handle case-sensitive email search correctly", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await authRepository.findUserByEmail("John@Example.com");

      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // findUserByUsername
  // -----------------------------------------------------------------------
  describe("findUserByUsername", () => {
    it("should find a user by username", async () => {
      mockFindOne.mockResolvedValue(mockUser);

      const result = await authRepository.findUserByUsername("john_doe");

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ username: "john_doe" });
      expect(result).toEqual(mockUser);
    });

    it("should return null when username does not exist", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await authRepository.findUserByUsername("unknown_user");

      expect(result).toBeNull();
    });

    it("should handle case-sensitive username search correctly", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await authRepository.findUserByUsername("John_Doe");

      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // findUserById
  // -----------------------------------------------------------------------
  describe("findUserById", () => {
    it("should find a user by id", async () => {
      mockFindById.mockResolvedValue(mockUserWithoutPassword);

      const result = await authRepository.findUserById("user-123");

      expect(mockFindById).toHaveBeenCalledTimes(1);
      expect(mockFindById).toHaveBeenCalledWith("user-123");
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it("should exclude password from the returned user", async () => {
      mockFindById.mockResolvedValue(mockUserWithoutPassword);

      const result = await authRepository.findUserById("user-123");

      expect(result).not.toHaveProperty("password");
    });

    it("should return null when id does not exist", async () => {
      mockFindById.mockResolvedValue(null);

      const result = await authRepository.findUserById("nonexistent-id");

      expect(result).toBeNull();
    });

    it("should return null when id is empty string", async () => {
      mockFindById.mockResolvedValue(null);

      const result = await authRepository.findUserById("");

      expect(result).toBeNull();
    });

    it("should handle Mongoose CastError for invalid ObjectId format", async () => {
      mockFindById.mockRejectedValue(new Error("Cast to ObjectId failed"));

      await expect(authRepository.findUserById("invalid-id-format")).rejects.toThrow();
    });
  });
});
