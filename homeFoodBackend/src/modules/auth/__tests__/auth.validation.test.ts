import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, checkUsernameSchema } from "../auth.validation";

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------
describe("registerSchema", () => {
  it("should accept a valid payload with all required fields", () => {
    const payload = {
      name: "John Doe",
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
    };
    const result = registerSchema.parse(payload);
    expect(result).toMatchObject({
      name: "John Doe",
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
    });
  });

  it("should accept a valid payload with optional phone field", () => {
    const payload = {
      name: "Jane",
      username: "jane_123",
      email: "jane@example.com",
      password: "securePass1",
      phone: "+1234567890",
    };
    const result = registerSchema.parse(payload);
    expect(result.phone).toBe("+1234567890");
  });

  it("should accept a valid payload when phone is omitted", () => {
    const payload = {
      name: "Jane",
      username: "jane_123",
      email: "jane@example.com",
      password: "securePass1",
    };
    const result = registerSchema.parse(payload);
    expect(result.phone).toBeUndefined();
  });

  it("should reject a payload with missing name", () => {
    const payload = {
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
    }
  });

  it("should reject a payload with an empty name", () => {
    const payload = {
      name: "",
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject a payload with missing username", () => {
    const payload = {
      name: "John",
      email: "john@example.com",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("username"))).toBe(true);
    }
  });

  it("should reject a payload with empty username", () => {
    const payload = {
      name: "John",
      username: "",
      email: "john@example.com",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject a username containing spaces", () => {
    const payload = {
      name: "John",
      username: "john doe",
      email: "john@example.com",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject a username containing special characters (non-alphanumeric/underscore)", () => {
    const payload = {
      name: "John",
      username: "john@doe!",
      email: "john@example.com",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject an invalid email", () => {
    const payload = {
      name: "John",
      username: "john_doe",
      email: "not-an-email",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("email"))).toBe(true);
    }
  });

  it("should reject a password shorter than 6 characters", () => {
    const payload = {
      name: "John",
      username: "john_doe",
      email: "john@example.com",
      password: "12345",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("password"))).toBe(true);
    }
  });

  it("should reject a payload with missing email", () => {
    const payload = {
      name: "John",
      username: "john_doe",
      password: "password123",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject a payload with missing password", () => {
    const payload = {
      name: "John",
      username: "john_doe",
      email: "john@example.com",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject a payload with an empty password", () => {
    const payload = {
      name: "John",
      username: "john_doe",
      email: "john@example.com",
      password: "",
    };
    const result = registerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should strip unknown fields", () => {
    const payload = {
      name: "John",
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
      unknownField: "should be stripped",
    };
    const result = registerSchema.parse(payload);
    expect(result).not.toHaveProperty("unknownField");
  });
});

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe("loginSchema", () => {
  it("should accept a valid login payload", () => {
    const payload = {
      email: "john@example.com",
      password: "password123",
    };
    const result = loginSchema.parse(payload);
    expect(result).toMatchObject({
      email: "john@example.com",
      password: "password123",
    });
  });

  it("should reject an invalid email", () => {
    const payload = {
      email: "not-an-email",
      password: "password123",
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("email"))).toBe(true);
    }
  });

  it("should reject a missing email", () => {
    const payload = {
      password: "password123",
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("email"))).toBe(true);
    }
  });

  it("should reject an empty password", () => {
    const payload = {
      email: "john@example.com",
      password: "",
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("password"))).toBe(true);
    }
  });

  it("should reject a missing password", () => {
    const payload = {
      email: "john@example.com",
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("password"))).toBe(true);
    }
  });

  it("should reject an empty email", () => {
    const payload = {
      email: "",
      password: "password123",
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject an email with missing domain", () => {
    const payload = {
      email: "john@",
      password: "password123",
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should strip unknown fields", () => {
    const payload = {
      email: "john@example.com",
      password: "password123",
      extra: "should be stripped",
    };
    const result = loginSchema.parse(payload);
    expect(result).not.toHaveProperty("extra");
  });
});

// ---------------------------------------------------------------------------
// checkUsernameSchema
// ---------------------------------------------------------------------------
describe("checkUsernameSchema", () => {
  it("should accept a valid username payload", () => {
    const payload = { username: "john_doe" };
    const result = checkUsernameSchema.parse(payload);
    expect(result).toEqual({ username: "john_doe" });
  });

  it("should reject an empty username", () => {
    const payload = { username: "" };
    const result = checkUsernameSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject a missing username", () => {
    const payload = {};
    const result = checkUsernameSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should strip unknown fields", () => {
    const payload = {
      username: "john_doe",
      unknownField: "should be stripped",
    };
    const result = checkUsernameSchema.parse(payload);
    expect(result).not.toHaveProperty("unknownField");
  });
});
