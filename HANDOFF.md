# Sanatan — Handoff

Commercial Hindu devotional app (Expo/RN). Two product pillars: a **content library** (aartis/
bhajans/prayers/mantras for any pooja) and **1-on-1 deity voice + chat agents**. UI/UX is a top
priority (Opal-inspired). Full approved roadmap lives in the planning file referenced by the team.

## ⚠️ First, rotate keys
Sarvam, LiveKit, and Anthropic keys were shared during development and **must be rotated**. They are
**not** in this repo (verified) — they belong only in **Render env vars** or a local git-ignored
`server/.env` (copy from `server/.env.example`).

## What's built
- **Premium UI**: Fraunces + Hanken Grotesk fonts, Reanimated 4 motion primitives, NativeWind v4,
  cohesive optimized deity art (`assets/deities/*.jpg`). Onboarding + personalization (`src/screens/
  OnboardingScreen.tsx`, `src/state/preferences.tsx`).
- **Content catalog foundation**: `src/data/{taxonomy,licensing,pujaFlows}.ts`; `Track` extended
  additively in `src/data/content.ts`. Licensing ledger is mandatory (nothing ships without a row).
- **Backend `server/`** (Express + TS, Render-ready) — verified end-to-end:
  - `/chat` (SSE) — deity persona on **Anthropic `claude-haiku-4-5`**, multilingual, with safety
    guardrails (`server/src/personas.ts`).
  - `/sarvam/translate`, `/sarvam/tts`, `/livekit/token`, `/health`.
  - **Architecture decision:** Haiku = deity brain; **Sarvam = STT/TTS/translate only** (`sarvam-30b`
    is a reasoning model, too slow for realtime voice).

## Run it
**App (web preview):** `npm run web` → http://localhost:8081. Verify: `npx tsc --noEmit` +
`npx expo export --platform web`. Device: build an EAS dev client (`eas.json` present) and `expo start
--dev-client`; for a quick device look, `npx expo start --go --tunnel` + Expo Go.

**Backend:** `cd server && npm install`, create `server/.env` from `.env.example` (rotated keys), then
`npm run dev`. Smoke test: `curl localhost:8787/health`.

## Next steps (in order)
1. **Deploy backend to Render** (free) — connect repo, set the 5 env vars from `.env.example`.
2. **App chat transport** — replace the mock in `src/voice/useVoiceSession.ts` with a real transport
   that streams from `POST /chat`; add a voice/chat toggle + language selector in `ConversationScreen`.
   (No spend; works today.)
3. **Voice agent worker** — a LiveKit room worker running STT(Sarvam)→Haiku→TTS(Sarvam); app joins via
   `/livekit/token`. Per-deity TTS voices.
4. **Audio acquisition** — needs Suno Pro (free tier has no commercial rights). Royalty-free (Hoopr/
   Pixabay) + AI; record every asset in the licensing ledger; host on a CDN.
5. **6-language sacred text** — draft with an LLM, then **expert-verify** before marking `verified`.
6. **Flow** — daily ritual loop (diya streak), japa counter, profile/journey.

## Gotchas
- Reanimated `entering` animations break on react-native-web (content goes `position:absolute`
  off-screen) — `FadeIn` uses plain `useAnimatedStyle`. Don't reintroduce `entering`.
- Fonts are defined in 3 places (App.tsx `useFonts`, `theme.ts`, `tailwind.config.js`) — keep in sync.
- `babel-preset-expo` is an explicit dep; the Reanimated worklets plugin is auto-configured — don't add
  it manually. NativeWind v4 requires tailwindcss **v3**.
- Sarvam TTS: send Indic text as a UTF-8 request body; models `bulbul:v2`/`anushka`, `saarika:v2.5`,
  `sarvam-translate:v1`; header `api-subscription-key`.
- Root `tsconfig.json` excludes `server/` (separate deps/tsconfig).
