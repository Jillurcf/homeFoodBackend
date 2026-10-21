import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Mock env BEFORE importing the middleware
vi.mock("../../../config/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
    BCRYPT_SALT_ROUNDS: 10,
    MONGO_URI: "mongodb://localhost:27017/test",
    NODE_ENV: "test",
    PORT: 8080,
  },
}));

import { authenticate, AuthRequest } from "../auth.middleware";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const createMockReqRes = () => {
  const req = {
    headers: {},
  } as unknown as AuthRequest;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, next };
};

describe("authenticate middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- Valid token --------------------------------------------------------
  it("should call next() when a valid Bearer token is provided", () => {
    const token = jwt.sign({ id: "user-123", role: "buyer" }, "test-secret", {
      expiresIn: "1h",
    });
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should attach decoded user to request object", () => {
    const token = jwt.sign({ id: "user-123", role: "buyer" }, "test-secret", {
      expiresIn: "1h",
    });
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user!.id).toBe("user-123");
    expect(req.user!.role).toBe("buyer");
  });

  it("should attach the correct role from token payload", () => {
    const token = jwt.sign({ id: "admin-1", role: "admin" }, "test-secret", {
      expiresIn: "1h",
    });
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(req.user!.role).toBe("admin");
  });

  it("should reject a token without a user id", () => {
    const token = jwt.sign({ role: "buyer" }, "test-secret", {
      expiresIn: "1h",
    });
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject a token with an unsupported role", () => {
    const token = jwt.sign({ id: "user-123", role: "guest" }, "test-secret", {
      expiresIn: "1h",
    });
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ---- Missing / malformed header ----------------------------------------
  it("should return 401 when no Authorization header is provided", () => {
    const { req, res, next } = createMockReqRes();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header is empty", () => {
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: "" };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header does not start with Bearer", () => {
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: "Basic some-token" };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token part is missing after 'Bearer '", () => {
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: "Bearer " };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ---- Invalid token -----------------------------------------------------
  it("should return 401 when token is malformed (invalid JWT)", () => {
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: "Bearer not-a-valid-jwt-token" };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is signed with a different secret", () => {
    const token = jwt.sign({ id: "user-123", role: "buyer" }, "wrong-secret", {
      expiresIn: "1h",
    });
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ---- Expired token -----------------------------------------------------
  it("should return 401 when token has expired", () => {
    const token = jwt.sign({ id: "user-123", role: "buyer" }, "test-secret", {
      expiresIn: "0s",
    });
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token has a past expiration timestamp", () => {
    const token = jwt.sign(
      { id: "user-123", role: "buyer", exp: Math.floor(Date.now() / 1000) - 3600 },
      "test-secret"
    );
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ---- Token manipulation -------------------------------------------------
  it("should return 401 when token payload has been tampered with", () => {
    // Create a valid token then mangle the payload part
    const token = jwt.sign({ id: "user-123", role: "buyer" }, "test-secret", {
      expiresIn: "1h",
    });
    const parts = token.split(".");
    const tamperedToken = `${parts[0]}.${parts[1]}modified.${parts[2]}`;
    const { req, res, next } = createMockReqRes();
    req.headers = { authorization: `Bearer ${tamperedToken}` };

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
