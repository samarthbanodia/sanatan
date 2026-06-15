import { useCallback, useRef, useState } from 'react';
import { Deity } from '../data/content';
import { API_BASE } from '../config/api';

// Real text chat with a deity, backed by the server's /chat (Anthropic Haiku persona).
// Shares the Turn shape with the (mocked) voice session so the UI is interchangeable.

export type Turn = { id: string; role: 'devotee' | 'deity'; text: string };
export type ChatState = 'idle' | 'thinking';
export type ChatLanguage = 'hi' | 'en' | 'ta' | 'te' | 'bn' | 'mr';

export function useChatSession(deity: Deity, language: ChatLanguage = 'en') {
  const [turns, setTurns] = useState<Turn[]>([
    { id: 'greeting', role: 'deity', text: deity.greeting },
  ]);
  const [state, setState] = useState<ChatState>('idle');
  const counter = useRef(0);

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || state === 'thinking') return;
      const n = counter.current++;
      const userTurn: Turn = { id: `u${n}`, role: 'devotee', text };
      const history = [...turns, userTurn];
      setTurns(history);
      setState('thinking');

      try {
        // Anthropic needs the first message to be `user`, so drop the opening greeting.
        const messages = history
          .filter((t) => t.id !== 'greeting')
          .map((t) => ({ role: t.role === 'deity' ? 'assistant' : 'user', content: t.text }));

        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deityId: deity.id, language, messages, stream: false }),
        });
        const data = await res.json();
        const reply = typeof data?.text === 'string' && data.text ? data.text : '…';
        setTurns((t) => [...t, { id: `d${n}`, role: 'deity', text: reply }]);
      } catch {
        setTurns((t) => [
          ...t,
          { id: `e${n}`, role: 'deity', text: 'I could not reach you just now — please try again in a moment.' },
        ]);
      } finally {
        setState('idle');
      }
    },
    [turns, state, deity, language]
  );

  return { turns, state, sendText };
}
