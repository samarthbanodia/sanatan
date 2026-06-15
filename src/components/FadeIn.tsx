import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

// Subtle entrance: fade + rise. Use `delay` to stagger sibling sections.
//
// Implemented with a plain useAnimatedStyle (opacity + translateY) rather than
// Reanimated's `entering` prop on purpose: layout/entering animations leave the
// element `position: absolute` on react-native-web and can strand content
// off-screen. This approach is robust on both web and native.
export default function FadeIn({
  children,
  delay = 0,
  rise = 14,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  rise?: number;
  style?: ViewStyle;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [p, delay]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * rise }],
  }));

  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}
