import { useCallback, useRef, useState } from 'react';
import { API_BASE } from '../config/api';

// Text chat with the Sanatan Guide (server /guide — neutral knowledge assistant)
// plus a structured pooja planner (/guide/plan). Mirrors useChatSession's shape so
// the screen UI is familiar, but the guide is not a deity persona.

export type GuideLanguage = 'hi' | 'en' | 'ta' | 'te' | 'bn' | 'mr';

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

export type GuideTurn = { id: string; role: 'user' | 'guide'; text?: string; plan?: PoojaPlan };
export type GuideState = 'idle' | 'thinking';

const WELCOME =
  'Namaste 🙏 I am your Sanatan guide. Ask me about any festival, deity, mantra, or pooja — its meaning or how to perform it — or ask me to plan a pooja and I will lay out the steps in order.';

export function useGuideSession(language: GuideLanguage = 'en') {
  const [turns, setTurns] = useState<GuideTurn[]>([{ id: 'welcome', role: 'guide', text: WELCOME }]);
  const [state, setState] = useState<GuideState>('idle');
  const counter = useRef(0);

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || state === 'thinking') return;
      const n = counter.current++;
      const history = [...turns, { id: `u${n}`, role: 'user' as const, text }];
      setTurns(history);
      setState('thinking');
      try {
        const messages = history
          .filter((t) => t.id !== 'welcome' && typeof t.text === 'string')
          .map((t) => ({ role: t.role === 'guide' ? 'assistant' : 'user', content: t.text! }));
        const res = await fetch(`${API_BASE}/guide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, messages }),
        });
        const data = await res.json();
        const reply = typeof data?.text === 'string' && data.text ? data.text : '…';
        setTurns((t) => [...t, { id: `g${n}`, role: 'guide', text: reply }]);
      } catch {
        setTurns((t) => [
          ...t,
          { id: `e${n}`, role: 'guide', text: 'I could not reach the library just now — please try again in a moment.' },
        ]);
      } finally {
        setState('idle');
      }
    },
    [turns, state, language],
  );

  const requestPlan = useCallback(
    async (query: string, opts?: { occasion?: string; deity?: string }) => {
      if (state === 'thinking') return;
      const n = counter.current++;
      setTurns((t) => [...t, { id: `pu${n}`, role: 'user', text: query }]);
      setState('thinking');
      try {
        const res = await fetch(`${API_BASE}/guide/plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, query, ...opts }),
        });
        const data = await res.json();
        if (data?.plan) setTurns((t) => [...t, { id: `pg${n}`, role: 'guide', plan: data.plan }]);
        else
          setTurns((t) => [
            ...t,
            { id: `pe${n}`, role: 'guide', text: 'I could not assemble that plan — please try rephrasing.' },
          ]);
      } catch {
        setTurns((t) => [
          ...t,
          { id: `pe${n}`, role: 'guide', text: 'I could not assemble that plan just now — please try again.' },
        ]);
      } finally {
        setState('idle');
      }
    },
    [state, language],
  );

  return { turns, state, sendText, requestPlan };
}
