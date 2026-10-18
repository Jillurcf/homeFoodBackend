import React, { useEffect, useRef } from "react";
import { Animated, View, type StyleProp, type ViewStyle } from "react-native";
import tw from "../../lib/tailwind";

function usePulse() {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ height, width, circle, style }: SkeletonProps) {
  const opacity = usePulse();

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        tw`bg-text/10`,
        circle && tw`rounded-full`,
        !circle && tw`rounded`,
        { opacity },
        height != null && { height },
        width != null && { width },
        style,
      ]}
    />
  );
}

export function FoodCardSkeleton() {
  const opacity = usePulse();
  const blockStyle = [tw`rounded bg-text/10`, { opacity }];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={tw`overflow-hidden rounded-2xl border border-border bg-card shadow-sm`}
    >
      <Animated.View style={[tw`aspect-[4/3] bg-text/10`, { opacity }]} />
      <View style={tw`flex-1 gap-2 p-3`}>
        <Animated.View style={[blockStyle, tw`h-4 w-3/4`]} />
        <Animated.View style={[blockStyle, tw`h-3 w-1/2`]} />
        <Animated.View style={[blockStyle, tw`h-3 w-2/3`]} />
        <View
          style={tw`mt-auto flex-row items-center justify-between gap-2 border-t border-border pt-2.5`}
        >
          <Animated.View style={[blockStyle, tw`h-5 w-12`]} />
          <Animated.View style={[blockStyle, tw`h-7 w-16 rounded-full`]} />
        </View>
      </View>
    </View>
  );
}
