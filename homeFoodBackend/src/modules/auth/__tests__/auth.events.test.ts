import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "events";
import authEvents from "../auth.events";

describe("authEvents", () => {
  it("should be an instance of EventEmitter", () => {
    expect(authEvents).toBeInstanceOf(EventEmitter);
  });

  it("should emit 'auth.user.registered' event with user payload", () => {
    const listener = vi.fn();
    authEvents.on("auth.user.registered", listener);

    const dummyUser = {
      _id: "user-123",
      name: "John",
      username: "john_doe",
      email: "john@example.com",
    };

    authEvents.emit("auth.user.registered", dummyUser);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(dummyUser);
  });

  it("should emit 'auth.user.registered' with the correct user data shape", () => {
    const listener = vi.fn();
    authEvents.on("auth.user.registered", listener);

    const newUser = {
      _id: "user-456",
      name: "Jane",
      username: "jane_123",
      email: "jane@example.com",
      role: "buyer",
      phone: "+1234567890",
    };

    authEvents.emit("auth.user.registered", newUser);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "user-456",
        name: "Jane",
        username: "jane_123",
        email: "jane@example.com",
      })
    );
  });

  it("should not emit events for unrelated event names", () => {
    const listener = vi.fn();
    authEvents.on("auth.user.registered", listener);

    authEvents.emit("some.other.event", { data: "irrelevant" });

    expect(listener).not.toHaveBeenCalled();
  });

  it("should support multiple listeners on the same event", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    authEvents.on("auth.user.registered", listener1);
    authEvents.on("auth.user.registered", listener2);

    authEvents.emit("auth.user.registered", { email: "test@test.com" });

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});
