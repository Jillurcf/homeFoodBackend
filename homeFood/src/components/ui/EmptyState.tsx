import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import tw from "../../lib/tailwind";
import { colors } from "../../constants/theme";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View
      style={[
        tw`items-center rounded-2xl border border-dashed border-borderStrong bg-background p-10`,
        style,
      ]}
    >
      <View
        style={tw`h-12 w-12 items-center justify-center rounded-full bg-primary/10`}
      >
        {icon ?? (
          <Ionicons name="search" size={24} color={colors.primary} />
        )}
      </View>
      <Text style={tw`mt-4 text-center font-semibold text-text`}>{title}</Text>
      {description && (
        <Text style={tw`mt-1 max-w-sm text-center text-sm text-textMuted`}>
          {description}
        </Text>
      )}
      {action && <View style={tw`mt-5`}>{action}</View>}
    </View>
  );
}
