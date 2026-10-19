import React from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "../../lib/tailwind";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AuthShell({ title, subtitle, children, footer, style }: AuthShellProps) {
  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <ScrollView
        contentContainerStyle={tw`flex-grow justify-center px-4 py-10`}
        keyboardShouldPersistTaps="handled"
        style={style}
      >
        <View style={tw`w-full rounded-2xl border border-border bg-card p-6 shadow-sm`}>
          <View style={tw`items-center`}>
            <Image
              source={require("../../../assets/images/logo3.png")}
              style={tw`h-16 w-16`}
              resizeMode="contain"
            />
            <Text style={tw`mt-2 font-display text-2xl font-semibold text-text`}>
              {title}
            </Text>
            <Text style={tw`mt-1 text-center text-sm text-textMuted`}>{subtitle}</Text>
          </View>
          <View style={tw`mt-6`}>{children}</View>
        </View>
        {footer ? <View style={tw`mt-5`}>{footer}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
