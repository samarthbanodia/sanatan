import { Router } from 'express';
import { config, SARVAM_BASE } from '../config.js';

export const sarvamRouter = Router();

// POST /sarvam/translate  → { input, source_language_code, target_language_code }
sarvamRouter.post('/sarvam/translate', async (req, res) => {
  try {
    const r = await fetch(`${SARVAM_BASE}/translate`, {
      method: 'POST',
      headers: { 'api-subscription-key': config.sarvamApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sarvam-translate:v1', ...req.body }),
    });
    res.status(r.status).json(await r.json());
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? 'translate failed' });
  }
});

// POST /sarvam/tts  → { text, target_language_code, speaker? }
// Returns Sarvam's JSON ({ audios: [base64 wav] }).
sarvamRouter.post('/sarvam/tts', async (req, res) => {
  try {
    const r = await fetch(`${SARVAM_BASE}/text-to-speech`, {
      method: 'POST',
      headers: { 'api-subscription-key': config.sarvamApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'bulbul:v2', speaker: 'anushka', ...req.body }),
    });
    res.status(r.status).json(await r.json());
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? 'tts failed' });
  }
});
