import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAppSelector } from "@/src/store/hooks";
import { useGetUnreadCountQuery } from "@/src/api/notifications";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

export function NotificationBell() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: isAuthenticated ? 30000 : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const showBadge = unreadCount > 0;
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Pressable
      onPress={() => router.push("/(stack)/notifications" as never)}
      accessibilityRole="button"
      accessibilityLabel={`Notifications${showBadge ? `, ${unreadCount} unread` : ""}`}
      hitSlop={8}
      style={tw`relative h-9 w-9 items-center justify-center rounded-full`}
    >
      <Ionicons name="notifications-outline" size={22} color={colors.text} />
      {showBadge && (
        <View
          style={tw`absolute -right-0.5 -top-0.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1`}
        >
          <Text style={tw`text-[10px] font-semibold text-white`}>
            {badgeLabel}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
