import React from 'react';
import { Image, StyleSheet, Text, View, ScrollView as RNScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import DivineAura from '../components/DivineAura';
import DivineOrb from '../components/DivineOrb';
import DiyaFlame from '../components/DiyaFlame';
import DeityArt from '../components/DeityArt';
import AmbientToggle from '../components/AmbientToggle';
import FadeIn from '../components/FadeIn';
import PressableScale from '../components/PressableScale';
import { TrackTile } from '../components/TrackCard';
import { useParallaxScroll } from '../hooks/useParallaxScroll';
import { colors, fill, fonts, gradients, radii, sp, type } from '../theme/theme';
import { deities, deityById, tracks } from '../data/content';
import { deityImage } from '../data/assets';
import { usePreferences } from '../state/preferences';
import { useDiya } from '../state/useDiya';
import { usePlayback } from '../state/playback';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HERO_H = 460;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DarshanScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { scrollY, onScroll } = useParallaxScroll();
  const { prefs } = usePreferences();
  const diya = useDiya();
  const pb = usePlayback();

  const openTrack = (t: (typeof tracks)[number]) => {
    pb.play(t);
    pb.expand();
  };

  // Featured = the user's chosen guardian deity; falls back to a daily rotation.
  const featured =
    (prefs.deityId ? deityById(prefs.deityId) : undefined) ??
    deities[new Date().getDate() % deities.length];
  const dailyAarti = tracks.find((t) => t.kind === 'aarti' && t.deityId === featured.id) ?? tracks[0];
  const popular = tracks.slice(0, 6);

  // Cinematic hero: the featured deity portrait parallaxes behind the orb.
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-200, 0, HERO_H], [-100, 0, HERO_H * 0.5]) },
      { scale: interpolate(scrollY.value, [-200, 0], [1.25, 1], { extrapolateRight: 'clamp' }) },
    ],
    opacity: interpolate(scrollY.value, [0, HERO_H * 0.7], [1, 0], { extrapolateRight: 'clamp' }),
  }));

  return (
    <ScreenBackground>
      {/* Parallax hero backdrop — the deity of the day */}
      <Animated.View style={[styles.hero, heroStyle]} pointerEvents="none">
        <Image source={deityImage(featured.id)} style={fill} resizeMode="cover" />
        {/* GPU divine aura — breathing bloom (deity-tinted) + film grain */}
        <DivineAura height={HERO_H} color={(featured.gradient?.[1] as string) ?? colors.saffron} />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)', '#000000']}
          locations={[0, 0.35, 0.8, 1]}
          style={fill}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + sp(2), paddingBottom: sp(28) }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 mt-2">
          <View>
            <Text className="font-body text-[15px] text-textMid">{greeting()}</Text>
            <Text className="mt-0.5" style={type.title}>Sanatan</Text>
          </View>
          <AmbientToggle />
        </View>
        <Text className="font-displayItalic italic text-[16px] text-textLow px-5 mt-1">
          “Asato mā sadgamaya” — lead me from the unreal to the real.
        </Text>

        {/* Deity of the day — darshan */}
        <FadeIn delay={60} style={styles.darshanWrap}>
          <Text className="mb-1" style={type.section}>
            {prefs.deityId ? 'YOUR DARSHAN' : 'DARSHAN OF THE DAY'}
          </Text>
          <View className="my-1">
            <DivineOrb
              size={172}
              glyph={featured.glyph}
              gradient={featured.gradient}
              image={deityImage(featured.id)}
              state="idle"
            />
          </View>
          <Text className="mt-1" style={type.title}>{featured.name}</Text>
          <Text className="font-body text-[14px] text-textMid mt-0.5 mb-4">{featured.epithet}</Text>

          <PressableScale
            haptic="medium"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              nav.navigate('Conversation', { deityId: featured.id });
            }}
          >
            <LinearGradient
              colors={gradients.divine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.talkBtn}
            >
              <Ionicons name="sparkles" size={15} color="#3A1205" />
              <Text className="font-bodyBold text-[15px] text-[#3A1205]">Seek a 1-on-1 darshan</Text>
            </LinearGradient>
          </PressableScale>
        </FadeIn>

        {/* Daily diya — light one lamp a day, keep the flame */}
        <FadeIn delay={110} style={styles.section}>
          <Text style={type.section}>DAILY DIYA</Text>
          <GlassCard
            style={styles.diyaCard}
            onPress={() => {
              if (!diya.litToday) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                diya.light();
              }
            }}
          >
            <DiyaFlame size={50} lit={diya.litToday} />
            <View className="flex-1">
              <Text className="font-bodyBold text-[17px] text-textHi">
                {diya.litToday ? 'Diya lit today' : 'Light today’s diya'}
              </Text>
              <Text className="font-body text-[13px] text-textLow mt-0.5">
                {diya.litToday ? 'Keep the flame glowing each day' : 'A small moment of devotion'}
              </Text>
            </View>
            {diya.streak > 0 && (
              <View style={styles.streakPill}>
                <Ionicons name="flame" size={13} color={colors.saffron} />
                <Text style={styles.streakNum}>{diya.streak}</Text>
              </View>
            )}
          </GlassCard>
        </FadeIn>

        {/* Daily aarti card */}
        <FadeIn delay={150} style={styles.section}>
          <Text style={type.section}>TODAY&apos;S AARTI</Text>
          <GlassCard
            style={styles.aartiCard}
            onPress={() => openTrack(dailyAarti)}
          >
            <DeityArt source={deityImage(dailyAarti.deityId)} radius={radii.md} style={styles.aartiThumb} />
            <View className="flex-1">
              <Text className="font-bodyBold text-[17px] text-textHi">{dailyAarti.title}</Text>
              <Text className="font-body text-[13px] text-textLow mt-0.5">{dailyAarti.subtitle}</Text>
            </View>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={16} color={colors.gold} style={{ marginLeft: 2 }} />
            </View>
          </GlassCard>
        </FadeIn>

        {/* Popular carousel */}
        <FadeIn delay={240} style={styles.section}>
          <Text style={[type.section, { marginLeft: sp(5) }]}>BELOVED CHANTS</Text>
          <RNScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {popular.map((t) => (
              <TrackTile
                key={t.id}
                track={t}
                onPress={() => openTrack(t)}
              />
            ))}
          </RNScrollView>
        </FadeIn>
      </Animated.ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_H },
  darshanWrap: { alignItems: 'center', marginTop: sp(4) },
  talkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
  },

  section: { marginTop: sp(8), paddingHorizontal: sp(5) },
  aartiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    marginTop: sp(3),
  },
  aartiThumb: {
    width: 58,
    height: 58,
    backgroundColor: colors.bg2,
  },
  diyaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: sp(3),
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  streakNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.amber,
  },
  playCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  carousel: { gap: 14, paddingHorizontal: sp(5), paddingTop: sp(3) },
});
