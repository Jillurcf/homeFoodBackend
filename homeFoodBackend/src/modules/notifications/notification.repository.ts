import Notification, {
  INotificationData,
  NotificationType,
} from "./notification.model";

export interface NotificationCursor {
  createdAt: Date;
  id: string;
}

export interface CreateNotificationInput {
  recipientId: string;
  actorId?: string;
  orderId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: INotificationData;
  dedupeKey: string;
}

interface FindNotificationsInput {
  recipientId: string;
  limit: number;
  cursor?: NotificationCursor;
  unreadOnly: boolean;
}

export const findForRecipient = async ({
  recipientId,
  limit,
  cursor,
  unreadOnly,
}: FindNotificationsInput) => {
  const query: Record<string, unknown> = { recipientId };

  if (unreadOnly) {
    query.isRead = false;
  }

  if (cursor) {
    query.$or = [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
    ];
  }

  return Notification.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean()
    .exec();
};

export const createMany = async (
  notifications: CreateNotificationInput[]
): Promise<number> => {
  if (notifications.length === 0) return 0;

  const now = new Date();
  const operations = notifications.map((notification) => ({
    updateOne: {
      filter: { dedupeKey: notification.dedupeKey },
      update: {
        $setOnInsert: {
          ...notification,
          isRead: false,
          createdAt: now,
          updatedAt: now,
        },
      },
      upsert: true,
    },
  }));

  const result = await Notification.bulkWrite(operations as never, {
    ordered: false,
    timestamps: false,
  });

  return result.upsertedCount;
};

export const countUnread = async (recipientId: string) => {
  return Notification.countDocuments({ recipientId, isRead: false });
};

export const markRead = async (id: string, recipientId: string) => {
  return Notification.findOneAndUpdate(
    { _id: id, recipientId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  )
    .lean()
    .exec();
};

export const markAllRead = async (recipientId: string) => {
  const result = await Notification.updateMany(
    { recipientId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return result.modifiedCount;
};
