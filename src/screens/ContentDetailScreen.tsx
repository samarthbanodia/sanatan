import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';
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
import { colors, fonts, radii, sp } from '../theme/theme';
import { deityById, tracks } from '../data/content';
import { deityImage } from '../data/assets';
import type { AudioRendition } from '../data/taxonomy';
import type { RootScreenProps } from '../navigation/types';

// Real audio playback via expo-audio. Tracks whose `audio[].url` is still empty
// (catalog not yet sourced) render a tasteful "coming soon" player rather than
// faking progress — the moment a CDN url is added, the player just works.
export default function ContentDetailScreen({ route, navigation }: RootScreenProps<'ContentDetail'>) {
  const insets = useSafeAreaInsets();
  const track = tracks.find((t) => t.id === route.params.trackId) ?? tracks[0];
  const deity = deityById(track.deityId);
  const { scrollY, onScroll } = useParallaxScroll();

  // Each track can ship two renditions the listener switches between.
  const [rendition, setRendition] = useState<AudioRendition>('majestic');
  const renditions = track.audio ?? [];
  const variantFor = (r: AudioRendition) => renditions.find((a) => (a.rendition ?? 'majestic') === r);
  const showRenditionToggle = !!variantFor('majestic') && !!variantFor('basic');

  // Selected rendition → fall back to whichever variant actually has a url.
  const active = variantFor(rendition) ?? renditions.find((a) => a.url) ?? renditions[0];
  const audioUrl = active?.url || null;
  const hasAudio = !!audioUrl;

  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const [trackWidth, setTrackWidth] = useState(0);
  const progressSV = useSharedValue(0);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
  }, []);

  const duration = status.duration || dur(track.duration);
  const progress = duration > 0 ? Math.min(status.currentTime / duration, 1) : 0;

  // Smoothly interpolate the fill between the player's 250ms status ticks.
  useEffect(() => {
    progressSV.value = withTiming(progress, { duration: 260 });
  }, [progress, progressSV]);

  // Reset to the start once a track finishes so the next tap replays it.
  useEffect(() => {
    if (status.didJustFinish) player.seekTo(0);
  }, [status.didJustFinish, player]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progressSV.value * 100}%` }));

  // Parallax: hero art rises and gently scales/fades as you scroll the lyrics.
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-150, 0, 300], [-60, 0, 120]) },
      { scale: interpolate(scrollY.value, [-150, 0], [1.18, 1], { extrapolateRight: 'clamp' }) },
    ],
    opacity: interpolate(scrollY.value, [0, 260], [1, 0.15], { extrapolateRight: 'clamp' }),
  }));

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!hasAudio) return;
    if (status.playing) player.pause();
    else player.play();
  };

  const skip = (seconds: number) => {
    if (!hasAudio) return;
    Haptics.selectionAsync();
    const next = Math.max(0, Math.min(status.currentTime + seconds, duration));
    player.seekTo(next);
  };

  const onSeek = (e: { nativeEvent: { locationX: number } }) => {
    if (!hasAudio || trackWidth <= 0) return;
    Haptics.selectionAsync();
    const ratio = Math.max(0, Math.min(e.nativeEvent.locationX / trackWidth, 1));
    player.seekTo(ratio * duration);
  };

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
        {showRenditionToggle && (
          <View style={styles.segment}>
            {(['majestic', 'basic'] as const).map((r) => {
              const on = r === rendition;
              return (
                <Pressable
                  key={r}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setRendition(r);
                  }}
                  style={[styles.segmentBtn, on && styles.segmentBtnOn]}
                >
                  <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                    {r === 'majestic' ? 'Majestic' : 'Basic'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <Pressable onPress={onSeek} hitSlop={12} disabled={!hasAudio}>
          <View style={styles.progressTrack} onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}>
            <Animated.View style={[styles.progressFill, fillStyle]}>
              <LinearGradient
                colors={['#F6C84C', '#FF7A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </Pressable>
        <View className="flex-row items-center justify-between mt-4">
          <Text className="font-body text-[12px] text-textMid w-[70px]">
            {hasAudio ? `${fmt(status.currentTime)} / ${fmt(duration)}` : track.duration}
          </Text>
          <View className="flex-row items-center gap-[22px]">
            <Pressable onPress={() => skip(-15)} hitSlop={10} disabled={!hasAudio}>
              <Ionicons name="play-back" size={22} color={hasAudio ? colors.textMid : colors.textLow} />
            </Pressable>
            <PressableScale haptic="none" onPress={togglePlay} style={styles.playMain}>
              <LinearGradient
                colors={hasAudio ? ['#F6C84C', '#FF7A1A'] : ['#2A2A2E', '#1C1C1F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playMainGrad}
              >
                <Ionicons
                  name={status.playing ? 'pause' : 'play'}
                  size={24}
                  color={hasAudio ? '#3A1205' : colors.textMid}
                  style={{ marginLeft: status.playing ? 0 : 2 }}
                />
              </LinearGradient>
            </PressableScale>
            <Pressable onPress={() => skip(15)} hitSlop={10} disabled={!hasAudio}>
              <Ionicons name="play-forward" size={22} color={hasAudio ? colors.textMid : colors.textLow} />
            </Pressable>
          </View>
          <Ionicons name="heart-outline" size={22} color={colors.textMid} style={styles.likeIcon} />
        </View>
        {!hasAudio && (
          <Text className="font-body text-[11px] text-textLow mt-3 text-center">Audio coming soon</Text>
        )}
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
  segment: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.glass,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorderSoft,
    padding: 3,
    marginBottom: sp(4),
  },
  segmentBtn: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: radii.pill },
  segmentBtnOn: { backgroundColor: 'rgba(246,200,76,0.14)' },
  segmentText: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 0.3, color: colors.textLow },
  segmentTextOn: { color: colors.gold },
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
