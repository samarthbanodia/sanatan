import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 8787),
  sarvamApiKey: process.env.SARVAM_API_KEY ?? '',
  // ANTHROPIC_API_KEY is read directly by the Anthropic SDK from env.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  livekit: {
    url: process.env.LIVEKIT_URL ?? '',
    apiKey: process.env.LIVEKIT_API_KEY ?? '',
    apiSecret: process.env.LIVEKIT_API_SECRET ?? '',
  },
};

export const SARVAM_BASE = 'https://api.sarvam.ai';
