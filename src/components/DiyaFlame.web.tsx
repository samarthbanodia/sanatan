import React from 'react';
import { Text, View } from 'react-native';

// Web has no CanvasKit — render a lightweight diya so the layout holds and the
// browser preview shows the lit/unlit state. The real Skia flame is native-only.
export default function DiyaFlame({ size = 72, lit = false }: { size?: number; lit?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size * 1.5,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size * 0.8,
          opacity: lit ? 1 : 0.4,
          textShadowColor: lit ? 'rgba(246,200,76,0.9)' : 'transparent',
          textShadowRadius: lit ? 18 : 0,
        }}
      >
        🪔
      </Text>
    </View>
  );
}
