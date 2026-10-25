import { beforeEach, describe, expect, it, vi } from "vitest";
import Food from "../../foods/food.model";
import * as notificationRepository from "../notification.repository";
import * as notificationService from "../notification.service";

vi.mock("../notification.repository", () => ({
  findForRecipient: vi.fn(),
  countUnread: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  createMany: vi.fn(),
}));

vi.mock("../../foods/food.model", () => ({
  default: { find: vi.fn() },
}));

const recipientId = "507f1f77bcf86cd799439011";
const otherRecipientId = "507f1f77bcf86cd799439012";
const notificationIds = [
  "507f1f77bcf86cd799439013",
  "507f1f77bcf86cd799439014",
  "507f1f77bcf86cd799439015",
];

const rows = [
  {
    _id: notificationIds[0],
    createdAt: new Date("2026-01-03T10:00:00.000Z"),
  },
  {
    _id: notificationIds[1],
    createdAt: new Date("2026-01-02T10:00:00.000Z"),
  },
  {
    _id: notificationIds[2],
    createdAt: new Date("2026-01-01T10:00:00.000Z"),
  },
];

describe("notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationRepository.findForRecipient).mockResolvedValue([]);
    vi.mocked(notificationRepository.countUnread).mockResolvedValue(0);
    vi.mocked(notificationRepository.markRead).mockResolvedValue(null);
    vi.mocked(notificationRepository.markAllRead).mockResolvedValue(0);
    vi.mocked(notificationRepository.createMany).mockResolvedValue(0);
  });

  it("returns a page and a cursor pointing at the last returned item", async () => {
    vi.mocked(notificationRepository.findForRecipient).mockResolvedValue(
      rows as never
    );
    vi.mocked(notificationRepository.countUnread).mockResolvedValue(4);

    const result = await notificationService.listNotifications(recipientId, {
      limit: 2,
      unreadOnly: false,
    });

    expect(result.items).toHaveLength(2);
    expect(result.unreadCount).toBe(4);
    expect(result.nextCursor).not.toBeNull();

    const cursor = notificationService.decodeCursor(
      result.nextCursor as string
    );
    expect(cursor.id).toBe(notificationIds[1]);
    expect(cursor.createdAt).toEqual(rows[1].createdAt);
    expect(notificationRepository.findForRecipient).toHaveBeenCalledWith({
      recipientId,
      limit: 2,
      cursor: undefined,
      unreadOnly: false,
    });
  });

  it("stops paginating when there are no extra rows", async () => {
    vi.mocked(notificationRepository.findForRecipient).mockResolvedValue([
      rows[0],
    ] as never);
    vi.mocked(notificationRepository.countUnread).mockResolvedValue(1);

    const result = await notificationService.listNotifications(recipientId, {
      limit: 2,
      unreadOnly: false,
    });

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it("decodes cursors and passes unreadOnly through to the repository", async () => {
    const cursor = notificationService.encodeCursor(
      new Date("2026-01-02T10:00:00.000Z"),
      notificationIds[1]
    );

    await notificationService.listNotifications(recipientId, {
      limit: 20,
      cursor,
      unreadOnly: true,
    });

    expect(notificationRepository.findForRecipient).toHaveBeenCalledWith({
      recipientId,
      limit: 20,
      cursor: {
        createdAt: new Date("2026-01-02T10:00:00.000Z"),
        id: notificationIds[1],
      },
      unreadOnly: true,
    });
  });

  it("rejects malformed cursors", async () => {
    await expect(
      notificationService.listNotifications(recipientId, {
        limit: 20,
        cursor: "not-a-cursor",
        unreadOnly: false,
      })
    ).rejects.toMatchObject({ status: 400 });

    expect(notificationRepository.findForRecipient).not.toHaveBeenCalled();
  });

  it("marks a notification read only for the given recipient", async () => {
    const notification = { _id: notificationIds[0], isRead: true };
    vi.mocked(notificationRepository.markRead).mockResolvedValue(
      notification as never
    );

    await notificationService.markNotificationRead(
      notificationIds[0],
      recipientId
    );

    expect(notificationRepository.markRead).toHaveBeenCalledWith(
      notificationIds[0],
      recipientId
    );
    expect(notificationRepository.markRead).not.toHaveBeenCalledWith(
      notificationIds[0],
      otherRecipientId
    );
  });

  it("returns 404 when the notification does not belong to the recipient", async () => {
    vi.mocked(notificationRepository.markRead).mockResolvedValue(null);

    await expect(
      notificationService.markNotificationRead(
        notificationIds[0],
        otherRecipientId
      )
    ).rejects.toMatchObject({ status: 404 });
  });

  it("rejects malformed notification ids before querying", async () => {
    await expect(
      notificationService.markNotificationRead("bad-id", recipientId)
    ).rejects.toMatchObject({ status: 400 });

    expect(notificationRepository.markRead).not.toHaveBeenCalled();
  });

  it("marks all notifications read for the authenticated recipient", async () => {
    vi.mocked(notificationRepository.markAllRead).mockResolvedValue(3);

    const result =
      await notificationService.markAllNotificationsRead(recipientId);

    expect(result).toBe(3);
    expect(notificationRepository.markAllRead).toHaveBeenCalledWith(
      recipientId
    );
  });
});

