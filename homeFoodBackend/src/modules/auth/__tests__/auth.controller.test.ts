import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that use them
// ---------------------------------------------------------------------------

// Mock the validate middleware to parse req.body directly (spec-correct behaviour)
vi.mock("../../middlewares/validate", () => ({
  validate: (schema: any) => (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, errors: result.error.flatten() });
    }
    next();
  },
}));

// Mock the auth service so we control all business logic responses
const mockRegister = vi.fn();
const mockLogin = vi.fn();
const mockGetMe = vi.fn();
const mockCheckUsername = vi.fn();

vi.mock("../auth.service", () => ({
  register: mockRegister,
  login: mockLogin,
  getMe: mockGetMe,
  checkUsername: mockCheckUsername,
}));

// Mock environment config
vi.mock("../../config/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
    BCRYPT_SALT_ROUNDS: 10,
    MONGO_URI: "mongodb://localhost:27017/test",
    NODE_ENV: "test",
    PORT: 8080,
  },
}));

// Mock mongoose to prevent actual database connection at import time
vi.mock("mongoose", () => ({
  default: {
    connect: vi.fn().mockResolvedValue(undefined),
    Schema: class MockSchema {},
    model: vi.fn().mockReturnValue({}),
  },
  Schema: class MockSchema {},
}));

// ---------------------------------------------------------------------------
// App import (triggers mongoose mock — DB connect is suppressed)
// ---------------------------------------------------------------------------
import app from "../../../app";

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
describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 201 and { success, data: { user, token } } for valid input", async () => {
    mockRegister.mockResolvedValue({ user: mockUserData, token: mockToken });

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
    });
    expect(res.body.data).toHaveProperty("token", mockToken);
  });

  it("should call authService.register with the correct payload", async () => {
    mockRegister.mockResolvedValue({ user: mockUserData, token: mockToken });

    await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith(validUser);
  });

  it("should return 409 when email already exists", async () => {
    mockRegister.mockRejectedValue({ status: 409, message: "Email already registered" });

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email already registered");
  });

  it("should return 409 when username already exists", async () => {
    mockRegister.mockRejectedValue({ status: 409, message: "Username already taken" });

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Username already taken");
  });

  it("should return 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "john_doe",
        email: "john@example.com",
        password: "password123",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    // Service should not be called when validation fails
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should return 400 when username is empty", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, username: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should return 400 when email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should return 400 when password is less than 6 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "12345" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John",
        username: "john_doe",
        password: "password123",
      });

    expect(res.status).toBe(400);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should return 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John",
        username: "john_doe",
        email: "john@example.com",
      });

    expect(res.status).toBe(400);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should accept registration with optional phone field", async () => {
    mockRegister.mockResolvedValue({
      user: { ...mockUserData, phone: "+1234567890" },
      token: mockToken,
    });

    const dataWithPhone = { ...validUser, phone: "+1234567890" };
    const res = await request(app).post("/api/auth/register").send(dataWithPhone);

    expect(res.status).toBe(201);
    expect(mockRegister).toHaveBeenCalledWith(dataWithPhone);
  });

  it("should return 500 when authService throws an unexpected error", async () => {
    mockRegister.mockRejectedValue(new Error("Something went wrong"));

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===========================================================================
// POST /api/auth/login
// ===========================================================================
describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 and { success, data: { user, token } } for valid credentials", async () => {
    mockLogin.mockResolvedValue({ user: mockUserData, token: mockToken });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token", mockToken);
    expect(res.body.data.user.email).toBe("john@example.com");
  });

  it("should call authService.login with email and password", async () => {
    mockLogin.mockResolvedValue({ user: mockUserData, token: mockToken });

    await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "password123" });

    expect(mockLogin).toHaveBeenCalledWith("john@example.com", "password123");
  });

  it("should return 401 when password is wrong", async () => {
    mockLogin.mockRejectedValue({ status: 401, message: "Invalid email or password" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("should return 401 when email does not exist", async () => {
    mockLogin.mockRejectedValue({ status: 401, message: "Invalid email or password" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when email format is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should return 400 when password is empty", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "password123" });

    expect(res.status).toBe(400);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should return 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com" });

    expect(res.status).toBe(400);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should return 500 when authService throws an unexpected error", async () => {
    mockLogin.mockRejectedValue(new Error("Unexpected DB error"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "password123" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===========================================================================
// GET /api/auth/me
// ===========================================================================
describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to sign a valid token
  const signToken = (payload: object, expiresIn: string | number = "1h") =>
    jwt.sign(payload, "test-secret", { expiresIn } as any);

  it("should return 200 and user data when a valid token is provided", async () => {
    mockGetMe.mockResolvedValue(mockUserData);
    const token = signToken({ id: "user-123", role: "buyer" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
    });
  });

  it("should call authService.getMe with the user id from the token", async () => {
    mockGetMe.mockResolvedValue(mockUserData);
    const token = signToken({ id: "user-123", role: "buyer" });

    await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(mockGetMe).toHaveBeenCalledWith("user-123");
  });

  it("should return 401 when no Authorization header is provided", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No token provided");
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header does not start with Bearer", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Basic some-token");

    expect(res.status).toBe(401);
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it("should return 401 when an invalid token is provided", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer this-is-not-a-valid-jwt");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it("should return 401 when token is signed with a different secret", async () => {
    const token = jwt.sign({ id: "user-123", role: "buyer" }, "different-secret", {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it("should return 401 when token has expired", async () => {
    const expiredToken = signToken({ id: "user-123", role: "buyer" }, "0s");

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it("should return 401 when token with past exp claim is used", async () => {
    const token = jwt.sign(
      { id: "user-123", role: "buyer", exp: Math.floor(Date.now() / 1000) - 3600 },
      "test-secret"
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it("should return 404 when the user id from token does not match any user", async () => {
    mockGetMe.mockRejectedValue({ status: 404, message: "User not found" });
    const token = signToken({ id: "nonexistent-id", role: "buyer" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User not found");
  });

  it("should return 500 when authService.getMe throws an unexpected error", async () => {
    mockGetMe.mockRejectedValue(new Error("Database connection lost"));
    const token = signToken({ id: "user-123", role: "buyer" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===========================================================================
// POST /api/auth/check-username
// ===========================================================================
describe("POST /api/auth/check-username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return { available: true } when username is not taken", async () => {
    mockCheckUsername.mockResolvedValue({ available: true });

    const res = await request(app)
      .post("/api/auth/check-username")
      .send({ username: "new_user" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ available: true });
  });

  it("should call authService.checkUsername with the username", async () => {
    mockCheckUsername.mockResolvedValue({ available: true });

    await request(app)
      .post("/api/auth/check-username")
      .send({ username: "new_user" });

    expect(mockCheckUsername).toHaveBeenCalledWith("new_user");
  });

  it("should return { available: false } when username is already taken", async () => {
    mockCheckUsername.mockResolvedValue({ available: false });

    const res = await request(app)
      .post("/api/auth/check-username")
      .send({ username: "john_doe" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ available: false });
  });

  it("should return 400 when username is empty", async () => {
    const res = await request(app)
      .post("/api/auth/check-username")
      .send({ username: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockCheckUsername).not.toHaveBeenCalled();
  });

  it("should return 400 when username is missing", async () => {
    const res = await request(app)
      .post("/api/auth/check-username")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockCheckUsername).not.toHaveBeenCalled();
  });

  it("should return 500 when authService.checkUsername throws an unexpected error", async () => {
    mockCheckUsername.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .post("/api/auth/check-username")
      .send({ username: "new_user" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
