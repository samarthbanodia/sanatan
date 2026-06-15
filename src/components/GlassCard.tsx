import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import PressableScale from './PressableScale';
import { colors, fill, radii, shadow } from '../theme/theme';

// A raised surface on black. Two looks:
//  - default: near-black solid panel with a hairline border (Opal-style).
//  - blur:    a true frosted-glass panel (expo-blur) for floating bars/overlays.
export default function GlassCard({
  children,
  style,
  onPress,
  radius = radii.lg,
  blur = false,
  intensity = 40,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  onPress?: () => void;
  radius?: number;
  blur?: boolean;
}) {
  const inner = blur ? (
    <BlurView intensity={intensity} tint="dark" style={[styles.surface, styles.blurSurface, { borderRadius: radius }, style]}>
      <View style={[fill, { backgroundColor: 'rgba(12,12,14,0.5)' }]} />
      {children}
    </BlurView>
  ) : (
    <View style={[styles.surface, styles.solidSurface, { borderRadius: radius }, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} haptic="selection" style={{ borderRadius: radius }}>
        {inner}
      </PressableScale>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  solidSurface: { backgroundColor: colors.bg2, ...shadow.card },
  blurSurface: { borderColor: colors.glassBorderSoft },
});
