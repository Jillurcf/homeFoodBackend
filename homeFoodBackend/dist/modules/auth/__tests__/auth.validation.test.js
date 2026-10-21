"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_validation_1 = require("../auth.validation");
// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------
(0, vitest_1.describe)("registerSchema", () => {
    (0, vitest_1.it)("should accept a valid payload with all required fields", () => {
        const payload = {
            name: "John Doe",
            username: "john_doe",
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.parse(payload);
        (0, vitest_1.expect)(result).toMatchObject({
            name: "John Doe",
            username: "john_doe",
            email: "john@example.com",
            password: "password123",
        });
    });
    (0, vitest_1.it)("should accept a valid payload with optional phone field", () => {
        const payload = {
            name: "Jane",
            username: "jane_123",
            email: "jane@example.com",
            password: "securePass1",
            phone: "+1234567890",
        };
        const result = auth_validation_1.registerSchema.parse(payload);
        (0, vitest_1.expect)(result.phone).toBe("+1234567890");
    });
    (0, vitest_1.it)("should accept a valid payload when phone is omitted", () => {
        const payload = {
            name: "Jane",
            username: "jane_123",
            email: "jane@example.com",
            password: "securePass1",
        };
        const result = auth_validation_1.registerSchema.parse(payload);
        (0, vitest_1.expect)(result.phone).toBeUndefined();
    });
    (0, vitest_1.it)("should reject a payload with missing name", () => {
        const payload = {
            username: "john_doe",
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject a payload with an empty name", () => {
        const payload = {
            name: "",
            username: "john_doe",
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject a payload with missing username", () => {
        const payload = {
            name: "John",
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("username"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject a payload with empty username", () => {
        const payload = {
            name: "John",
            username: "",
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject a username containing spaces", () => {
        const payload = {
            name: "John",
            username: "john doe",
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject a username containing special characters (non-alphanumeric/underscore)", () => {
        const payload = {
            name: "John",
            username: "john@doe!",
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject an invalid email", () => {
        const payload = {
            name: "John",
            username: "john_doe",
            email: "not-an-email",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("email"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject a password shorter than 6 characters", () => {
        const payload = {
            name: "John",
            username: "john_doe",
            email: "john@example.com",
            password: "12345",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("password"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject a payload with missing email", () => {
        const payload = {
            name: "John",
            username: "john_doe",
            password: "password123",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject a payload with missing password", () => {
        const payload = {
            name: "John",
            username: "john_doe",
            email: "john@example.com",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject a payload with an empty password", () => {
        const payload = {
            name: "John",
            username: "john_doe",
            email: "john@example.com",
            password: "",
        };
        const result = auth_validation_1.registerSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should strip unknown fields", () => {
        const payload = {
            name: "John",
            username: "john_doe",
            email: "john@example.com",
            password: "password123",
            unknownField: "should be stripped",
        };
        const result = auth_validation_1.registerSchema.parse(payload);
        (0, vitest_1.expect)(result).not.toHaveProperty("unknownField");
    });
});
// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
(0, vitest_1.describe)("loginSchema", () => {
    (0, vitest_1.it)("should accept a valid login payload", () => {
        const payload = {
            email: "john@example.com",
            password: "password123",
        };
        const result = auth_validation_1.loginSchema.parse(payload);
        (0, vitest_1.expect)(result).toMatchObject({
            email: "john@example.com",
            password: "password123",
        });
    });
    (0, vitest_1.it)("should reject an invalid email", () => {
        const payload = {
            email: "not-an-email",
            password: "password123",
        };
        const result = auth_validation_1.loginSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("email"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject a missing email", () => {
        const payload = {
            password: "password123",
        };
        const result = auth_validation_1.loginSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("email"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject an empty password", () => {
        const payload = {
            email: "john@example.com",
            password: "",
        };
        const result = auth_validation_1.loginSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("password"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject a missing password", () => {
        const payload = {
            email: "john@example.com",
        };
        const result = auth_validation_1.loginSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.issues.some((i) => i.path.includes("password"))).toBe(true);
        }
    });
    (0, vitest_1.it)("should reject an empty email", () => {
        const payload = {
            email: "",
            password: "password123",
        };
        const result = auth_validation_1.loginSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject an email with missing domain", () => {
        const payload = {
            email: "john@",
            password: "password123",
        };
        const result = auth_validation_1.loginSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should strip unknown fields", () => {
        const payload = {
            email: "john@example.com",
            password: "password123",
            extra: "should be stripped",
        };
        const result = auth_validation_1.loginSchema.parse(payload);
        (0, vitest_1.expect)(result).not.toHaveProperty("extra");
    });
});
// ---------------------------------------------------------------------------
// checkUsernameSchema
// ---------------------------------------------------------------------------
(0, vitest_1.describe)("checkUsernameSchema", () => {
    (0, vitest_1.it)("should accept a valid username payload", () => {
        const payload = { username: "john_doe" };
        const result = auth_validation_1.checkUsernameSchema.parse(payload);
        (0, vitest_1.expect)(result).toEqual({ username: "john_doe" });
    });
    (0, vitest_1.it)("should reject an empty username", () => {
        const payload = { username: "" };
        const result = auth_validation_1.checkUsernameSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should reject a missing username", () => {
        const payload = {};
        const result = auth_validation_1.checkUsernameSchema.safeParse(payload);
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("should strip unknown fields", () => {
        const payload = {
            username: "john_doe",
            unknownField: "should be stripped",
        };
        const result = auth_validation_1.checkUsernameSchema.parse(payload);
        (0, vitest_1.expect)(result).not.toHaveProperty("unknownField");
    });
});
//# sourceMappingURL=auth.validation.test.js.map