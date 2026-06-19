import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import DeityArt from './DeityArt';
import PressableScale from './PressableScale';
import { usePlayback } from '../state/playback';
import { colors, fill, fonts, radii, sp } from '../theme/theme';
import { deityById } from '../data/content';
import { deityImage } from '../data/assets';

// Mini-bar sits this far above the floating tab bar.
const TABBAR_SPACE = 68;
const LYRIC_CENTER = 220;

function fmt(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// One audio player for the whole app: a persistent mini-bar that expands into a
// full draggable bottom-sheet player. Mounted once at the root.
export default function GlobalPlayer() {
  const pb = usePlayback();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const [expanded, setExpanded] = useState(false);

  const snapPoints = useMemo(() => ['94%'], []);

  // Let the provider drive the sheet (mini-bar tap, list taps).
  useEffect(() => {
    pb.registerSheet({
      expand: () => sheetRef.current?.snapToIndex(0),
      collapse: () => sheetRef.current?.close(),
    });
  }, [pb]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.6} />
    ),
    [],
  );

  const { track } = pb;
  const deity = track ? deityById(track.deityId) : undefined;

  // ── Lyrics ──
  const lines = useMemo(
    () =>
      (track?.lyrics ?? [])
        .flatMap((b) => b.split('\n'))
        .map((s) => s.trim())
        .filter(Boolean),
    [track],
  );
  const activeLine = useMemo(() => {
    if (track?.timedLyrics?.length) {
      let idx = 0;
      for (let i = 0; i < track.timedLyrics.length; i++) {
        if (pb.currentTime >= track.timedLyrics[i].t) idx = i;
      }
      return idx;
    }
    return lines.length ? Math.min(lines.length - 1, Math.floor(pb.progress * lines.length)) : 0;
  }, [track?.timedLyrics, pb.currentTime, pb.progress, lines.length]);

  const scrollRef = useRef<any>(null);
  const lineOffsets = useRef<number[]>([]);
  const userScrolling = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!expanded || !pb.playing || userScrolling.current) return;
    const y = (lineOffsets.current[activeLine] ?? 0) - LYRIC_CENTER;
    scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  }, [activeLine, expanded, pb.playing]);

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

  // ── Seek ──
  const [trackWidth, setTrackWidth] = useState(0);
  const onSeek = (e: { nativeEvent: { locationX: number } }) => {
    if (!pb.hasAudio || trackWidth <= 0) return;
    Haptics.selectionAsync();
    pb.seekToRatio(e.nativeEvent.locationX / trackWidth);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* ── Mini-bar ── */}
      {track && !expanded && (
        <View style={[styles.miniWrap, { bottom: insets.bottom + TABBAR_SPACE }]} pointerEvents="box-none">
          <Pressable onPress={() => pb.expand()} style={styles.mini}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.miniTint} />
            <View style={[styles.miniProgress, { width: `${pb.progress * 100}%` }]} />
            <DeityArt source={deityImage(track.deityId)} radius={radii.sm} style={styles.miniArt} />
            <View style={styles.miniText}>
              <Text numberOfLines={1} style={styles.miniTitle}>
                {track.title}
              </Text>
              <Text numberOfLines={1} style={styles.miniSub}>
                {deity?.name ?? track.subtitle}
              </Text>
            </View>
            <PressableScale haptic="none" onPress={pb.toggle} style={styles.miniPlay}>
              <Ionicons
                name={pb.playing ? 'pause' : 'play'}
                size={20}
                color={colors.gold}
                style={{ marginLeft: pb.playing ? 0 : 2 }}
              />
            </PressableScale>
          </Pressable>
        </View>
      )}

      {/* ── Full sheet player ── */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={(i) => setExpanded(i >= 0)}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.grabber}
        backgroundStyle={styles.sheetBg}
      >
        {track && (
          <>
            <View style={styles.sheetHeader}>
              <PressableScale haptic="selection" onPress={() => pb.collapse()} style={styles.iconBtn}>
                <Ionicons name="chevron-down" size={24} color={colors.textHi} />
              </PressableScale>
              <Text style={styles.headerLabel}>{track.kind.toUpperCase()}</Text>
              <View style={{ width: 40 }} />
            </View>

            <BottomSheetScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={onUserScrollBegin}
              onScrollEndDrag={onUserScrollEnd}
              onMomentumScrollEnd={onUserScrollEnd}
              contentContainerStyle={{ paddingBottom: 260 }}
            >
              <View style={styles.heroArt}>
                <DeityArt source={deityImage(track.deityId)} radius={86} style={styles.artCircle} />
              </View>

              <View style={{ alignItems: 'center', marginTop: sp(5), paddingHorizontal: sp(6) }}>
                <Text style={styles.title}>{track.title}</Text>
                <Text style={styles.subtitle}>
                  {deity?.name} · {track.subtitle}
                </Text>
              </View>

              <View style={styles.lyrics}>
                {lines.map((line, i) => {
                  const isActive = pb.playing && i === activeLine;
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
                <Text style={styles.shri}>॥ श्री ॥</Text>
              </View>
            </BottomSheetScrollView>

            {/* Controls */}
            <BlurView
              intensity={50}
              tint="dark"
              style={[styles.controlsCard, { paddingBottom: insets.bottom + sp(3) }]}
            >
              {pb.showRenditionToggle && (
                <View style={styles.segment}>
                  {(['majestic', 'basic'] as const).map((r) => {
                    const on = r === pb.rendition;
                    return (
                      <Pressable
                        key={r}
                        onPress={() => {
                          Haptics.selectionAsync();
                          pb.setRendition(r);
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

              <Pressable onPress={onSeek} hitSlop={12} disabled={!pb.hasAudio}>
                <View
                  style={styles.progressTrack}
                  onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
                >
                  <View style={[styles.progressFill, { width: `${pb.progress * 100}%` }]}>
                    <LinearGradient
                      colors={['#F6C84C', '#FF7A1A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                </View>
              </Pressable>

              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{pb.hasAudio ? fmt(pb.currentTime) : '0:00'}</Text>
                <Text style={styles.timeTextLow}>
                  {pb.hasAudio ? fmt(pb.duration) : track.duration}
                </Text>
              </View>

              <View style={styles.controls}>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    pb.toggleLoop();
                  }}
                  hitSlop={10}
                  style={styles.ctrlSide}
                >
                  <Ionicons name="repeat" size={22} color={pb.loop ? colors.gold : colors.textLow} />
                </Pressable>
                <Pressable onPress={() => pb.skip(-15)} hitSlop={10} disabled={!pb.hasAudio}>
                  <Ionicons name="play-back" size={24} color={pb.hasAudio ? colors.textMid : colors.textLow} />
                </Pressable>
                <PressableScale haptic="medium" onPress={pb.toggle} style={styles.playMain}>
                  <LinearGradient
                    colors={pb.hasAudio ? ['#F6C84C', '#FF7A1A'] : ['#2A2A2E', '#1C1C1F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.playMainGrad}
                  >
                    <Ionicons
                      name={pb.playing ? 'pause' : 'play'}
                      size={26}
                      color={pb.hasAudio ? '#3A1205' : colors.textMid}
                      style={{ marginLeft: pb.playing ? 0 : 2 }}
                    />
                  </LinearGradient>
                </PressableScale>
                <Pressable onPress={() => pb.skip(15)} hitSlop={10} disabled={!pb.hasAudio}>
                  <Ionicons name="play-forward" size={24} color={pb.hasAudio ? colors.textMid : colors.textLow} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    pb.cycleSpeed();
                  }}
                  hitSlop={10}
                  style={styles.ctrlSide}
                >
                  <Text style={[styles.speedText, pb.speed !== 1 && styles.speedTextOn]}>{pb.speed}×</Text>
                </Pressable>
              </View>

              {!pb.hasAudio && <Text style={styles.comingSoon}>Audio coming soon</Text>}
            </BlurView>
          </>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  // mini-bar
  miniWrap: { position: 'absolute', left: 16, right: 16 },
  mini: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  miniTint: { ...fill, backgroundColor: 'rgba(16,16,18,0.6)' },
  miniProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.gold,
  },
  miniArt: { width: 40, height: 40, backgroundColor: colors.bg2 },
  miniText: { flex: 1, marginLeft: 12 },
  miniTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textHi },
  miniSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textLow, marginTop: 1 },
  miniPlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,76,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(246,200,76,0.22)',
  },

  // sheet
  sheetBg: { backgroundColor: colors.bg1, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl },
  grabber: { backgroundColor: 'rgba(255,255,255,0.25)', width: 40 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(4),
    paddingBottom: sp(2),
  },
  headerLabel: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.textLow },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroArt: { alignItems: 'center', marginTop: sp(2) },
  artCircle: {
    width: 172,
    height: 172,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.glowSaffron,
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.textHi, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textMid, marginTop: 6, textAlign: 'center' },

  lyrics: { paddingHorizontal: sp(7), marginTop: sp(7) },
  lyricLine: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.textLow,
    marginBottom: sp(5),
  },
  lyricLineActive: { color: colors.textHi, fontFamily: fonts.bodySemi },
  shri: { fontFamily: fonts.display, fontSize: 22, color: colors.gold, textAlign: 'center', marginTop: sp(2) },

  controlsCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: sp(6),
    paddingTop: sp(4),
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
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

  progressTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3, overflow: 'hidden' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: sp(3) },
  timeText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMid },
  timeTextLow: { fontFamily: fonts.body, fontSize: 12, color: colors.textLow },

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
  playMainGrad: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  comingSoon: { fontFamily: fonts.body, fontSize: 11, color: colors.textLow, marginTop: sp(3), textAlign: 'center' },
});
