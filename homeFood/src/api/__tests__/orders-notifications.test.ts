import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notificationsApi } from "../notifications";
import { ordersApi } from "../orders";

const fetchMock = vi.fn();

const createStore = () =>
  configureStore({
    reducer: {
      auth: () => ({ token: "test-token" }),
      [notificationsApi.reducerPath]: notificationsApi.reducer,
      [ordersApi.reducerPath]: ordersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        notificationsApi.middleware,
        ordersApi.middleware,
      ),
  });

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("order and notification API contracts", () => {
  it("fetches the authenticated notification feed and unread count", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null, unreadCount: 3 }),
    );
    const store = createStore();

    const result = await store
      .dispatch(
        notificationsApi.endpoints.getNotifications.initiate({ limit: 10 }),
      )
      .unwrap();

    expect(result.unreadCount).toBe(3);
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toBe(
      "http://192.168.0.4:8080/api/notifications?limit=10",
    );
    expect(request.method).toBe("GET");
    expect(request.headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("posts buyer receipt confirmation and maps the updated order", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        _id: "order-1",
        status: "DELIVERED",
        items: [{ foodId: "food-1", name: "Soup", price: 10, quantity: 1 }],
        totalAmount: 10,
        paymentMethod: "cod",
        createdAt: "2026-10-25T10:00:00.000Z",
      }),
    );
    const store = createStore();

    const result = await store
      .dispatch(ordersApi.endpoints.receiveOrder.initiate("order-1"))
      .unwrap();

    expect(result).toMatchObject({ id: "order-1", status: "DELIVERED" });
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toBe(
      "http://192.168.0.4:8080/api/orders/order-1/receive",
    );
    expect(request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe("Bearer test-token");
  });
});
