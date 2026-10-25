import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type Notification,
} from "@/src/api/notifications";
import { EmptyState, PillButton } from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

function formatTime(iso: string) {
  try {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function NotificationRow({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  const unread = !item.isRead;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        tw`mb-2 rounded-2xl border px-4 py-3`,
        unread ? tw`border-primary/40 bg-primary/5` : tw`border-border bg-card`,
      ]}
    >
      <View style={tw`flex-row items-start justify-between gap-2`}>
        <View style={tw`flex-1`}>
          <Text
            style={tw`text-sm font-semibold ${unread ? "text-text" : "text-text"}`}
          >
            {item.title}
          </Text>
          <Text style={tw`mt-1 text-sm text-textMuted`}>{item.message}</Text>
        </View>
        {unread && (
          <View style={tw`mt-1 h-2 w-2 rounded-full bg-primary`} />
        )}
      </View>
      <Text style={tw`mt-2 text-xs text-textFaint`}>
        {formatTime(item.createdAt)}
      </Text>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    { limit: 50 },
    { refetchOnFocus: true },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handlePress = useCallback(
    async (item: Notification) => {
      if (!item.isRead) {
        try {
          await markRead(item._id).unwrap();
        } catch {
          // ignore
        }
      }
      router.push({
        pathname: "/(stack)/order/[id]" as never,
        params: { id: item.data.orderId },
      });
    },
    [markRead, router],
  );

  const handleMarkAll = useCallback(async () => {
    if (unreadCount === 0) return;
    try {
      await markAllRead().unwrap();
    } catch {
      // ignore
    }
  }, [markAllRead, unreadCount]);

  const refreshing = isFetching && !isLoading;

  return (
    <View style={tw`flex-1 bg-background`}>
      <View
        style={[
          tw`flex-row items-center justify-between px-[5%] pb-3`,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <View style={tw`flex-row items-center gap-2`}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={tw`h-9 w-9 items-center justify-center rounded-full`}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={tw`text-lg font-semibold text-text`}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <PillButton
            title={markingAll ? "Marking..." : "Mark all read"}
            variant="ghost"
            disabled={markingAll}
            onPress={handleMarkAll}
          />
        )}
      </View>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={tw`px-[5%] pb-10`}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={() => handlePress(item)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={colors.primary}
                />
              }
              title="No notifications yet"
              description="You'll see order updates here."
            />
          }
        />
      )}
    </View>
  );
}
