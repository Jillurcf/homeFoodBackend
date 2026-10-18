import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "react-native";
import tw from "../../lib/tailwind";

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ title, subtitle, action, children, style }: CardProps) {
  return (
    <View style={[tw`rounded-2xl border border-border bg-card p-4 shadow-sm`, style]}>
      {(title || action) && (
        <View style={tw`mb-4 flex-row items-start justify-between gap-3`}>
          <View style={tw`flex-1`}>
            {title && (
              <Text style={tw`font-display text-lg font-semibold text-text`}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={tw`mt-0.5 text-sm text-textMuted`}>{subtitle}</Text>
            )}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
