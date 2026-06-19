import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────
// Daily diya ritual — light one lamp a day, keep the flame (streak).
// Persisted locally (AsyncStorage → localStorage on web). A small, real
// "moment": tapping lights today's diya, and consecutive days build a streak.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sanatan.diya.v1';

type DiyaState = { lastLitDate: string; streak: number };

// Local calendar day key (not UTC) so "today" matches the user's wall clock.
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function useDiya() {
  const [state, setState] = useState<DiyaState>({ lastLitDate: '', streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } catch {
        // ignore — fall back to unlit
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = dayKey(new Date());
  const litToday = state.lastLitDate === today;

  const light = useCallback(() => {
    setState((prev) => {
      if (prev.lastLitDate === today) return prev; // already lit today
      const yesterday = dayKey(new Date(Date.now() - 86_400_000));
      const streak = prev.lastLitDate === yesterday ? prev.streak + 1 : 1;
      const next = { lastLitDate: today, streak };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [today]);

  return { streak: state.streak, litToday, loading, light };
}
