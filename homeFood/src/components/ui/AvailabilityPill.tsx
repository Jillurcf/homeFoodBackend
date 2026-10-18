import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import tw from "../../lib/tailwind";

export type Availability = "available" | "low" | "soldOut";

const metaByAvailability: Record<
  Availability,
  { label: string; container: string; text: string }
> = {
  available: {
    label: "Available",
    container: "bg-emerald-bg",
    text: "text-emerald-text",
  },
  low: {
    label: "Low stock",
    container: "bg-amber-bg",
    text: "text-amber-text",
  },
  soldOut: {
    label: "Sold out",
    container: "bg-red-bg",
    text: "text-red-text",
  },
};

interface AvailabilityPillProps {
  availability: Availability;
  style?: StyleProp<ViewStyle>;
}

export function AvailabilityPill({ availability, style }: AvailabilityPillProps) {
  const meta = metaByAvailability[availability];

  return (
    <View
      style={[tw`self-start rounded-full px-2.5 py-0.5 ${meta.container}`, style]}
    >
      <Text style={tw`text-xs font-semibold ${meta.text}`}>{meta.label}</Text>
    </View>
  );
}
