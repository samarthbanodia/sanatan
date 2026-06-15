import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii } from '../theme/theme';

export default function GradientButton({
  label,
  onPress,
  gradient = ['#F6C84C', '#FF7A1A'] as readonly string[],
  style,
  icon,
}: {
  label: string;
  onPress?: () => void;
  gradient?: readonly string[];
  style?: ViewStyle;
  icon?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.grad}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.pill,
    shadowColor: colors.glowSaffron,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  grad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: radii.pill,
  },
  icon: { fontSize: 17, color: '#3A1205' },
  label: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#3A1205', letterSpacing: 0.3 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
