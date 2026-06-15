import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import DivineOrb from '../components/DivineOrb';
import FadeIn from '../components/FadeIn';
import PressableScale from '../components/PressableScale';
import { colors, radii, sp } from '../theme/theme';
import { deityById } from '../data/content';
import { deityImage } from '../data/assets';
import { useVoiceSession, SessionState } from '../voice/useVoiceSession';
import type { RootScreenProps } from '../navigation/types';

// Styling note: layout + simple text use NativeWind `className`; animated/gradient/blur
// (entering bubbles, mic halo, gradients) stay on StyleSheet.

const STATUS: Record<SessionState, string> = {
  idle: 'Tap to speak',
  listening: 'Listening…',
  thinking: 'Reflecting…',
  speaking: 'Speaking',
};

export default function ConversationScreen({ route, navigation }: RootScreenProps<'Conversation'>) {
  const insets = useSafeAreaInsets();
  const deity = deityById(route.params.deityId)!;
  const { state, turns, speakTurn, end } = useVoiceSession(deity);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => () => end(), [end]);
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns]);

  const orbState = state === 'thinking' ? 'idle' : state;
  const active = state !== 'idle';

  // Mic halo pulses while a turn is in flight.
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      pulse.value = withTiming(0, { duration: 300 });
    }
  }, [active, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.6,
    transform: [{ scale: 1 + pulse.value * 0.35 }],
  }));

  return (
    <ScreenBackground sanctuary>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4" style={{ paddingTop: insets.top + sp(2) }}>
        <PressableScale haptic="selection" onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textHi} />
        </PressableScale>
        <View className="flex-1">
          <Text className="font-display text-[24px] text-textHi">{deity.name}</Text>
          <Text className="font-body text-[12px] text-textLow">{deity.epithet}</Text>
        </View>
      </View>

      {/* Orb */}
      <View className="items-center mt-3">
        <DivineOrb size={150} glyph={deity.glyph} gradient={deity.gradient} image={deityImage(deity.id)} state={orbState} />
        <Text className="font-bodyMed text-[13px] tracking-[1px] text-textMid mt-1">{STATUS[state]}</Text>
      </View>

      {/* Transcript */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 mt-2 px-5"
        contentContainerStyle={{ paddingBottom: sp(4) }}
        showsVerticalScrollIndicator={false}
      >
        {turns.map((t) =>
          t.role === 'deity' ? (
            <FadeIn key={t.id} rise={10} style={styles.deityBubbleWrap}>
              <LinearGradient
                colors={deity.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.deityBubble}
              >
                <Text className="font-body text-[15px] leading-[22px] text-[#2A1005]">{t.text}</Text>
              </LinearGradient>
            </FadeIn>
          ) : (
            <FadeIn key={t.id} rise={10} style={styles.devoteeBubble}>
              <Text className="font-body text-[15px] leading-[22px] text-textHi">{t.text}</Text>
            </FadeIn>
          )
        )}
      </ScrollView>

      {/* Mic control */}
      <View className="items-center pt-2" style={{ paddingBottom: insets.bottom + sp(4) }}>
        <View className="items-center justify-center">
          <Animated.View style={[styles.micHalo, haloStyle]} pointerEvents="none" />
          <PressableScale
            haptic="medium"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              speakTurn();
            }}
            disabled={state !== 'idle'}
          >
            <LinearGradient
              colors={state === 'idle' ? (['#F6C84C', '#FF7A1A'] as const) : (['#2A2A2E', '#1C1C1F'] as const)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mic}
            >
              <Ionicons
                name={state === 'listening' ? 'radio' : 'mic'}
                size={30}
                color={state === 'idle' ? '#3A1205' : colors.textMid}
              />
            </LinearGradient>
          </PressableScale>
        </View>
        <Text className="font-body text-[11px] text-textLow mt-3">Realtime voice connects here — mocked for now.</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deityBubbleWrap: { alignItems: 'flex-start', marginBottom: sp(3) },
  deityBubble: {
    maxWidth: '88%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
    borderTopLeftRadius: 6,
  },
  devoteeBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    borderTopRightRadius: 6,
    marginBottom: sp(3),
  },
  micHalo: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.glowSaffron,
  },
  mic: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.glowSaffron,
    shadowOpacity: 0.7,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
});
