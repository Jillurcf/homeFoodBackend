import mongoose from "mongoose";
import Food from "../foods/food.model";
import FoodMaker from "../foodMakers/foodMaker.model";
import User from "../../model/user/user.model";
import type { IOrder } from "../orders/order.model";
import * as notificationRepository from "./notification.repository";
import {
  CreateNotificationInput,
  NotificationCursor,
} from "./notification.repository";
import { ListNotificationsQuery } from "./notification.validation";
import { INotificationData, NotificationType } from "./notification.model";

export interface OrderNotificationSource {
  _id: unknown;
  userId: string;
  items: { foodId: string }[];
  totalAmount: number;
  status: IOrder["status"];
}

export const encodeCursor = (createdAt: Date, id: string) => {
  return Buffer.from(`${createdAt.toISOString()}|${id}`, "utf8").toString(
    "base64url"
  );
};

export const decodeCursor = (cursor: string): NotificationCursor => {
  const decoded = Buffer.from(cursor, "base64url").toString("utf8");
  const separator = decoded.indexOf("|");
  const isoDate = separator === -1 ? "" : decoded.slice(0, separator);
  const id = separator === -1 ? "" : decoded.slice(separator + 1);
  const createdAt = new Date(isoDate);

  if (
    !id ||
    Number.isNaN(createdAt.getTime()) ||
    !mongoose.isValidObjectId(id)
  ) {
    throw Object.assign(new Error("Invalid cursor"), { status: 400 });
  }

  return { createdAt, id };
};

export const listNotifications = async (
  recipientId: string,
  query: ListNotificationsQuery
) => {
  const cursor = query.cursor ? decodeCursor(query.cursor) : undefined;

  const [rows, unreadCount] = await Promise.all([
    notificationRepository.findForRecipient({
      recipientId,
      limit: query.limit,
      cursor,
      unreadOnly: query.unreadOnly,
    }),
    notificationRepository.countUnread(recipientId),
  ]);

  const hasMore = rows.length > query.limit;
  const items = hasMore ? rows.slice(0, query.limit) : rows;
  const last = items[items.length - 1];

  return {
    items,
    nextCursor:
      hasMore && last
        ? encodeCursor(new Date(last.createdAt), String(last._id))
        : null,
    unreadCount,
  };
};

export const getUnreadCount = async (recipientId: string) => {
  return notificationRepository.countUnread(recipientId);
};

export const markNotificationRead = async (id: string, recipientId: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw Object.assign(new Error("Invalid notification ID"), { status: 400 });
  }

  const notification = await notificationRepository.markRead(id, recipientId);

  if (!notification) {
    throw Object.assign(new Error("Notification not found"), { status: 404 });
  }

  return notification;
};

export const markAllNotificationsRead = async (recipientId: string) => {
  return notificationRepository.markAllRead(recipientId);
};

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

const getFoodIds = (order: OrderNotificationSource): string[] =>
  unique(order.items.map((item) => String(item.foodId)).filter(Boolean));

const getSellerIds = async (foodIds: string[]): Promise<string[]> => {
  if (foodIds.length === 0) return [];

  const sellerIds = await Food.find({ _id: { $in: foodIds } }).distinct(
    "sellerId"
  );

  return unique(sellerIds.map((id) => String(id)).filter(Boolean));
};

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const getBuyerName = async (userId: string): Promise<string | undefined> => {
  if (!isDatabaseConnected()) return undefined;

  try {
    const buyer = await User.findById(userId).select("name").lean();
    return buyer?.name;
  } catch {
    return undefined;
  }
};

const getShopName = async (sellerId?: string): Promise<string | undefined> => {
  if (!sellerId || !isDatabaseConnected()) return undefined;

  try {
    const shop = await FoodMaker.findOne({ userId: sellerId })
      .select("shopName")
      .lean();
    return shop?.shopName;
  } catch {
    return undefined;
  }
};

const buildNotificationData = (
  orderId: string,
  foodIds: string[],
  totalAmount: number,
  snapshots: { buyerName?: string; shopName?: string }
): INotificationData => ({
  orderId,
  foodIds,
  totalAmount,
  ...(snapshots.buyerName ? { buyerName: snapshots.buyerName } : {}),
  ...(snapshots.shopName ? { shopName: snapshots.shopName } : {}),
});

const addDraft = (
  drafts: CreateNotificationInput[],
  keys: Set<string>,
  draft: CreateNotificationInput,
  actorId?: string
) => {
  if (draft.recipientId === actorId) return;
  if (keys.has(draft.dedupeKey)) return;

  keys.add(draft.dedupeKey);
  drafts.push(draft);
};

