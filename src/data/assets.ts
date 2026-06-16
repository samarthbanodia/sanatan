// Static asset map. React Native requires literal require() paths,
// so generated media is registered here and referenced by key.
// Deity art is optimized JPEG (resized to ~1280px, q85) for fast load + low memory.

export const deityImages: Record<string, any> = {
  ganesha: require('../../assets/deities/ganesha.jpg'),
  krishna: require('../../assets/deities/krishna.jpg'),
  shiva: require('../../assets/deities/shiva.jpg'),
  durga: require('../../assets/deities/durga.jpg'),
  hanuman: require('../../assets/deities/hanuman.jpg'),
  lakshmi: require('../../assets/deities/lakshmi.jpg'),
};

export const bgSanctuary = require('../../assets/bg/sanctuary.jpg');
export const ambientAudio = require('../../assets/audio/ambient.m4a');

export const deityImage = (deityId: string) => deityImages[deityId];

// Bundled track audio, keyed by the audio variant's ledgerId. Used for local testing
// before tracks are hosted on a CDN — the player prefers a local asset, then the
// remote `url`. Once a track is on R2, drop its entry here and fill `audio[].url`.
export const audioAssets: Record<string, any> = {
  'lic-ai-gayatri-majestic': require('../../assets/audio/gayatri-majestic.mp3'),
  'lic-ai-gayatri-basic': require('../../assets/audio/gayatri-basic.mp3'),
  'lic-ai-ganapati-majestic': require('../../assets/audio/ganapati-majestic.mp3'),
  'lic-ai-ganapati-basic': require('../../assets/audio/ganapati-basic.mp3'),
  'lic-ai-vasudeva-majestic': require('../../assets/audio/vasudeva-majestic.mp3'),
  'lic-ai-vasudeva-basic': require('../../assets/audio/vasudeva-basic.mp3'),
};

export const audioAsset = (ledgerId?: string) => (ledgerId ? audioAssets[ledgerId] : undefined);
