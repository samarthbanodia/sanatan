import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────
// User preferences — set during onboarding, persisted locally.
// On web, AsyncStorage is backed by localStorage, so this works in the
// browser preview too.
// ─────────────────────────────────────────────────────────────

export type Intention = 'peace' | 'gratitude' | 'strength' | 'guidance';

export const INTENTIONS: { id: Intention; label: string; blurb: string }[] = [
  { id: 'peace', label: 'Inner peace', blurb: 'Quiet the restless mind' },
  { id: 'gratitude', label: 'Gratitude', blurb: 'Give thanks for the day' },
  { id: 'strength', label: 'Strength', blurb: 'Courage for the path ahead' },
  { id: 'guidance', label: 'Guidance', blurb: 'Clarity in a hard moment' },
];

export type Reminder = { enabled: boolean; label: string };

export type Preferences = {
  onboarded: boolean;
  deityId?: string;
  intentions: Intention[];
  reminder?: Reminder;
};

const DEFAULTS: Preferences = { onboarded: false, intentions: [] };
const STORAGE_KEY = 'sanatan.preferences.v1';

type Ctx = {
  prefs: Preferences;
  loading: boolean;
  save: (patch: Partial<Preferences>) => Promise<void>;
  reset: () => Promise<void>;
};

const PreferencesContext = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        // ignore — fall back to defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = useCallback(async (patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setPrefs(DEFAULTS);
  }, []);

  return (
    <PreferencesContext.Provider value={{ prefs, loading, save, reset }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
