"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const events_1 = require("events");
const auth_events_1 = __importDefault(require("../auth.events"));
(0, vitest_1.describe)("authEvents", () => {
    (0, vitest_1.it)("should be an instance of EventEmitter", () => {
        (0, vitest_1.expect)(auth_events_1.default).toBeInstanceOf(events_1.EventEmitter);
    });
    (0, vitest_1.it)("should emit 'auth.user.registered' event with user payload", () => {
        const listener = vitest_1.vi.fn();
        auth_events_1.default.on("auth.user.registered", listener);
        const dummyUser = {
            _id: "user-123",
            name: "John",
            username: "john_doe",
            email: "john@example.com",
        };
        auth_events_1.default.emit("auth.user.registered", dummyUser);
        (0, vitest_1.expect)(listener).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(listener).toHaveBeenCalledWith(dummyUser);
    });
    (0, vitest_1.it)("should emit 'auth.user.registered' with the correct user data shape", () => {
        const listener = vitest_1.vi.fn();
        auth_events_1.default.on("auth.user.registered", listener);
        const newUser = {
            _id: "user-456",
            name: "Jane",
            username: "jane_123",
            email: "jane@example.com",
            role: "buyer",
            phone: "+1234567890",
        };
        auth_events_1.default.emit("auth.user.registered", newUser);
        (0, vitest_1.expect)(listener).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            _id: "user-456",
            name: "Jane",
            username: "jane_123",
            email: "jane@example.com",
        }));
    });
    (0, vitest_1.it)("should not emit events for unrelated event names", () => {
        const listener = vitest_1.vi.fn();
        auth_events_1.default.on("auth.user.registered", listener);
        auth_events_1.default.emit("some.other.event", { data: "irrelevant" });
        (0, vitest_1.expect)(listener).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("should support multiple listeners on the same event", () => {
        const listener1 = vitest_1.vi.fn();
        const listener2 = vitest_1.vi.fn();
        auth_events_1.default.on("auth.user.registered", listener1);
        auth_events_1.default.on("auth.user.registered", listener2);
        auth_events_1.default.emit("auth.user.registered", { email: "test@test.com" });
        (0, vitest_1.expect)(listener1).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(listener2).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=auth.events.test.js.map