import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import tw from "../../lib/tailwind";
import { colors } from "../../constants/theme";

export type PillButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const containerByVariant: Record<PillButtonVariant, ReturnType<typeof tw>> = {
  primary: tw`bg-primary`,
  secondary: tw`border border-borderStrong bg-card`,
  danger: tw`bg-red-text`,
  ghost: tw`bg-transparent`,
};

const textByVariant: Record<PillButtonVariant, ReturnType<typeof tw>> = {
  primary: tw`text-white`,
  secondary: tw`text-text`,
  danger: tw`text-white`,
  ghost: tw`text-textMuted`,
};

const indicatorByVariant: Record<PillButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.primary,
  danger: colors.white,
  ghost: colors.primary,
};

interface PillButtonProps {
  title?: string;
  children?: React.ReactNode;
  variant?: PillButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function PillButton({
  title,
  children,
  variant = "primary",
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  style,
  textStyle,
}: PillButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        tw`flex-row items-center justify-center gap-1.5 rounded-full px-5 py-2.5`,
        containerByVariant[variant],
        fullWidth && tw`w-full`,
        isDisabled && tw`opacity-50`,
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator size="small" color={indicatorByVariant[variant]} />
      )}
      {!loading && leftIcon}
      {title != null && (
        <Text style={[tw`text-sm font-semibold`, textByVariant[variant], textStyle]}>
          {title}
        </Text>
      )}
      {children}
    </TouchableOpacity>
  );
}
