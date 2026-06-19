import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { tracks } from '../data/content';
import { audioAsset } from '../data/assets';
import type { AudioRendition } from '../data/taxonomy';

// ─────────────────────────────────────────────────────────────
// Global playback — one audio player for the whole app, so a chant keeps
// playing as you move between screens. A persistent mini-bar and an expandable
// bottom-sheet player (GlobalPlayer) both read from here. Lifted out of the old
// per-screen ContentDetail player.
// ─────────────────────────────────────────────────────────────

export type Track = (typeof tracks)[number];
export const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

type SheetApi = { expand: () => void; collapse: () => void };

type PlaybackValue = {
  track: Track | null;
  rendition: AudioRendition;
  setRendition: (r: AudioRendition) => void;
  showRenditionToggle: boolean;
  hasAudio: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0..1
  speed: number;
  loop: boolean;
  play: (track: Track, rendition?: AudioRendition) => void;
  toggle: () => void;
  cycleSpeed: () => void;
  toggleLoop: () => void;
  skip: (seconds: number) => void;
  seekToRatio: (ratio: number) => void;
  expand: () => void;
  collapse: () => void;
  registerSheet: (api: SheetApi) => void;
};

const Ctx = createContext<PlaybackValue | null>(null);

function dur(s?: string) {
  if (!s) return 0;
  const [m, sec] = s.split(':').map(Number);
  return (m || 0) * 60 + (sec || 0);
}

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [rendition, setRenditionState] = useState<AudioRendition>('majestic');
  const [speedIdx, setSpeedIdx] = useState(1); // default 1×
  const [loop, setLoop] = useState(false);

  // Resolve the current source from the track + chosen rendition.
  const renditions = track?.audio ?? [];
  const variantFor = (r: AudioRendition) => renditions.find((a) => (a.rendition ?? 'majestic') === r);
  const showRenditionToggle = !!variantFor('majestic') && !!variantFor('basic');
  const active =
    variantFor(rendition) ?? renditions.find((a) => audioAsset(a.ledgerId) || a.url) ?? renditions[0];
  const localAsset = audioAsset(active?.ledgerId);
  // Memoised so a new {uri} object each render doesn't thrash the player.
  const source = useMemo(
    () => localAsset ?? (active?.url ? { uri: active.url } : null),
    [localAsset, active?.url],
  );
  const hasAudio = !!source;

  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const autoPlay = useRef(false);
  const sheetApi = useRef<SheetApi | null>(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
  }, []);

  // Re-apply rate/loop/pitch on source/setting change, and honour a pending auto-play.
  useEffect(() => {
    if (!hasAudio) return;
    try {
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(SPEEDS[speedIdx]);
      player.loop = loop;
      if (autoPlay.current) {
        player.play();
        autoPlay.current = false;
      }
    } catch {}
  }, [player, hasAudio, speedIdx, loop]);

  useEffect(() => {
    if (status.didJustFinish && !loop) player.seekTo(0);
  }, [status.didJustFinish, loop, player]);

  const duration = status.duration || dur(track?.duration);
  const progress = duration > 0 ? Math.min(status.currentTime / duration, 1) : 0;

  const play = useCallback((t: Track, r: AudioRendition = 'majestic') => {
    autoPlay.current = true;
    setTrack(t);
    setRenditionState(r);
  }, []);

  // Swapping rendition restarts the source; keep playing if we already were.
  const setRendition = useCallback(
    (r: AudioRendition) => {
      if (status.playing) autoPlay.current = true;
      setRenditionState(r);
    },
    [status.playing],
  );

  const toggle = useCallback(() => {
    if (!hasAudio) return;
    if (status.playing) player.pause();
    else player.play();
  }, [hasAudio, status.playing, player]);

  const cycleSpeed = useCallback(() => setSpeedIdx((i) => (i + 1) % SPEEDS.length), []);
  const toggleLoop = useCallback(() => setLoop((v) => !v), []);

  const skip = useCallback(
    (seconds: number) => {
      if (!hasAudio) return;
      player.seekTo(Math.max(0, Math.min(status.currentTime + seconds, duration)));
    },
    [hasAudio, player, status.currentTime, duration],
  );

  const seekToRatio = useCallback(
    (ratio: number) => {
      if (!hasAudio) return;
      player.seekTo(Math.max(0, Math.min(ratio, 1)) * duration);
    },
    [hasAudio, player, duration],
  );

  const expand = useCallback(() => sheetApi.current?.expand(), []);
  const collapse = useCallback(() => sheetApi.current?.collapse(), []);
  const registerSheet = useCallback((api: SheetApi) => {
    sheetApi.current = api;
  }, []);

  const value = useMemo<PlaybackValue>(
    () => ({
      track,
      rendition,
      setRendition,
      showRenditionToggle,
      hasAudio,
      playing: status.playing,
      currentTime: status.currentTime,
      duration,
      progress,
      speed: SPEEDS[speedIdx],
      loop,
      play,
      toggle,
      cycleSpeed,
      toggleLoop,
      skip,
      seekToRatio,
      expand,
      collapse,
      registerSheet,
    }),
    [
      track, rendition, setRendition, showRenditionToggle, hasAudio,
      status.playing, status.currentTime, duration, progress, speedIdx, loop,
      play, toggle, cycleSpeed, toggleLoop, skip, seekToRatio, expand, collapse, registerSheet,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayback() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
}
