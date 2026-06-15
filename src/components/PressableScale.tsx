import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HapticKind = 'none' | 'selection' | 'light' | 'medium';

function fireHaptic(kind: HapticKind) {
  if (kind === 'none') return;
  if (kind === 'selection') {
    Haptics.selectionAsync();
    return;
  }
  Haptics.impactAsync(
    kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
  );
}

type Props = Omit<PressableProps, 'style'> & {
  scaleTo?: number;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

// The core tactile primitive: a spring scale-down on press + haptic.
// Replaces the ad-hoc `pressed && { opacity, scale }` patterns across the app
// with consistent, buttery feedback. Drop-in for <Pressable>.
export default function PressableScale({
  scaleTo = 0.96,
  haptic = 'light',
  onPressIn,
  onPressOut,
  onPress,
  style,
  children,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 20, stiffness: 320, mass: 0.5 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        fireHaptic(haptic);
        onPress?.(e);
      }}
      style={[style, animStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
