import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import tw from "../../lib/tailwind";
import { colors } from "../../constants/theme";

interface StarsProps {
  rating: number;
  count?: number;
  size?: number;
}

export function Stars({ rating, count, size = 14 }: StarsProps) {
  return (
    <View
      style={tw`flex-row items-center gap-1`}
      accessibilityLabel={`Rated ${rating} out of 5`}
    >
      <View style={tw`flex-row items-center gap-0.5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= Math.round(rating) ? "star" : "star-outline"}
            size={size}
            color={i <= Math.round(rating) ? colors.star : colors.starEmpty}
          />
        ))}
      </View>
      <Text style={tw`text-xs font-semibold text-text`}>{rating.toFixed(1)}</Text>
      {count != null && <Text style={tw`text-xs text-textMuted`}>({count})</Text>}
    </View>
  );
}