export const notifyOrderPlaced = async (
  order: OrderNotificationSource
): Promise<number> => {
  const orderId = String(order._id);
  const buyerId = String(order.userId);
  const foodIds = getFoodIds(order);
  const sellerIds = await getSellerIds(foodIds);
  const recipients = sellerIds.filter((sellerId) => sellerId !== buyerId);

  if (recipients.length === 0) return 0;

  const buyerName = await getBuyerName(buyerId);
  const data = buildNotificationData(orderId, foodIds, order.totalAmount, {
    buyerName,
  });

  return notificationRepository.createMany(
    recipients.map((sellerId) => ({
      recipientId: sellerId,
      actorId: buyerId,
      orderId,
      type: "ORDER_PLACED" as NotificationType,
      title: "New order received",
      message: buyerName
        ? `${buyerName} placed an order. Review and accept it from your orders.`
        : "You received a new order. Review and accept it from your orders.",
      data,
      dedupeKey: `ORDER_PLACED:${orderId}:${sellerId}`,
    }))
  );
};

export const notifyOrderStatusChange = async (
  order: OrderNotificationSource,
  previousStatus: IOrder["status"],
  actorId?: string
): Promise<number> => {
  const orderId = String(order._id);
  const buyerId = String(order.userId);
  const actor = actorId ? String(actorId) : undefined;
  const foodIds = getFoodIds(order);
  const sellerIds = await getSellerIds(foodIds);
  const buyerName = await getBuyerName(buyerId);
  const shopName = await getShopName(actor);
  const data = buildNotificationData(orderId, foodIds, order.totalAmount, {
    buyerName,
    shopName,
  });

  const drafts: CreateNotificationInput[] = [];
  const keys = new Set<string>();

  if (order.status === "PREPARING") {
    addDraft(
      drafts,
      keys,
      {
        recipientId: buyerId,
        actorId: actor,
        orderId,
        type: "ORDER_ACCEPTED",
        title: "Order accepted",
        message: shopName
          ? `${shopName} accepted your order and is preparing it.`
          : "Your order has been accepted and is being prepared.",
        data,
        dedupeKey: `ORDER_ACCEPTED:${orderId}`,
      },
      actor
    );
  }

  if (order.status === "ON_THE_WAY") {
    addDraft(
      drafts,
      keys,
      {
        recipientId: buyerId,
        actorId: actor,
        orderId,
        type: "ORDER_ON_THE_WAY",
        title: "Order on the way",
        message: shopName
          ? `${shopName} marked your order out for delivery.`
          : "Your order is on the way.",
        data,
        dedupeKey: `ORDER_ON_THE_WAY:${orderId}`,
      },
      actor
    );
  }

  if (order.status === "DELIVERED") {
    for (const sellerId of sellerIds) {
      addDraft(
        drafts,
        keys,
        {
          recipientId: sellerId,
          actorId: actor,
          orderId,
          type: "ORDER_RECEIVED",
          title: "Order received",
          message: buyerName
            ? `${buyerName} confirmed receiving the order.`
            : "The buyer confirmed receiving the order.",
          data,
          dedupeKey: `ORDER_RECEIVED:${orderId}:${sellerId}`,
        },
        actor
      );
    }
  }

  if (order.status === "CANCELLED") {
    const actorIsBuyer = actor === buyerId;
    const actorIsSeller = Boolean(actor && sellerIds.includes(actor));
    const isSellerDecline =
      actorIsSeller &&
      (previousStatus === "PENDING" || previousStatus === "CONFIRMED");
    const type: NotificationType = isSellerDecline
      ? "ORDER_DECLINED"
      : "ORDER_CANCELLED";

    if (!actorIsBuyer) {
      addDraft(
        drafts,
        keys,
        {
          recipientId: buyerId,
          actorId: actor,
          orderId,
          type,
          title: isSellerDecline ? "Order declined" : "Order cancelled",
          message: isSellerDecline
            ? shopName
              ? `${shopName} declined your order.`
              : "Your order was declined."
            : "Your order has been cancelled.",
          data,
          dedupeKey: isSellerDecline
            ? `ORDER_DECLINED:${orderId}`
            : `ORDER_CANCELLED:${orderId}:${buyerId}`,
        },
        actor
      );
    }

    if (actorIsBuyer || !actorIsSeller) {
      for (const sellerId of sellerIds) {
        addDraft(
          drafts,
          keys,
          {
            recipientId: sellerId,
            actorId: actor,
            orderId,
            type: "ORDER_CANCELLED",
            title: "Order cancelled",
            message: buyerName
              ? `${buyerName}'s order was cancelled.`
              : "An order in your shop was cancelled.",
            data,
            dedupeKey: `ORDER_CANCELLED:${orderId}:${sellerId}`,
          },
          actor
        );
      }
    }
  }

  return notificationRepository.createMany(drafts);
};
