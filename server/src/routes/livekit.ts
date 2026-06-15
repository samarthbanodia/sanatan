import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { config } from '../config.js';

export const livekitRouter = Router();

// POST /livekit/token  → { identity, room }
// Mints a short-lived join token so the app can connect to the LiveKit room
// where the voice agent runs. Keys stay server-side.
livekitRouter.post('/livekit/token', async (req, res) => {
  const { identity, room } = req.body ?? {};
  if (!identity || !room) return res.status(400).json({ error: 'identity and room required' });
  if (!config.livekit.apiKey || !config.livekit.apiSecret)
    return res.status(500).json({ error: 'LiveKit not configured' });

  try {
    const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
      identity: String(identity),
      ttl: '15m',
    });
    at.addGrant({ roomJoin: true, room: String(room), canPublish: true, canSubscribe: true });
    res.json({ token: await at.toJwt(), url: config.livekit.url });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'token failed' });
  }
});
