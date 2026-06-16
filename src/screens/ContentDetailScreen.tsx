import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
// Where the active lyric line should sit in the viewport when auto-scrolling.
const LYRIC_CENTER = 240;

export default function ContentDetailScreen({ route, navigation }: RootScreenProps<'ContentDetail'>) {
  const insets = useSafeAreaInsets();
  const track = tracks.find((t) => t.id === route.params.trackId) ?? tracks[0];
  const deity = deityById(track.deityId);
  const { scrollY, onScroll } = useParallaxScroll();

  // ── Renditions (majestic / basic) ──
  const [rendition, setRendition] = useState<AudioRendition>('majestic');
  const renditions = track.audio ?? [];
  const variantFor = (r: AudioRendition) => renditions.find((a) => (a.rendition ?? 'majestic') === r);
  const showRenditionToggle = !!variantFor('majestic') && !!variantFor('basic');
  const active = variantFor(rendition) ?? renditions.find((a) => a.url) ?? renditions[0];
  const audioUrl = active?.url || null;
  const hasAudio = !!audioUrl;

  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  // ── Playback controls ──
  const [speedIdx, setSpeedIdx] = useState(1); // default 1×
  const [loop, setLoop] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const progressSV = useSharedValue(0);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
  }, []);

  // Re-apply rate/loop/pitch whenever the player (source) or settings change.
  useEffect(() => {
    if (!hasAudio) return;
    try {
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(SPEEDS[speedIdx]);
      player.loop = loop;
    } catch {}
  }, [player, hasAudio, speedIdx, loop]);

  const duration = status.duration || dur(track.duration);
  const progress = duration > 0 ? Math.min(status.currentTime / duration, 1) : 0;

  useEffect(() => {
    progressSV.value = withTiming(progress, { duration: 260 });
  }, [progress, progressSV]);

  useEffect(() => {
    if (status.didJustFinish && !loop) player.seekTo(0);
  }, [status.didJustFinish, loop, player]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progressSV.value * 100}%` }));

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-150, 0, 300], [-60, 0, 120]) },
      { scale: interpolate(scrollY.value, [-150, 0], [1.18, 1], { extrapolateRight: 'clamp' }) },
    ],
    opacity: interpolate(scrollY.value, [0, 260], [1, 0.15], { extrapolateRight: 'clamp' }),
  }));

  // ── Live synced lyrics ──
  // Flatten verse blocks to individual lines. `timedLyrics` (LRC-style) gives precise
  // sync when present; otherwise lines are distributed evenly across the duration.
  const lines = useMemo(
    () => track.lyrics.flatMap((b) => b.split('\n')).map((s) => s.trim()).filter(Boolean),
    [track]
  );
  const activeLine = useMemo(() => {
    if (track.timedLyrics?.length) {
      let idx = 0;
      for (let i = 0; i < track.timedLyrics.length; i++) {
        if (status.currentTime >= track.timedLyrics[i].t) idx = i;
      }
      return idx;
    }
    return lines.length ? Math.min(lines.length - 1, Math.floor(progress * lines.length)) : 0;
  }, [track.timedLyrics, status.currentTime, progress, lines.length]);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const lyricsTop = useRef(0);
  const lineOffsets = useRef<number[]>([]);
  const userScrolling = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to keep the active line centered while playing (unless the user is scrolling).
  useEffect(() => {
    if (!hasAudio || !status.playing || userScrolling.current) return;
    const y = lyricsTop.current + (lineOffsets.current[activeLine] ?? 0) - LYRIC_CENTER;
    scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  }, [activeLine, hasAudio, status.playing]);

  const onUserScrollBegin = () => {
    userScrolling.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };
  const onUserScrollEnd = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      userScrolling.current = false;
    }, 4000);
  };

  // ── Control handlers ──
  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!hasAudio) return;
    if (status.playing) player.pause();
    else player.play();
  };
  const cycleSpeed = () => {
    Haptics.selectionAsync();
    setSpeedIdx((i) => (i + 1) % SPEEDS.length);
  };
  const toggleLoop = () => {
    Haptics.selectionAsync();
    setLoop((v) => !v);
  };
  const skip = (seconds: number) => {
    if (!hasAudio) return;
    Haptics.selectionAsync();
    player.seekTo(Math.max(0, Math.min(status.currentTime + seconds, duration)));
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
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={onUserScrollBegin}
        onScrollEndDrag={onUserScrollEnd}
        onMomentumScrollEnd={onUserScrollEnd}
        contentContainerStyle={{ paddingBottom: sp(48) }}
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

        {/* Live lyrics */}
        <View
          style={styles.lyrics}
          onLayout={(e: LayoutChangeEvent) => {
            lyricsTop.current = e.nativeEvent.layout.y;
          }}
        >
          {lines.map((line, i) => {
            const isActive = hasAudio && status.playing && i === activeLine;
            return (
              <View
                key={i}
                onLayout={(e: LayoutChangeEvent) => {
                  lineOffsets.current[i] = e.nativeEvent.layout.y;
                }}
              >
                <Text style={[styles.lyricLine, isActive && styles.lyricLineActive]}>{line}</Text>
              </View>
            );
          })}
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

        <View className="flex-row items-center justify-between mt-3">
          <Text className="font-body text-[12px] text-textMid">
            {hasAudio ? fmt(status.currentTime) : '0:00'}
          </Text>
          <Text className="font-body text-[12px] text-textLow">
            {hasAudio ? fmt(duration) : track.duration}
          </Text>
        </View>

        {/* Transport: loop · −15 · play · +15 · speed */}
        <View style={styles.controls}>
          <Pressable onPress={toggleLoop} hitSlop={10} style={styles.ctrlSide}>
            <Ionicons name="repeat" size={22} color={loop ? colors.gold : colors.textLow} />
          </Pressable>
          <Pressable onPress={() => skip(-15)} hitSlop={10} disabled={!hasAudio}>
            <Ionicons name="play-back" size={24} color={hasAudio ? colors.textMid : colors.textLow} />
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
                size={26}
                color={hasAudio ? '#3A1205' : colors.textMid}
                style={{ marginLeft: status.playing ? 0 : 2 }}
              />
            </LinearGradient>
          </PressableScale>
          <Pressable onPress={() => skip(15)} hitSlop={10} disabled={!hasAudio}>
            <Ionicons name="play-forward" size={24} color={hasAudio ? colors.textMid : colors.textLow} />
          </Pressable>
          <Pressable onPress={cycleSpeed} hitSlop={10} style={styles.ctrlSide}>
            <Text style={[styles.speedText, SPEEDS[speedIdx] !== 1 && styles.speedTextOn]}>
              {SPEEDS[speedIdx]}×
            </Text>
          </Pressable>
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

  lyrics: { paddingHorizontal: sp(7), marginTop: sp(8) },
  lyricLine: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.textLow,
    marginBottom: sp(5),
  },
  lyricLineActive: { color: colors.textHi, fontFamily: fonts.bodySemi },

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

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: sp(3),
    paddingHorizontal: sp(1),
  },
  ctrlSide: { width: 48, alignItems: 'center', justifyContent: 'center' },
  speedText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textLow },
  speedTextOn: { color: colors.gold },
  playMain: { shadowColor: colors.glowSaffron, shadowOpacity: 0.7, shadowRadius: 16, elevation: 10 },
  playMainGrad: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
