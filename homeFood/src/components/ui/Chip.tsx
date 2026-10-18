import React from "react";
import {
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import tw from "../../lib/tailwind";

interface ChipProps {
  active?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ active = false, onPress, children, style }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        tw`items-center rounded-full border px-3 py-1.5`,
        active ? tw`border-primary bg-primary` : tw`border-borderStrong bg-card`,
        style,
      ]}
    >
      <Text
        style={tw`text-sm font-medium ${active ? "text-white" : "text-textMuted"}`}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
