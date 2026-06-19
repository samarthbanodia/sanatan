import React from 'react';

// Web has no CanvasKit wired up — the Skia aura no-ops here so `expo export
// --platform web` keeps building and the LinearGradient hero stands in.
export default function DivineAura(_props: {
  height: number;
  color?: string;
  cyRatio?: number;
  intensity?: number;
}) {
  return null;
}
