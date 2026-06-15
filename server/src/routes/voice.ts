import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { config, SARVAM_BASE } from '../config.js';
import { isDeityId, isLanguage, systemPrompt, DeityId, Language } from '../personas.js';

const anthropic = new Anthropic();
export const voiceRouter = Router();

type InMsg = { role: 'user' | 'assistant'; content: string };

// POST /voice — one push-to-talk turn (no LiveKit, no realtime transport).
// Body: { deityId, language, audioBase64 (wav/mp3 bytes, base64), messages?: prior turns }
// Returns: { transcript, replyText, replyAudio (base64 wav) }
//   1) Sarvam STT  2) Anthropic Haiku persona  3) Sarvam TTS
voiceRouter.post('/voice', async (req, res) => {
  const { deityId, language = 'en', audioBase64, messages = [] } = req.body ?? {};
  if (!isDeityId(deityId)) return res.status(400).json({ error: 'invalid deityId' });
  if (!isLanguage(language)) return res.status(400).json({ error: 'invalid language' });
  if (typeof audioBase64 !== 'string' || !audioBase64) return res.status(400).json({ error: 'audioBase64 required' });

  const langCode = `${language}-IN`;
  try {
    // 1) Speech-to-text
    const audioBuf = Buffer.from(audioBase64, 'base64');
    const form = new FormData();
    form.append('model', 'saarika:v2.5');
    form.append('language_code', langCode);
    form.append('file', new Blob([audioBuf], { type: 'audio/wav' }), 'speech.wav');
    const sttRes = await fetch(`${SARVAM_BASE}/speech-to-text`, {
      method: 'POST',
      headers: { 'api-subscription-key': config.sarvamApiKey },
      body: form,
    });
    const stt: any = await sttRes.json();
    const transcript: string = stt?.transcript ?? '';
    if (!transcript) return res.status(502).json({ error: 'no transcript', detail: stt });

    // 2) Deity reply (Haiku persona)
    const history: InMsg[] = [
      ...(Array.isArray(messages) ? messages : []).filter(
        (m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string'
      ),
      { role: 'user', content: transcript },
    ];
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: systemPrompt(deityId as DeityId, language as Language),
      messages: history,
    });
    const replyText =
      msg.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('') || '…';

    // 3) Text-to-speech (deity voice)
    const ttsRes = await fetch(`${SARVAM_BASE}/text-to-speech`, {
      method: 'POST',
      headers: { 'api-subscription-key': config.sarvamApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: replyText, target_language_code: langCode, model: 'bulbul:v2', speaker: 'anushka' }),
    });
    const tts: any = await ttsRes.json();
    const replyAudio: string | null = Array.isArray(tts?.audios) ? tts.audios[0] : null;

    res.json({ transcript, replyText, replyAudio });
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? 'voice failed' });
  }
});
