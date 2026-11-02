import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "../../../config/env";
import * as contactService from "../contact.service";
import contactRoutes from "../contact.routes";

vi.mock("../contact.service", () => ({
  createSubmission: vi.fn(),
  listSubmissions: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/contact", contactRoutes);

function tokenFor(id: string, role: string) {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

const submission = {
  name: "Buyer Name",
  email: "buyer@example.com",
  mobile: "0123456789",
  topic: "Order issue",
  message: "I need help with my order.",
};

describe("contact API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contactService.createSubmission).mockResolvedValue({
      submission: { ...submission, senderRole: "guest" },
      emailSent: true,
    } as never);
  });

  it("accepts public contact messages", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send(submission);

    expect(response.status).toBe(201);
    expect(contactService.createSubmission).toHaveBeenCalledWith(
      submission,
      undefined
    );
    expect(response.body.data.emailSent).toBe(true);
  });

  it.each(["buyer", "seller"])(
    "records the authenticated %s sender role",
    async (role) => {
      const response = await request(app)
        .post("/api/contact")
        .set("Authorization", `Bearer ${tokenFor(`${role}-1`, role)}`)
        .send(submission);

      expect(response.status).toBe(201);
      expect(contactService.createSubmission).toHaveBeenCalledWith(
        submission,
        { id: `${role}-1`, role }
      );
    }
  );

  it("rejects invalid contact data", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send({ ...submission, email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(contactService.createSubmission).not.toHaveBeenCalled();
  });
});
