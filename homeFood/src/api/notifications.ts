import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { API_ORIGIN } from "./mapFood";
import { TOKEN_KEY } from "@/src/store/authSlice";
import type { RootState } from "@/src/store";

export type NotificationType =
  | "ORDER_PLACED"
  | "ORDER_ACCEPTED"
  | "ORDER_DECLINED"
  | "ORDER_ON_THE_WAY"
  | "ORDER_RECEIVED"
  | "ORDER_CANCELLED";

export interface NotificationData {
  orderId: string;
  foodIds: string[];
  totalAmount: number;
  buyerName?: string;
  shopName?: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  actorId?: string;
  orderId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  readAt?: string;
  dedupeKey: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    items: Notification[];
    nextCursor: string | null;
    unreadCount: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: { unreadCount: number };
}

interface MarkReadResponse {
  success: boolean;
  data: Notification;
}

interface MarkAllReadResponse {
  success: boolean;
  data: { modifiedCount: number };
}

const notificationsBaseQuery = fetchBaseQuery({
  baseUrl: `${API_ORIGIN}/api`,
  prepareHeaders: async (headers, { getState }) => {
    const state = getState() as RootState;
    const token =
      state.auth.token ?? (await SecureStore.getItemAsync(TOKEN_KEY));
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: notificationsBaseQuery,
  tagTypes: ["Notifications", "NotificationsUnread"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse["data"],
      { limit?: number; cursor?: string | null; unreadOnly?: boolean } | void
    >({
      query: (params) => {
        const query: Record<string, string> = {};
        if (params?.limit) query.limit = String(params.limit);
        if (params?.cursor) query.cursor = params.cursor;
        if (params?.unreadOnly) query.unreadOnly = "true";
        return { url: "/notifications", params: query };
      },
      transformResponse: (response: NotificationsResponse) => response.data,
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<number, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (response: UnreadCountResponse) =>
        response.data.unreadCount,
      providesTags: ["NotificationsUnread"],
    }),
    markNotificationRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: MarkReadResponse) => response.data,
      invalidatesTags: ["Notifications", "NotificationsUnread"],
    }),
    markAllNotificationsRead: builder.mutation<{ modifiedCount: number }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      transformResponse: (response: MarkAllReadResponse) => response.data,
      invalidatesTags: ["Notifications", "NotificationsUnread"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