describe("order notifications", () => {
  const buyerId = "507f1f77bcf86cd799439011";
  const orderId = "507f1f77bcf86cd799439041";
  const foodIds = [
    "507f1f77bcf86cd799439021",
    "507f1f77bcf86cd799439022",
  ];
  const sellerIds = [
    "507f1f77bcf86cd799439031",
    "507f1f77bcf86cd799439032",
  ];

  const orderFor = (status: "PENDING" | "PREPARING" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED") => ({
    _id: orderId,
    userId: buyerId,
    items: foodIds.map((foodId) => ({ foodId })),
    totalAmount: 250,
    status,
  });

  const mockSellers = (ids: string[]) => {
    const distinct = vi.fn().mockResolvedValue(ids);
    vi.mocked(Food.find).mockReturnValue({ distinct } as never);
    return distinct;
  };

  const createdDrafts = () => {
    const calls = vi.mocked(notificationRepository.createMany).mock.calls;
    return calls[calls.length - 1][0];
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationRepository.createMany).mockResolvedValue(0);
    mockSellers(sellerIds);
  });

  it("creates one ORDER_PLACED notification per unique seller", async () => {
    mockSellers([...sellerIds, sellerIds[0]]);

    await notificationService.notifyOrderPlaced(orderFor("PENDING"));

    const drafts = createdDrafts();
    expect(Food.find).toHaveBeenCalledTimes(1);
    expect(drafts).toHaveLength(2);
    expect(drafts.map((draft) => draft.recipientId)).toEqual(sellerIds);
    expect(drafts.every((draft) => draft.type === "ORDER_PLACED")).toBe(true);
    expect(drafts[0].dedupeKey).toBe(
      `ORDER_PLACED:${orderId}:${sellerIds[0]}`
    );
    expect(drafts.some((draft) => draft.recipientId === buyerId)).toBe(false);
  });

  it("notifies the buyer when a seller accepts the order", async () => {
    await notificationService.notifyOrderStatusChange(
      orderFor("PREPARING"),
      "PENDING",
      sellerIds[0]
    );

    const drafts = createdDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({
      recipientId: buyerId,
      actorId: sellerIds[0],
      type: "ORDER_ACCEPTED",
      dedupeKey: `ORDER_ACCEPTED:${orderId}`,
    });
  });

  it("notifies the buyer when the order goes out for delivery", async () => {
    await notificationService.notifyOrderStatusChange(
      orderFor("ON_THE_WAY"),
      "PREPARING",
      sellerIds[0]
    );

    const drafts = createdDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({
      recipientId: buyerId,
      type: "ORDER_ON_THE_WAY",
      dedupeKey: `ORDER_ON_THE_WAY:${orderId}`,
    });
  });

  it("notifies every seller when the buyer confirms receipt", async () => {
    mockSellers([...sellerIds, buyerId]);

    await notificationService.notifyOrderStatusChange(
      orderFor("DELIVERED"),
      "ON_THE_WAY",
      buyerId
    );

    const drafts = createdDrafts();
    expect(drafts).toHaveLength(2);
    expect(drafts.every((draft) => draft.type === "ORDER_RECEIVED")).toBe(true);
    expect(drafts.map((draft) => draft.dedupeKey)).toEqual(
      sellerIds.map((sellerId) => `ORDER_RECEIVED:${orderId}:${sellerId}`)
    );
    expect(drafts.some((draft) => draft.recipientId === buyerId)).toBe(false);
  });

  it("notifies the buyer when a seller declines a new order", async () => {
    await notificationService.notifyOrderStatusChange(
      orderFor("CANCELLED"),
      "PENDING",
      sellerIds[0]
    );

    const drafts = createdDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({
      recipientId: buyerId,
      type: "ORDER_DECLINED",
      dedupeKey: `ORDER_DECLINED:${orderId}`,
    });
  });

  it("notifies the buyer and sellers when an admin cancels an order", async () => {
    await notificationService.notifyOrderStatusChange(
      orderFor("CANCELLED"),
      "PREPARING"
    );

    const drafts = createdDrafts();
    expect(drafts).toHaveLength(3);
    expect(drafts.every((draft) => draft.type === "ORDER_CANCELLED")).toBe(true);
    expect(drafts.map((draft) => draft.recipientId)).toEqual([
      buyerId,
      ...sellerIds,
    ]);
  });

  it("never notifies the actor", async () => {
    mockSellers([sellerIds[0]]);

    await notificationService.notifyOrderStatusChange(
      orderFor("DELIVERED"),
      "ON_THE_WAY",
      sellerIds[0]
    );

    expect(
      vi.mocked(notificationRepository.createMany)
    ).toHaveBeenLastCalledWith([]);
  });
});
