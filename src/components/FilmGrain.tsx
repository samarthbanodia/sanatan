import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Fill, FractalNoise, Group } from '@shopify/react-native-skia';

// App-wide fine film grain, rendered on the GPU with Skia. Sits over the
// near-black canvas to kill the banding that flat dark gradients show on OLED —
// the premium texture RN views can't produce. Soft-light blend keeps it as a
// faint texture rather than visible noise. Web no-ops (no CanvasKit) via
// FilmGrain.web.tsx so `expo export --platform web` keeps building.
export default function FilmGrain({ opacity = 0.045 }: { opacity?: number }) {
  const { width, height } = useWindowDimensions();
  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group opacity={opacity} blendMode="softLight">
        <Fill>
          <FractalNoise freqX={0.9} freqY={0.9} octaves={3} seed={7} />
        </Fill>
      </Group>
    </Canvas>
  );
}
