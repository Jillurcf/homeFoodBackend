"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock env BEFORE importing the middleware
vitest_1.vi.mock("../../../config/env", () => ({
    env: {
        JWT_SECRET: "test-secret",
        BCRYPT_SALT_ROUNDS: 10,
        MONGO_URI: "mongodb://localhost:27017/test",
        NODE_ENV: "test",
        PORT: 8080,
    },
}));
const auth_middleware_1 = require("../auth.middleware");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const createMockReqRes = () => {
    const req = {
        headers: {},
    };
    const res = {
        status: vitest_1.vi.fn().mockReturnThis(),
        json: vitest_1.vi.fn().mockReturnThis(),
    };
    const next = vitest_1.vi.fn();
    return { req, res, next };
};
(0, vitest_1.describe)("authenticate middleware", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    // ---- Valid token --------------------------------------------------------
    (0, vitest_1.it)("should call next() when a valid Bearer token is provided", () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer" }, "test-secret", {
            expiresIn: "1h",
        });
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(res.status).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should attach decoded user to request object", () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer" }, "test-secret", {
            expiresIn: "1h",
        });
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(req.user).toBeDefined();
        (0, vitest_1.expect)(req.user.id).toBe("user-123");
        (0, vitest_1.expect)(req.user.role).toBe("buyer");
    });
    (0, vitest_1.it)("should attach the correct role from token payload", () => {
        const token = jsonwebtoken_1.default.sign({ id: "admin-1", role: "admin" }, "test-secret", {
            expiresIn: "1h",
        });
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(req.user.role).toBe("admin");
    });
    (0, vitest_1.it)("should reject a token without a user id", () => {
        const token = jsonwebtoken_1.default.sign({ role: "buyer" }, "test-secret", {
            expiresIn: "1h",
        });
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should reject a token with an unsupported role", () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "guest" }, "test-secret", {
            expiresIn: "1h",
        });
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    // ---- Missing / malformed header ----------------------------------------
    (0, vitest_1.it)("should return 401 when no Authorization header is provided", () => {
        const { req, res, next } = createMockReqRes();
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No token provided",
        });
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when Authorization header is empty", () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: "" };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when Authorization header does not start with Bearer", () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: "Basic some-token" };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when token part is missing after 'Bearer '", () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: "Bearer " };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    // ---- Invalid token -----------------------------------------------------
    (0, vitest_1.it)("should return 401 when token is malformed (invalid JWT)", () => {
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: "Bearer not-a-valid-jwt-token" };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when token is signed with a different secret", () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer" }, "wrong-secret", {
            expiresIn: "1h",
        });
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    // ---- Expired token -----------------------------------------------------
    (0, vitest_1.it)("should return 401 when token has expired", () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer" }, "test-secret", {
            expiresIn: "0s",
        });
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when token has a past expiration timestamp", () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer", exp: Math.floor(Date.now() / 1000) - 3600 }, "test-secret");
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${token}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    // ---- Token manipulation -------------------------------------------------
    (0, vitest_1.it)("should return 401 when token payload has been tampered with", () => {
        // Create a valid token then mangle the payload part
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer" }, "test-secret", {
            expiresIn: "1h",
        });
        const parts = token.split(".");
        const tamperedToken = `${parts[0]}.${parts[1]}modified.${parts[2]}`;
        const { req, res, next } = createMockReqRes();
        req.headers = { authorization: `Bearer ${tamperedToken}` };
        (0, auth_middleware_1.authenticate)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=auth.middleware.test.js.map