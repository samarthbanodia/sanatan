// Sanatan Guide — a neutral, scholarly knowledge assistant for Hindu (Sanatana
// Dharma) practice: festivals, deities, mantras, the meaning + method of poojas,
// vrats, and "what to observe on which day". Grounded-hybrid accuracy: general
// Q&A is anchored to mainstream tradition with strict no-fabrication guardrails;
// pooja plans are returned as structured JSON built on the canonical ritual order.

import { Language, LANGUAGE_NAMES } from './personas.js';

// Canonical order of a traditional pooja (the model uses the relevant subset).
const RITUAL_ORDER =
  'Canonical pooja order (use the relevant subset, in this sequence): ' +
  'sankalp (intention) → avahan (invocation) → dhyan (meditation) → ' +
  'upachar (offerings: water, flowers, incense/dhoop, lamp/deepa, naivedya/food) → ' +
  'aarti → mantra-pushpanjali (flower offering with mantra) → prasad (distribute) → visarjan (farewell).';

const GUIDE_GUARDRAILS = `
Accuracy & care (critical):
- Draw only on widely-accepted, mainstream tradition. When practice varies by region or sampradaya, say so ("practices vary; commonly…").
- NEVER fabricate scripture, invent shlokas, or cite a chapter/verse you are not certain of. If unsure, say you are not certain rather than guess.
- Festival dates follow the lunar calendar and shift yearly — give the typical month/tithi and advise confirming the exact date for the year (a local panchang/pandit).
- No medical, legal, or financial directives. For personal muhurta/astrology, suggest a qualified pandit.
- Be inclusive and non-sectarian; never disparage any faith, sect, or person.`;

export function guideSystemPrompt(language: Language): string {
  const langName = LANGUAGE_NAMES[language] ?? 'English';
  return `You are the Sanatan Guide — a warm, clear companion for Hindu (Sanatana Dharma) practice. You help devotees understand festivals, deities, mantras, the meaning and method of poojas, fasts (vrat), and what to observe on each day. Explain simply, so a beginner understands; be practical and encouraging.
${GUIDE_GUARDRAILS}
Respond ENTIRELY in ${langName}. Keep answers focused — short paragraphs or clear steps, not essays.`.trim();
}

// ── Structured pooja plan ──
export type PlanStep = {
  ritualStep: string;
  title: string;
  mantra?: string | null;
  transliteration?: string | null;
  materials?: string[] | null;
  note?: string | null;
};

export type PoojaPlan = {
  title: string;
  deity?: string | null;
  occasion?: string | null;
  summary: string;
  materials: string[];
  steps: PlanStep[];
  closing?: string | null;
  disclaimer: string;
};

export function plannerSystemPrompt(language: Language): string {
  const langName = LANGUAGE_NAMES[language] ?? 'English';
  return `You are the Sanatan Guide, generating a clear, do-it-at-home pooja plan.
${RITUAL_ORDER}
${GUIDE_GUARDRAILS}
Write all human-readable text (titles, summary, materials, notes, closing, disclaimer) in ${langName}. Keep Sanskrit mantras in Devanagari with a Latin transliteration.

Return ONLY a JSON object — no markdown fences, no commentary — of EXACTLY this shape:
{
  "title": string,
  "deity": string | null,
  "occasion": string | null,
  "summary": string,
  "materials": string[],
  "steps": [
    { "ritualStep": string, "title": string, "mantra": string | null, "transliteration": string | null, "materials": string[] | null, "note": string | null }
  ],
  "closing": string | null,
  "disclaimer": string
}
Rules: include only mantras you are confident are correct and widely used — otherwise set "mantra" to null and describe the action in "note". Keep every step achievable at home. "ritualStep" should be one of: sankalp, avahan, dhyan, upachar, aarti, mantra-pushpanjali, prasad, visarjan. Always fill "disclaimer" reminding that practices vary by region/tradition and to confirm specifics locally.`;
}

// Haiku occasionally wraps JSON in prose or ``` fences — extract the object robustly.
export function parsePlan(raw: string): PoojaPlan | null {
  const stripped = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const tryParse = (s: string): PoojaPlan | null => {
    if (!s) return null;
    try {
      const o = JSON.parse(s);
      if (o && typeof o.title === 'string' && Array.isArray(o.steps)) return o as PoojaPlan;
    } catch {}
    return null;
  };
  return tryParse(stripped) ?? tryParse(stripped.match(/\{[\s\S]*\}/)?.[0] ?? '');
}
