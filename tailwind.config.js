// Tailwind tokens mirror src/theme/theme.ts — theme.ts stays the single source of truth.
// Keep these in sync if theme.ts tokens change.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg0: '#000000',
        bg1: '#0A0A0C',
        bg2: '#121214',
        bg3: '#1C1C1F',
        saffron: '#FF7A1A',
        marigold: '#FFB347',
        gold: '#F6C84C',
        flame: '#FF5E3A',
        lotus: '#F4789E',
        amber: '#FFD89B',
        violet: '#A24BCE',
        textHi: '#FFFFFF',
        textMid: '#BCBBC0',
        textLow: 'rgba(255,255,255,0.5)',
        glass: 'rgba(255,255,255,0.04)',
        glassStrong: 'rgba(255,255,255,0.08)',
        glassBorder: 'rgba(255,255,255,0.10)',
        glassBorderSoft: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        display: ['Fraunces_600SemiBold'],
        displayLight: ['Fraunces_300Light'],
        displayItalic: ['Fraunces_400Regular_Italic'],
        displayBold: ['Fraunces_700Bold'],
        body: ['HankenGrotesk_400Regular'],
        bodyMed: ['HankenGrotesk_500Medium'],
        bodySemi: ['HankenGrotesk_600SemiBold'],
        bodyBold: ['HankenGrotesk_700Bold'],
      },
      borderRadius: {
        sm: '12px',
        md: '18px',
        lg: '24px',
        xl: '32px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
