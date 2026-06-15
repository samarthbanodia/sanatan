// Sanatan — Opal-grade devotional design system.
// Mood: a near-black sanctuary where warm light (saffron/gold) appears only as a
// sacred "moment" — the orb, an active state, a milestone — never as wallpaper.
// Inspired by Opal (opal.so): pure-black canvas, white/gray type with tight tracking,
// restraint over decoration, premium assets floating on black.

// Absolute-fill style (RN 0.85 types omit StyleSheet.absoluteFillObject).
// `as const` keeps it assignable to both ViewStyle and ImageStyle.
export const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

export const colors = {
  // Base canvas — near-black, neutral (Opal foundation), faint warm lift on raised surfaces.
  bg0: '#000000',
  bg1: '#0A0A0C',
  bg2: '#121214',
  bg3: '#1C1C1F',

  // Warm divine accents — reserved for "moments" (orb, active, progress, milestone).
  saffron: '#FF7A1A',
  marigold: '#FFB347',
  gold: '#F6C84C',
  flame: '#FF5E3A',
  lotus: '#F4789E',
  amber: '#FFD89B',
  violet: '#A24BCE',

  // Text (matches Opal: pure white, #BCBBC0 gray, 50% ambient).
  textHi: '#FFFFFF',
  textMid: '#BCBBC0',
  textLow: 'rgba(255, 255, 255, 0.5)',

  // Surfaces — hairline-bordered near-black panels, not frosted glass.
  glass: 'rgba(255, 255, 255, 0.04)',
  glassStrong: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassBorderSoft: 'rgba(255, 255, 255, 0.06)',

  // Glows (used only around the orb / accent moments).
  glowSaffron: 'rgba(255, 122, 26, 0.45)',
  glowGold: 'rgba(246, 200, 76, 0.4)',
  glowLotus: 'rgba(244, 120, 158, 0.4)',
} as const;

// Linear-gradient color stops (use with expo-linear-gradient).
export const gradients = {
  // Canvas is essentially black with the faintest warm lift at the very top.
  screen: ['#0A0807', '#030303', '#000000'] as const,
  twilight: ['#1C1C1F', '#0A0A0C'] as const,
  // Warm accent moments.
  flame: ['#FFD89B', '#FF7A1A', '#FF5E3A'] as const,
  divine: ['#F6C84C', '#FF7A1A'] as const,
  dawn: ['#FFB347', '#F4789E'] as const,
  lotus: ['#F4789E', '#A24BCE'] as const,
  orb: ['#FFF0C4', '#FFB347', '#FF6A2B'] as const,
  card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] as const,
  // Opal-style pastel duotones — for rare milestone/celebration surfaces only.
  moment1: ['#ECB8FF', '#FFD6AA'] as const,
  moment2: ['#E2C9FF', '#8CFFDD'] as const,
  moment3: ['#A9CBFF', '#B39AFF'] as const,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

// 4px spacing scale.
export const sp = (n: number) => n * 4;

export const fonts = {
  // Editorial high-contrast serif (Fraunces) for sacred display: deity names, mantras, ॥ श्री ॥.
  // Opal-grade: confident, luxe, high stroke contrast.
  display: 'Fraunces_600SemiBold',
  displayLight: 'Fraunces_300Light',
  displayItalic: 'Fraunces_400Regular_Italic',
  displayBold: 'Fraunces_700Bold',
  // Body/UI — Hanken Grotesk: clean, warm, modern grotesk with more character than Inter.
  body: 'HankenGrotesk_400Regular',
  bodyMed: 'HankenGrotesk_500Medium',
  bodySemi: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
} as const;

// Type scale — tight negative tracking on display/headlines (Opal's −0.04em ≈ −1.2px @30),
// positive tracking on small uppercase labels, near-neutral on body.
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 54, lineHeight: 56, letterSpacing: -1.4, color: colors.textHi },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.8, color: colors.textHi },
  titleSans: { fontFamily: fonts.bodyBold, fontSize: 26, lineHeight: 31, letterSpacing: -0.7, color: colors.textHi },
  section: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 2, color: colors.textLow },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 17, letterSpacing: -0.2, color: colors.textHi },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, letterSpacing: -0.1, color: colors.textMid },
  label: { fontFamily: fonts.bodyMed, fontSize: 13, letterSpacing: -0.1, color: colors.textMid },
  caption: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 0, color: colors.textLow },
} as const;

export const shadow = {
  // Soft warm halo — only for the orb / accent moments.
  glow: (color: string = colors.glowSaffron) => ({
    shadowColor: color,
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  }),
  // Neutral depth for raised cards on black.
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;
