import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import FadeIn from '../components/FadeIn';
import { TrackRow } from '../components/TrackCard';
import { colors, fonts, radii, sp, type } from '../theme/theme';
import { ContentKind, kindLabels, tracksByKind } from '../data/content';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS: ContentKind[] = ['aarti', 'bhajan', 'prayer'];
const SEG_PAD = 4;

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const [active, setActive] = useState<ContentKind>('aarti');
  const [segWidth, setSegWidth] = useState(0);

  const activeIndex = TABS.indexOf(active);
  const itemWidth = segWidth > 0 ? (segWidth - SEG_PAD * 2) / TABS.length : 0;

  const pos = useSharedValue(activeIndex);
  const w = useSharedValue(itemWidth);
  useEffect(() => {
    pos.value = withSpring(activeIndex, { damping: 16, stiffness: 200, mass: 0.6 });
  }, [activeIndex, pos]);
  useEffect(() => {
    w.value = itemWidth;
  }, [itemWidth, w]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: w.value,
    transform: [{ translateX: SEG_PAD + pos.value * w.value }],
  }));

  const list = tracksByKind(active);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + sp(4), paddingBottom: sp(28) }}
      >
        {/* NativeWind className styling (Tailwind tokens mirror theme.ts) */}
        <View className="px-5">
          <Text style={type.titleSans}>Library</Text>
          <Text className="font-body text-textMid text-[14px] mt-1">
            Sacred chants for every moment of devotion.
          </Text>
        </View>

        {/* Segmented filter with a spring-sliding selected pill */}
        <View
          style={styles.segment}
          onLayout={(e: LayoutChangeEvent) => setSegWidth(e.nativeEvent.layout.width)}
        >
          {itemWidth > 0 && <Animated.View style={[styles.segIndicator, indicatorStyle]} />}
          {TABS.map((k) => {
            const on = k === active;
            return (
              <Pressable
                key={k}
                style={styles.segItem}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActive(k);
                }}
              >
                <Text style={[styles.segText, on && styles.segTextOn]}>{kindLabels[k]}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* List */}
        <View style={styles.list}>
          {list.map((t, i) => (
            <FadeIn key={`${active}-${t.id}`} delay={i * 45} rise={10}>
              <TrackRow track={t} onPress={() => nav.navigate('ContentDetail', { trackId: t.id })} />
              {i < list.length - 1 && <View style={styles.divider} />}
            </FadeIn>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    marginHorizontal: sp(5),
    marginTop: sp(5),
    backgroundColor: colors.glass,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    padding: SEG_PAD,
  },
  segIndicator: {
    position: 'absolute',
    top: SEG_PAD,
    bottom: SEG_PAD,
    left: 0,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  segItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  segText: { fontFamily: fonts.bodyMed, fontSize: 13, letterSpacing: -0.1, color: colors.textMid },
  segTextOn: { color: colors.textHi, fontFamily: fonts.bodySemi },
  list: { paddingHorizontal: sp(5), marginTop: sp(5) },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.glassBorderSoft },
});
