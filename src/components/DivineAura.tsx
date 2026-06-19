import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Fill,
  FractalNoise,
  Group,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/theme';

// A living divine aura, rendered on the GPU with Skia.
//  • A warm radial bloom that slowly breathes behind the deity — the only light
//    in the room (Opal restraint), tinted to the featured deity.
//  • Fine film grain over the canvas to kill the banding that flat dark gradients
//    show on phone OLEDs — the premium texture RN views can't produce.
// Web has no CanvasKit wired up, so `DivineAura.web.tsx` no-ops and the
// LinearGradient hero stands in there instead.

function rgba(color: string, a: number) {
  if (!color.startsWith('#')) return color;
  const h = color.slice(1);
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export default function DivineAura({
  height,
  color = colors.saffron,
  cyRatio = 0.36,
  intensity = 1,
}: {
  /** Height of the aura layer in px (usually the hero height). */
  height: number;
  /** Bloom hue — pass the featured deity's accent for a cohesive halo. */
  color?: string;
  /** Vertical center of the bloom, 0 = top … 1 = bottom. */
  cyRatio?: number;
  /** Overall opacity multiplier. */
  intensity?: number;
}) {
  const { width } = useWindowDimensions();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [t]);

  // Breathing: the bloom swells and brightens, then recedes — ~18s cycle.
  const bloomOpacity = useDerivedValue(() => (0.5 + 0.32 * t.value) * intensity);
  const bloomTransform = useDerivedValue(() => [{ scale: 1 + 0.1 * t.value }]);

  const cx = width / 2;
  const cy = height * cyRatio;
  const r = Math.max(width, height) * 0.62;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {/* breathing radial bloom — divine light behind the portrait */}
      <Group origin={vec(cx, cy)} transform={bloomTransform} opacity={bloomOpacity}>
        <Circle cx={cx} cy={cy} r={r}>
          <RadialGradient
            c={vec(cx, cy)}
            r={r}
            colors={[rgba(color, 0.8), rgba(color, 0.18), 'transparent']}
            positions={[0, 0.5, 1]}
          />
        </Circle>
      </Group>

      {/* fine film grain — soft-light blend keeps it as texture, not noise */}
      <Group opacity={0.05} blendMode="softLight">
        <Fill>
          <FractalNoise freqX={0.9} freqY={0.9} octaves={3} seed={7} />
        </Fill>
      </Group>
    </Canvas>
  );
}
