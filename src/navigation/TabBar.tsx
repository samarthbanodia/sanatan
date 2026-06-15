import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fill, fonts, radii } from '../theme/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const ICONS: Record<string, { on: IconName; off: IconName }> = {
  Darshan: { on: 'flame', off: 'flame-outline' },
  Library: { on: 'musical-notes', off: 'musical-notes-outline' },
  Talk: { on: 'sparkles', off: 'sparkles-outline' },
};

const H_PAD = 8;

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const count = state.routes.length;
  const itemWidth = barWidth > 0 ? (barWidth - H_PAD * 2) / count : 0;

  // Shared values drive the gold pill that springs between tabs.
  const pos = useSharedValue(state.index);
  const w = useSharedValue(itemWidth);

  useEffect(() => {
    pos.value = withSpring(state.index, { damping: 16, stiffness: 180, mass: 0.7 });
  }, [state.index, pos]);
  useEffect(() => {
    w.value = itemWidth;
  }, [itemWidth, w]);

  const pillStyle = useAnimatedStyle(() => ({
    width: w.value,
    transform: [{ translateX: H_PAD + pos.value * w.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || 14 }]}>
      <BlurView intensity={40} tint="dark" style={styles.bar} onLayout={onLayout}>
        <View style={styles.barTint} />
        {itemWidth > 0 && (
          <Animated.View style={[styles.pill, { height: 44 }, pillStyle]} pointerEvents="none">
            <View style={styles.pillInner} />
          </Animated.View>
        )}
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = ICONS[route.name];
          const onPress = () => {
            Haptics.selectionAsync();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} style={styles.item} onPress={onPress} hitSlop={8}>
              <TabIcon focused={focused} icon={icon} label={route.name} />
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

function TabIcon({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: { on: IconName; off: IconName };
  label: string;
}) {
  const s = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(focused ? 1 : 0, { damping: 12, stiffness: 220 });
  }, [focused, s]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + s.value * 0.08 }, { translateY: -s.value * 1 }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: s.value,
    transform: [{ translateY: (1 - s.value) * 3 }],
  }));

  return (
    <View style={styles.iconCol}>
      <Animated.View style={iconStyle}>
        <Ionicons
          name={focused ? icon.on : icon.off}
          size={21}
          color={focused ? colors.gold : colors.textLow}
        />
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingHorizontal: H_PAD,
    paddingVertical: 8,
    width: '100%',
    overflow: 'hidden',
  },
  barTint: { ...fill, backgroundColor: 'rgba(10,10,12,0.55)' },
  pill: {
    position: 'absolute',
    top: 8,
    left: 0,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillInner: {
    ...fill,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(246,200,76,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(246,200,76,0.22)',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 44 },
  iconCol: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 0.2,
    color: colors.gold,
  },
});
