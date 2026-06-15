import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { isDeityId, isLanguage, systemPrompt } from '../personas.js';

// Anthropic client reads ANTHROPIC_API_KEY from env automatically.
const anthropic = new Anthropic();

export const chatRouter = Router();

type InMsg = { role: 'user' | 'assistant'; content: string };

// POST /chat  → Server-Sent Events stream of the deity's reply.
// Body: { deityId, language, messages: [{role, content}] }
chatRouter.post('/chat', async (req, res) => {
  const { deityId, language = 'en', messages } = req.body ?? {};

  if (!isDeityId(deityId)) return res.status(400).json({ error: 'invalid deityId' });
  if (!isLanguage(language)) return res.status(400).json({ error: 'invalid language' });
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages required' });

  const cleaned: InMsg[] = messages
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .map((m: any) => ({ role: m.role, content: m.content }));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: systemPrompt(deityId, language),
      messages: cleaned,
    });

    stream.on('text', (delta: string) => {
      res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
    });

    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    // If we haven't sent the SSE headers' body yet, this still surfaces as an event.
    res.write(`data: ${JSON.stringify({ error: err?.message ?? 'chat failed' })}\n\n`);
    res.end();
  }
});
