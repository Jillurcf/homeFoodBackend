"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that use them
// ---------------------------------------------------------------------------
// Mock the validate middleware to parse req.body directly (spec-correct behaviour)
vitest_1.vi.mock("../../middlewares/validate", () => ({
    validate: (schema) => (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ success: false, errors: result.error.flatten() });
        }
        next();
    },
}));
// Mock the auth service so we control all business logic responses
const mockRegister = vitest_1.vi.fn();
const mockLogin = vitest_1.vi.fn();
const mockGetMe = vitest_1.vi.fn();
const mockCheckUsername = vitest_1.vi.fn();
vitest_1.vi.mock("../auth.service", () => ({
    register: mockRegister,
    login: mockLogin,
    getMe: mockGetMe,
    checkUsername: mockCheckUsername,
}));
// Mock environment config
vitest_1.vi.mock("../../config/env", () => ({
    env: {
        JWT_SECRET: "test-secret",
        BCRYPT_SALT_ROUNDS: 10,
        MONGO_URI: "mongodb://localhost:27017/test",
        NODE_ENV: "test",
        PORT: 8080,
    },
}));
// Mock mongoose to prevent actual database connection at import time
vitest_1.vi.mock("mongoose", () => ({
    default: {
        connect: vitest_1.vi.fn().mockResolvedValue(undefined),
        Schema: class MockSchema {
        },
        model: vitest_1.vi.fn().mockReturnValue({}),
    },
    Schema: class MockSchema {
    },
}));
// ---------------------------------------------------------------------------
// App import (triggers mongoose mock — DB connect is suppressed)
// ---------------------------------------------------------------------------
const app_1 = __importDefault(require("../../../app"));
// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const validUser = {
    name: "John Doe",
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
};
const mockUserData = {
    id: "user-123",
    name: "John Doe",
    username: "john_doe",
    email: "john@example.com",
    phone: undefined,
    role: "buyer",
};
const mockToken = "mock-jwt-token";
// ===========================================================================
// POST /api/auth/register
// ===========================================================================
(0, vitest_1.describe)("POST /api/auth/register", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("should return 201 and { success, data: { user, token } } for valid input", async () => {
        mockRegister.mockResolvedValue({ user: mockUserData, token: mockToken });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send(validUser);
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data).toHaveProperty("user");
        (0, vitest_1.expect)(res.body.data.user).toMatchObject({
            name: "John Doe",
            email: "john@example.com",
        });
        (0, vitest_1.expect)(res.body.data).toHaveProperty("token", mockToken);
    });
    (0, vitest_1.it)("should call authService.register with the correct payload", async () => {
        mockRegister.mockResolvedValue({ user: mockUserData, token: mockToken });
        await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send(validUser);
        (0, vitest_1.expect)(mockRegister).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(mockRegister).toHaveBeenCalledWith(validUser);
    });
    (0, vitest_1.it)("should return 409 when email already exists", async () => {
        mockRegister.mockRejectedValue({ status: 409, message: "Email already registered" });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send(validUser);
        (0, vitest_1.expect)(res.status).toBe(409);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.message).toBe("Email already registered");
    });
    (0, vitest_1.it)("should return 409 when username already exists", async () => {
        mockRegister.mockRejectedValue({ status: 409, message: "Username already taken" });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send(validUser);
        (0, vitest_1.expect)(res.status).toBe(409);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.message).toBe("Username already taken");
    });
    (0, vitest_1.it)("should return 400 when name is missing", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send({
            username: "john_doe",
            email: "john@example.com",
            password: "password123",
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        // Service should not be called when validation fails
        (0, vitest_1.expect)(mockRegister).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when username is empty", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send({ ...validUser, username: "" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(mockRegister).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when email is invalid", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send({ ...validUser, email: "not-an-email" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(mockRegister).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when password is less than 6 characters", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send({ ...validUser, password: "12345" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(mockRegister).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when email is missing", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send({
            name: "John",
            username: "john_doe",
            password: "password123",
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(mockRegister).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when password is missing", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send({
            name: "John",
            username: "john_doe",
            email: "john@example.com",
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(mockRegister).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should accept registration with optional phone field", async () => {
        mockRegister.mockResolvedValue({
            user: { ...mockUserData, phone: "+1234567890" },
            token: mockToken,
        });
        const dataWithPhone = { ...validUser, phone: "+1234567890" };
        const res = await (0, supertest_1.default)(app_1.default).post("/api/auth/register").send(dataWithPhone);
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(mockRegister).toHaveBeenCalledWith(dataWithPhone);
    });
    (0, vitest_1.it)("should return 500 when authService throws an unexpected error", async () => {
        mockRegister.mockRejectedValue(new Error("Something went wrong"));
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/register")
            .send(validUser);
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
});
// ===========================================================================
// POST /api/auth/login
// ===========================================================================
(0, vitest_1.describe)("POST /api/auth/login", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("should return 200 and { success, data: { user, token } } for valid credentials", async () => {
        mockLogin.mockResolvedValue({ user: mockUserData, token: mockToken });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "password123" });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data).toHaveProperty("user");
        (0, vitest_1.expect)(res.body.data).toHaveProperty("token", mockToken);
        (0, vitest_1.expect)(res.body.data.user.email).toBe("john@example.com");
    });
    (0, vitest_1.it)("should call authService.login with email and password", async () => {
        mockLogin.mockResolvedValue({ user: mockUserData, token: mockToken });
        await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "password123" });
        (0, vitest_1.expect)(mockLogin).toHaveBeenCalledWith("john@example.com", "password123");
    });
    (0, vitest_1.it)("should return 401 when password is wrong", async () => {
        mockLogin.mockRejectedValue({ status: 401, message: "Invalid email or password" });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "wrong-password" });
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.message).toBe("Invalid email or password");
    });
    (0, vitest_1.it)("should return 401 when email does not exist", async () => {
        mockLogin.mockRejectedValue({ status: 401, message: "Invalid email or password" });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "nonexistent@example.com", password: "password123" });
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
    (0, vitest_1.it)("should return 400 when email format is invalid", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "not-an-email", password: "password123" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(mockLogin).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when password is empty", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(mockLogin).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when email is missing", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ password: "password123" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(mockLogin).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when password is missing", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "john@example.com" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(mockLogin).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 500 when authService throws an unexpected error", async () => {
        mockLogin.mockRejectedValue(new Error("Unexpected DB error"));
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "password123" });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
});
// ===========================================================================
// GET /api/auth/me
// ===========================================================================
(0, vitest_1.describe)("GET /api/auth/me", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    // Helper to sign a valid token
    const signToken = (payload, expiresIn = "1h") => jsonwebtoken_1.default.sign(payload, "test-secret", { expiresIn });
    (0, vitest_1.it)("should return 200 and user data when a valid token is provided", async () => {
        mockGetMe.mockResolvedValue(mockUserData);
        const token = signToken({ id: "user-123", role: "buyer" });
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data).toMatchObject({
            name: "John Doe",
            email: "john@example.com",
        });
    });
    (0, vitest_1.it)("should call authService.getMe with the user id from the token", async () => {
        mockGetMe.mockResolvedValue(mockUserData);
        const token = signToken({ id: "user-123", role: "buyer" });
        await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(mockGetMe).toHaveBeenCalledWith("user-123");
    });
    (0, vitest_1.it)("should return 401 when no Authorization header is provided", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/api/auth/me");
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.message).toBe("No token provided");
        (0, vitest_1.expect)(mockGetMe).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when Authorization header does not start with Bearer", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", "Basic some-token");
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(mockGetMe).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when an invalid token is provided", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", "Bearer this-is-not-a-valid-jwt");
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body.message).toBe("Invalid or expired token");
        (0, vitest_1.expect)(mockGetMe).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when token is signed with a different secret", async () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer" }, "different-secret", {
            expiresIn: "1h",
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(mockGetMe).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when token has expired", async () => {
        const expiredToken = signToken({ id: "user-123", role: "buyer" }, "0s");
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${expiredToken}`);
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body.message).toBe("Invalid or expired token");
        (0, vitest_1.expect)(mockGetMe).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 401 when token with past exp claim is used", async () => {
        const token = jsonwebtoken_1.default.sign({ id: "user-123", role: "buyer", exp: Math.floor(Date.now() / 1000) - 3600 }, "test-secret");
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(mockGetMe).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 404 when the user id from token does not match any user", async () => {
        mockGetMe.mockRejectedValue({ status: 404, message: "User not found" });
        const token = signToken({ id: "nonexistent-id", role: "buyer" });
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.message).toBe("User not found");
    });
    (0, vitest_1.it)("should return 500 when authService.getMe throws an unexpected error", async () => {
        mockGetMe.mockRejectedValue(new Error("Database connection lost"));
        const token = signToken({ id: "user-123", role: "buyer" });
        const res = await (0, supertest_1.default)(app_1.default)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
});
// ===========================================================================
// POST /api/auth/check-username
// ===========================================================================
(0, vitest_1.describe)("POST /api/auth/check-username", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("should return { available: true } when username is not taken", async () => {
        mockCheckUsername.mockResolvedValue({ available: true });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/check-username")
            .send({ username: "new_user" });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data).toEqual({ available: true });
    });
    (0, vitest_1.it)("should call authService.checkUsername with the username", async () => {
        mockCheckUsername.mockResolvedValue({ available: true });
        await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/check-username")
            .send({ username: "new_user" });
        (0, vitest_1.expect)(mockCheckUsername).toHaveBeenCalledWith("new_user");
    });
    (0, vitest_1.it)("should return { available: false } when username is already taken", async () => {
        mockCheckUsername.mockResolvedValue({ available: false });
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/check-username")
            .send({ username: "john_doe" });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data).toEqual({ available: false });
    });
    (0, vitest_1.it)("should return 400 when username is empty", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/check-username")
            .send({ username: "" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(mockCheckUsername).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 400 when username is missing", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/check-username")
            .send({});
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(mockCheckUsername).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should return 500 when authService.checkUsername throws an unexpected error", async () => {
        mockCheckUsername.mockRejectedValue(new Error("Database error"));
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/api/auth/check-username")
            .send({ username: "new_user" });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
});
//# sourceMappingURL=auth.controller.test.js.map