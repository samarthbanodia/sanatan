import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import DeityArt from '../components/DeityArt';
import PressableScale from '../components/PressableScale';
import { useParallaxScroll } from '../hooks/useParallaxScroll';
import { colors, radii, sp } from '../theme/theme';
import { deityById, tracks } from '../data/content';
import { deityImage } from '../data/assets';
import type { RootScreenProps } from '../navigation/types';

// NOTE: audio files aren't bundled per-track yet, so playback is simulated for the prototype.
// Swap the timer for expo-audio's useAudioPlayer once track URLs exist.
export default function ContentDetailScreen({ route, navigation }: RootScreenProps<'ContentDetail'>) {
  const insets = useSafeAreaInsets();
  const track = tracks.find((t) => t.id === route.params.trackId) ?? tracks[0];
  const deity = deityById(track.deityId);
  const { scrollY, onScroll } = useParallaxScroll();

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const progressSV = useSharedValue(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.004;
        return next >= 1 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    progressSV.value = withTiming(progress, { duration: 120 });
  }, [progress, progressSV]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progressSV.value * 100}%` }));

  // Parallax: hero art rises and gently scales/fades as you scroll the lyrics.
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-150, 0, 300], [-60, 0, 120]) },
      { scale: interpolate(scrollY.value, [-150, 0], [1.18, 1], { extrapolateRight: 'clamp' }) },
    ],
    opacity: interpolate(scrollY.value, [0, 260], [1, 0.15], { extrapolateRight: 'clamp' }),
  }));

  return (
    <ScreenBackground>
      {/* Hero top bar */}
      <View style={{ paddingTop: insets.top + sp(2), zIndex: 2 }}>
        <View className="flex-row items-center justify-between px-4">
          <PressableScale haptic="selection" onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textHi} />
          </PressableScale>
          <Text className="font-bodyBold text-[12px] tracking-[2px] text-textLow">{track.kind.toUpperCase()}</Text>
          <View className="w-10" />
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: sp(40) }}
      >
        <Animated.View style={[styles.heroArt, heroStyle]}>
          <DeityArt source={deityImage(track.deityId)} radius={90} style={styles.artCircle} />
        </Animated.View>

        <View className="items-center mt-6 px-6">
          <Text className="font-display text-[32px] text-textHi text-center">{track.title}</Text>
          <Text className="font-body text-[14px] text-textMid mt-1.5 text-center">
            {deity?.name} · {track.subtitle}
          </Text>
        </View>

        {/* Lyrics */}
        <View className="px-7 mt-8">
          {track.lyrics.map((verse, i) => (
            <Text key={i} className="font-body text-[18px] leading-[32px] text-textHi text-center mb-7">
              {verse}
            </Text>
          ))}
          <Text className="font-display text-[22px] text-gold text-center mt-2">॥ श्री ॥</Text>
        </View>
      </Animated.ScrollView>

      {/* Frosted player bar */}
      <GlassCard blur intensity={50} style={[styles.player, { paddingBottom: insets.bottom + sp(3) }]} radius={radii.xl}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, fillStyle]}>
            <LinearGradient
              colors={['#F6C84C', '#FF7A1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <View className="flex-row items-center justify-between mt-4">
          <Text className="font-body text-[12px] text-textMid w-[70px]">
            {fmt(progress * dur(track.duration))} / {track.duration}
          </Text>
          <View className="flex-row items-center gap-[22px]">
            <Ionicons name="play-skip-back" size={22} color={colors.textMid} />
            <PressableScale
              haptic="medium"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setPlaying((p) => !p);
              }}
              style={styles.playMain}
            >
              <LinearGradient
                colors={['#F6C84C', '#FF7A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playMainGrad}
              >
                <Ionicons
                  name={playing ? 'pause' : 'play'}
                  size={24}
                  color="#3A1205"
                  style={{ marginLeft: playing ? 0 : 2 }}
                />
              </LinearGradient>
            </PressableScale>
            <Ionicons name="play-skip-forward" size={22} color={colors.textMid} />
          </View>
          <Ionicons name="heart-outline" size={22} color={colors.textMid} style={styles.likeIcon} />
        </View>
      </GlassCard>
    </ScreenBackground>
  );
}

function dur(s: string) {
  const [m, sec] = s.split(':').map(Number);
  return m * 60 + sec;
}
function fmt(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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

  heroArt: { alignItems: 'center', marginTop: sp(6) },
  artCircle: {
    width: 180,
    height: 180,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.glowSaffron,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  player: {
    position: 'absolute',
    left: sp(4),
    right: sp(4),
    bottom: sp(4),
    paddingHorizontal: sp(5),
    paddingTop: sp(4),
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  progressFill: { height: 5, borderRadius: 3, overflow: 'hidden' },
  likeIcon: { width: 70, textAlign: 'right' },
  playMain: { shadowColor: colors.glowSaffron, shadowOpacity: 0.7, shadowRadius: 16, elevation: 10 },
  playMainGrad: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
