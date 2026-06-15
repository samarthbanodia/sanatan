import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { chatRouter } from './routes/chat.js';
import { voiceRouter } from './routes/voice.js';
import { sarvamRouter } from './routes/sarvam.js';
import { livekitRouter } from './routes/livekit.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    services: {
      anthropic: Boolean(config.anthropicApiKey),
      sarvam: Boolean(config.sarvamApiKey),
      livekit: Boolean(config.livekit.apiKey && config.livekit.apiSecret),
    },
  });
});

app.use(chatRouter);
app.use(voiceRouter);
app.use(sarvamRouter);
app.use(livekitRouter);

app.listen(config.port, () => {
  console.log(`[sanatan-server] listening on :${config.port}`);
});
