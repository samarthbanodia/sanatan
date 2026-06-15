import { useCallback, useRef, useState } from 'react';
import { Deity } from '../data/content';

// ─────────────────────────────────────────────────────────────
// Voice session abstraction.
//
// This is the seam where a real realtime engine plugs in later
// (OpenAI Realtime, Gemini Live, or an STT→LLM→TTS pipeline).
// The UI only depends on this interface — swap `mockTurn` for a
// real transport and nothing in the screen layer needs to change.
// ─────────────────────────────────────────────────────────────

export type Turn = { id: string; role: 'devotee' | 'deity'; text: string };
export type SessionState = 'idle' | 'listening' | 'thinking' | 'speaking';

// Canned devotee utterances (stand in for live speech-to-text).
const DEVOTEE_LINES = [
  'I feel anxious about the path ahead.',
  'Please bless my family with health.',
  'I am grateful for everything you have given me.',
  'How do I find peace when my mind is restless?',
  'Give me the strength to forgive.',
];

// Per-deity response pools (stand in for live LLM + TTS).
const RESPONSES: Record<string, string[]> = {
  ganesha: [
    'Every obstacle is a doorway in disguise. Walk toward it, and I will clear the way before you.',
    'Begin. The first step is the offering; the rest I shall arrange.',
  ],
  krishna: [
    'You have the right to your actions, never to their fruits. Act, and release the worry.',
    'I am the calm beneath every storm of your mind. Return to me there.',
  ],
  shiva: [
    'Stillness is not the absence of the storm, but the witness who watches it pass.',
    'Offer what burdens you into the fire. What is true cannot be consumed.',
  ],
  durga: [
    'My child, your strength is not borrowed — it is your own, and it is infinite.',
    'Fear bows before the one who keeps walking. Walk, and I walk beside you.',
  ],
  hanuman: [
    'Speak the name of Ram and watch the mountain of fear become a pebble.',
    'Devotion is strength made tender. Serve with love, and nothing can shake you.',
  ],
  lakshmi: [
    'Abundance flows to the open and grateful heart. Open yours, and receive.',
    'What you tend with devotion will bloom in its season. Be patient, be present.',
  ],
};

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export function useVoiceSession(deity: Deity) {
  const [state, setState] = useState<SessionState>('idle');
  const [turns, setTurns] = useState<Turn[]>([
    { id: 'greeting', role: 'deity', text: deity.greeting },
  ]);
  const counter = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // One full conversational turn, faked end-to-end.
  const speakTurn = useCallback(() => {
    if (state !== 'idle') return;
    const n = counter.current++;
    setState('listening');

    timers.current.push(
      setTimeout(() => {
        const devoteeText = pick(DEVOTEE_LINES, n);
        setTurns((t) => [...t, { id: `d${n}`, role: 'devotee', text: devoteeText }]);
        setState('thinking');

        timers.current.push(
          setTimeout(() => {
            setState('speaking');
            const reply = pick(RESPONSES[deity.id] ?? RESPONSES.ganesha, n);
            setTurns((t) => [...t, { id: `r${n}`, role: 'deity', text: reply }]);

            // speaking duration scales with reply length
            const dur = Math.min(5200, 1800 + reply.length * 28);
            timers.current.push(setTimeout(() => setState('idle'), dur));
          }, 1200)
        );
      }, 1800)
    );
  }, [state, deity]);

  const end = useCallback(() => {
    clearTimers();
    setState('idle');
  }, []);

  return { state, turns, speakTurn, end };
}
