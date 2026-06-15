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
