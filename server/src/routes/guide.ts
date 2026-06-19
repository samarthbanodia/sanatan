import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { isLanguage } from '../personas.js';
import { guideSystemPrompt, plannerSystemPrompt, parsePlan } from '../guide.js';

// Anthropic client reads ANTHROPIC_API_KEY from env automatically.
const anthropic = new Anthropic();

export const guideRouter = Router();

type InMsg = { role: 'user' | 'assistant'; content: string };

const collectText = (msg: Anthropic.Message) =>
  msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

// POST /guide → general religious / pooja Q&A.
// Body: { language, messages: [{role, content}] }. Non-streaming JSON (RN can't read SSE).
guideRouter.post('/guide', async (req, res) => {
  const { language = 'en', messages } = req.body ?? {};

  if (!isLanguage(language)) return res.status(400).json({ error: 'invalid language' });
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages required' });

  const cleaned: InMsg[] = messages
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .map((m: any) => ({ role: m.role, content: m.content }));

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: guideSystemPrompt(language),
      messages: cleaned,
    });
    return res.json({ text: collectText(msg) });
  } catch (err: any) {
    return res.status(502).json({ error: err?.message ?? 'guide failed' });
  }
});

// POST /guide/plan → a structured, ordered pooja plan (JSON).
// Body: { language, query, occasion?, deity? }
guideRouter.post('/guide/plan', async (req, res) => {
  const { language = 'en', query, occasion, deity } = req.body ?? {};

  if (!isLanguage(language)) return res.status(400).json({ error: 'invalid language' });
  if (typeof query !== 'string' || !query.trim())
    return res.status(400).json({ error: 'query required' });

  const ask =
    `Create a pooja plan for: ${query.trim()}.` +
    (occasion ? ` Occasion: ${occasion}.` : '') +
    (deity ? ` Deity: ${deity}.` : '');

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      // A full plan (8 ritual steps + Devanagari mantras + transliterations) is
      // token-dense; 1400 truncated the JSON mid-output → parse failure. 4096
      // leaves comfortable headroom for any home-pooja plan.
      max_tokens: 4096,
      system: plannerSystemPrompt(language),
      messages: [{ role: 'user', content: ask }],
    });
    // If the model still hit the cap, the JSON is truncated — say so clearly
    // rather than the generic "try again".
    if (msg.stop_reason === 'max_tokens')
      return res.status(502).json({ error: 'plan was too long to complete — please narrow the request' });
    const plan = parsePlan(collectText(msg));
    if (!plan) return res.status(502).json({ error: 'could not build a plan — please try again' });
    return res.json({ plan });
  } catch (err: any) {
    return res.status(502).json({ error: err?.message ?? 'plan failed' });
  }
});
