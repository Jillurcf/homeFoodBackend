import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { colors } from "../../constants/theme";

interface VerifiedBadgeProps {
  size?: number;
}

export function VerifiedBadge({ size = 14 }: VerifiedBadgeProps) {
  return (
    <Ionicons
      name="checkmark-circle"
      size={size}
      color={colors.success}
      accessibilityLabel="Verified home chef"
    />
  );
}
