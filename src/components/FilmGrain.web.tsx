import React from 'react';

// Web has no CanvasKit wired up — film grain no-ops here so `expo export
// --platform web` keeps building.
export default function FilmGrain(_props: { opacity?: number }) {
  return null;
}
