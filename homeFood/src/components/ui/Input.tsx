import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import tw from "../../lib/tailwind";
import { colors } from "../../constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  rightAccessory?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Input({
  label,
  hint,
  error,
  required,
  rightAccessory,
  containerStyle,
  labelStyle,
  style,
  placeholderTextColor = colors.textFaint,
  cursorColor = colors.primary,
  selectionColor = colors.primary,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[tw`w-full`, containerStyle]}>
      {label && (
        <Text style={[tw`mb-1.5 text-sm font-medium text-text`, labelStyle]}>
          {label}
          {required && <Text style={tw`text-red-text`}> *</Text>}
        </Text>
      )}
      <View
        style={[
          tw`flex-row items-center rounded-xl border bg-card px-3.5 py-2.5`,
          focused ? tw`border-primary` : tw`border-borderStrong`,
          focused && {
            shadowColor: colors.primary,
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 0 },
            elevation: 0,
          },
          !!error && tw`border-red-text`,
        ]}
      >
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={placeholderTextColor}
          cursorColor={cursorColor}
          selectionColor={selectionColor}
          style={[tw`flex-1 text-sm text-text font-body`, style]}
        />
        {rightAccessory}
      </View>
      {error ? (
        <Text style={tw`mt-1 text-xs text-red-text`}>{error}</Text>
      ) : hint ? (
        <Text style={tw`mt-1 text-xs text-textMuted`}>{hint}</Text>
      ) : null}
    </View>
  );
}
