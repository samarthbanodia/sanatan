import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fill, gradients } from '../theme/theme';
import { bgSanctuary } from '../data/assets';
import FilmGrain from './FilmGrain';

// A near-black sanctuary canvas. A single faint warm glow breathes slowly near the top —
// the only light in the room. Restraint over decoration (Opal-style).
// Pass `sanctuary` to layer the crushed temple-ghat backdrop behind the glow.
export default function ScreenBackground({
  children,
  style,
  sanctuary = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  sanctuary?: boolean;
}) {
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathe]);

  const glow = {
    transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
    opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.32] }),
  };

  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      {sanctuary && (
        <>
          <Image source={bgSanctuary} style={styles.sanctuary} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)', '#000000']}
            style={fill}
          />
        </>
      )}
      <Animated.View style={[styles.glow, glow]}>
        <LinearGradient colors={[colors.saffron, 'transparent']} style={styles.glowFill} />
      </Animated.View>
      {/* App-wide film grain — over the canvas, under content (keeps text crisp) */}
      <FilmGrain />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
  sanctuary: { ...fill, opacity: 0.32 },
  glow: { position: 'absolute', top: -180, alignSelf: 'center', width: 460, height: 460 },
  glowFill: { flex: 1, borderRadius: 999 },
});
