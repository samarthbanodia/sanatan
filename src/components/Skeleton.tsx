import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/theme';

// A shimmering placeholder used while deity art loads — a warm sheen sweeps
// left-to-right across a near-black surface. Premium loading state.
export default function Skeleton({
  style,
  radius = 0,
}: {
  style?: StyleProp<ViewStyle>;
  radius?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [t]);

  const sheen = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [-220, 220]) }],
  }));

  return (
    <View style={[styles.base, { borderRadius: radius }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, sheen]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.06)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: colors.bg2 },
});
