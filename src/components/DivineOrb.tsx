import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, fill, fonts } from '../theme/theme';

type OrbState = 'idle' | 'listening' | 'speaking';

// The signature divine orb. A gradient core breathes, an aura ring expands outward,
// and a slow rotating sheen makes the light feel alive. Cadence + glow react to the
// voice-session state. Used for darshan + the voice agent.
export default function DivineOrb({
  size = 200,
  glyph = 'ॐ',
  gradient = ['#FFF0C4', '#FFB347', '#FF6A2B'] as readonly string[],
  state = 'idle',
  image,
}: {
  size?: number;
  glyph?: string;
  gradient?: readonly string[];
  state?: OrbState;
  image?: any;
}) {
  const speed = state === 'speaking' ? 900 : state === 'listening' ? 1500 : 2600;
  const amp = state === 'idle' ? 0.06 : 0.14;
  const haloMax = state === 'idle' ? 0.5 : 0.78;

  const pulse = useSharedValue(0);
  const ring = useSharedValue(0);
  const spin = useSharedValue(0);

  // Breathing — restarts at the new cadence whenever state changes.
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: speed, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [speed, pulse]);

  // Expanding aura ring (continuous).
  useEffect(() => {
    ring.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [ring]);

  // Slow rotating sheen (continuous).
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.linear }), -1, false);
  }, [spin]);

  const coreStyle = useAnimatedStyle(
    () => ({ transform: [{ scale: interpolate(pulse.value, [0, 1], [1 - amp, 1 + amp]) }] }),
    [amp]
  );
  const haloStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(pulse.value, [0, 1], [haloMax * 0.5, haloMax]),
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.12]) }],
    }),
    [haloMax]
  );
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.4, 1], [0, 0.5, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.9, 1.7]) }],
  }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <View style={[styles.wrap, { width: size * 1.7, height: size * 1.7 }]}>
      {/* expanding aura ring */}
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: gradient[1] as string },
          ringStyle,
        ]}
      />
      {/* soft halo */}
      <Animated.View
        style={[styles.halo, { width: size * 1.5, height: size * 1.5, borderRadius: size }, haloStyle]}
      >
        <LinearGradient colors={[gradient[1] as string, 'transparent']} style={{ flex: 1, borderRadius: size }} />
      </Animated.View>
      {/* core */}
      <Animated.View style={coreStyle}>
        <View style={[styles.core, { width: size, height: size, borderRadius: size / 2 }]}>
          <LinearGradient
            colors={gradient as any}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={[fill, { borderRadius: size / 2 }]}
          />
          {/* rotating sheen */}
          <Animated.View style={[fill, spinStyle]} pointerEvents="none">
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'transparent', 'transparent', 'rgba(255,255,255,0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[fill, { borderRadius: size / 2 }]}
            />
          </Animated.View>

          {image ? (
            <View style={[styles.imageClip, { width: size, height: size, borderRadius: size / 2 }]}>
              <Image source={image} style={styles.image} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'transparent', 'rgba(0,0,0,0.4)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.imageRing, { borderRadius: size / 2 }]} />
            </View>
          ) : (
            <>
              <View style={styles.innerGlow} />
              <Text style={[styles.glyph, { fontSize: size * 0.4 }]}>{glyph}</Text>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 2 },
  halo: { position: 'absolute' },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.saffron,
    shadowOpacity: 0.7,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  imageClip: { overflow: 'hidden' },
  imageRing: { ...fill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  image: { width: '100%', height: '100%' },
  innerGlow: {
    position: 'absolute',
    top: '14%',
    left: '18%',
    width: '34%',
    height: '34%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  glyph: {
    color: '#3A1205',
    fontFamily: fonts.display,
    fontWeight: '700',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowRadius: 8,
  },
});
