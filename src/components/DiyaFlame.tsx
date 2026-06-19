import React, { useEffect } from 'react';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  useClock,
  vec,
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// A living diya flame, rendered on the GPU with Skia. Shapes live in a 120×180
// design box and scale to `size`. The flame flickers and sways continuously
// (clock-driven, UI thread); lighting it springs the flame up from the wick.
// Web has no CanvasKit, so DiyaFlame.web.tsx renders a lightweight fallback.

const BOX_W = 120;
const BOX_H = 180;

// Flame body + bright inner core (tip at top, base at the wick ~y=98).
const FLAME = 'M60 8 C 78 48 96 74 84 104 C 77 122 43 122 36 104 C 24 74 42 48 60 8 Z';
const CORE = 'M60 40 C 70 62 80 80 73 100 C 68 112 52 112 47 100 C 40 80 50 62 60 40 Z';
// Brass diya bowl beneath the flame.
const BOWL = 'M14 104 C 22 142 98 142 106 104 C 92 122 28 122 14 104 Z';

export default function DiyaFlame({ size = 72, lit = false }: { size?: number; lit?: boolean }) {
  const clock = useClock();
  const ignite = useSharedValue(lit ? 1 : 0);

  useEffect(() => {
    ignite.value = lit
      ? withSpring(1, { damping: 9, stiffness: 150, mass: 0.6 })
      : withTiming(0, { duration: 280 });
  }, [lit, ignite]);

  // Flicker: gentle sway + asymmetric breathing, all scaled by how lit we are.
  const flameTransform = useDerivedValue(() => {
    const t = clock.value / 1000;
    const ig = ignite.value;
    const sway = (Math.sin(t * 6) * 1.6 + Math.sin(t * 10.5) * 0.9) * ig;
    const sx = 1 + Math.cos(t * 7) * 0.03;
    const sy = 0.55 + 0.45 * ig + (Math.sin(t * 9) * 0.05 + Math.sin(t * 15) * 0.03) * ig;
    return [{ translateX: sway }, { scaleX: sx }, { scaleY: sy }];
  });
  const flameOpacity = useDerivedValue(() => ignite.value);
  const glowOpacity = useDerivedValue(
    () => (0.5 + Math.sin(clock.value / 1000 * 12) * 0.12 + Math.sin(clock.value / 1000 * 5) * 0.07) * ignite.value,
  );

  const scale = size / BOX_W;
  const wick = vec(60, 98);

  return (
    <Canvas style={{ width: size, height: size * (BOX_H / BOX_W) }} pointerEvents="none">
      <Group transform={[{ scale }]}>
        {/* warm bloom behind the flame */}
        <Group opacity={glowOpacity}>
          <Circle cx={60} cy={66} r={64}>
            <RadialGradient
              c={vec(60, 66)}
              r={64}
              colors={['rgba(246,200,76,0.65)', 'rgba(255,122,26,0.18)', 'transparent']}
              positions={[0, 0.5, 1]}
            />
          </Circle>
        </Group>

        {/* brass bowl */}
        <Path path={BOWL}>
          <LinearGradient start={vec(60, 100)} end={vec(60, 142)} colors={['#C98A3C', '#6E3F18', '#2E1B0C']} />
        </Path>

        {/* flame — grows up from the wick */}
        <Group origin={wick} transform={flameTransform} opacity={flameOpacity}>
          <Path path={FLAME}>
            <LinearGradient
              start={vec(60, 104)}
              end={vec(60, 8)}
              colors={['#FFF7D6', '#FFE08A', '#FF9D3A', 'rgba(255,70,40,0)']}
              positions={[0, 0.35, 0.75, 1]}
            />
          </Path>
          <Path path={CORE}>
            <LinearGradient
              start={vec(60, 100)}
              end={vec(60, 40)}
              colors={['#FFFFFF', '#FFEFB0', 'rgba(255,200,120,0)']}
              positions={[0, 0.5, 1]}
            />
          </Path>
        </Group>
      </Group>
    </Canvas>
  );
}
