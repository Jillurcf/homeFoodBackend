import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import tw from "../../lib/tailwind";

export type StatusPillVariant = "emerald" | "amber" | "red" | "primary";

const metaByVariant: Record<
  StatusPillVariant,
  { container: string; text: string }
> = {
  emerald: { container: "bg-emerald-bg", text: "text-emerald-text" },
  amber: { container: "bg-amber-bg", text: "text-amber-text" },
  red: { container: "bg-red-bg", text: "text-red-text" },
  primary: { container: "bg-primary/10", text: "text-primaryDark" },
};

interface StatusPillProps {
  variant: StatusPillVariant;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ variant, label, style }: StatusPillProps) {
  const meta = metaByVariant[variant];

  return (
    <View
      style={[tw`self-start rounded-full px-2.5 py-0.5 ${meta.container}`, style]}
    >
      <Text style={tw`text-xs font-semibold ${meta.text}`}>{label}</Text>
    </View>
  );
}
