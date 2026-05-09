import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { KEYS, setJSON, getJSON, setStr, getStr, wipeAll } from './storage';

export interface UserProfile {
  name: string;
  reason: string;
  goalDays: number;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  at: string;
  mood: number;        // 1..5
  triggers: string[];
  note: string;
}

export interface RelapseEntry {
  id: string;
  at: string;
  trigger: string;
  mood: number;        // 1..5
  note: string;
  prevDurationMs: number;
}

export interface Habit {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const DEFAULT_HABITS: Habit[] = [
  { id: 'workout',    label: 'Move my body',    icon: 'activity',  color: '#6FA0FF' },
  { id: 'cold',       label: 'Cold shower',     icon: 'droplet',   color: '#4FD1C5' },
  { id: 'meditate',   label: 'Meditate 5 min',  icon: 'wind',      color: '#9B7BFF' },
  { id: 'read',       label: 'Read 10 min',     icon: 'book-open', color: '#F4A261' },
  { id: 'outside',    label: 'Step outside',    icon: 'sun',       color: '#FFD166' },
  { id: 'no-phone',   label: 'No phone in bed', icon: 'moon',      color: '#5B8FF9' },
];

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// djb2-style hash, sufficient for an at-rest privacy gate (data is local-only).
export function hashPattern(p: string): string {
  let h = 5381;
  for (let i = 0; i < p.length; i++) h = ((h * 33) ^ p.charCodeAt(i)) >>> 0;
  return `r1.${h.toString(36)}.${p.length}`;
}

export interface ResurgeState {
  ready: boolean;
  user: UserProfile | null;
  streakStart: string | null;       // ISO
  personalBestMs: number;
  journal: JournalEntry[];
  relapses: RelapseEntry[];
  urgesSurfed: number;
  sosUsed: number;
  notifEnabled: boolean;
  hapticsEnabled: boolean;
  onboarded: boolean;
  habits: Habit[];
  habitLog: Record<string, string[]>;        // 'YYYY-MM-DD' -> habitId[]
  wins: number;
  lockEnabled: boolean;
  unlocked: boolean;

  setOnboarded: (v: boolean) => Promise<void>;
  setUser: (u: UserProfile) => Promise<void>;
  resetStreak: () => Promise<void>;
  startFreshStreak: () => Promise<void>;
  logRelapse: (entry: Omit<RelapseEntry, 'id' | 'at' | 'prevDurationMs'>) => Promise<void>;
  addJournal: (entry: Omit<JournalEntry, 'id' | 'at'>) => Promise<void>;
  incUrgesSurfed: () => Promise<void>;
  incSosUsed: () => Promise<void>;
  setNotifEnabled: (v: boolean) => Promise<void>;
  setHapticsEnabled: (v: boolean) => Promise<void>;
  toggleHabitToday: (habitId: string) => Promise<void>;
  incWin: () => Promise<void>;
  setLockPattern: (pattern: string) => Promise<void>;
  clearLock: () => Promise<void>;
  verifyPattern: (pattern: string) => boolean;
  unlock: () => void;
  wipe: () => Promise<void>;
}

const Ctx = createContext<ResurgeState | null>(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function ResurgeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [streakStart, setStreakStartState] = useState<string | null>(null);
  const [personalBestMs, setPersonalBestState] = useState(0);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [relapses, setRelapses] = useState<RelapseEntry[]>([]);
  const [urgesSurfed, setUrgesSurfed] = useState(0);
  const [sosUsed, setSosUsed] = useState(0);
  const [notifEnabled, setNotifEnabledState] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [onboarded, setOnboardedState] = useState(false);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [habitLog, setHabitLog] = useState<Record<string, string[]>>({});
  const [wins, setWins] = useState(0);
  const [lockHash, setLockHashState] = useState<string>('');
  const [unlocked, setUnlockedState] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const [u, ss, pb, jr, rl, us, so, ne, he, ob, hb, hl, wn, lh] = await Promise.all([
          getJSON<UserProfile | null>(KEYS.USER, null),
          getStr(KEYS.STREAK_START, ''),
          getStr(KEYS.PERSONAL_BEST, '0'),
          getJSON<JournalEntry[]>(KEYS.JOURNAL, []),
          getJSON<RelapseEntry[]>(KEYS.RELAPSES, []),
          getStr(KEYS.URGES_SURFED, '0'),
          getStr(KEYS.SOS_USED, '0'),
          getStr(KEYS.NOTIF_ENABLED, 'true'),
          getStr(KEYS.HAPTICS_ENABLED, 'true'),
          getStr(KEYS.ONBOARDED, ''),
          getJSON<Habit[]>(KEYS.HABITS, DEFAULT_HABITS),
          getJSON<Record<string, string[]>>(KEYS.HABIT_LOG, {}),
          getStr(KEYS.WINS, '0'),
          getStr(KEYS.LOCK_HASH, ''),
        ]);
        if (cancelled) return;
        setUserState(u);
        setStreakStartState(ss || null);
        setPersonalBestState(parseInt(pb, 10) || 0);
        setJournal(jr);
        setRelapses(rl);
        setUrgesSurfed(parseInt(us, 10) || 0);
        setSosUsed(parseInt(so, 10) || 0);
        setNotifEnabledState(ne !== 'false');
        setHapticsEnabledState(he !== 'false');
        setOnboardedState(ob === 'true');
        setHabits(hb && hb.length > 0 ? hb : DEFAULT_HABITS);
        setHabitLog(hl ?? {});
        setWins(parseInt(wn, 10) || 0);
        setLockHashState(lh);
        setUnlockedState(!lh);     // if a lock is set, app starts locked
      } catch {
        // ignore — fall back to defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    hydrate();
    // safety net: never block the UI more than 2 seconds
    const t = setTimeout(() => { if (!cancelled) setReady(true); }, 2000);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const setOnboarded = useCallback(async (v: boolean) => {
    await setStr(KEYS.ONBOARDED, v ? 'true' : 'false');
    setOnboardedState(v);
  }, []);

  const setUser = useCallback(async (u: UserProfile) => {
    await setJSON(KEYS.USER, u);
    setUserState(u);
    if (!streakStart) {
      const now = new Date().toISOString();
      await setStr(KEYS.STREAK_START, now);
      setStreakStartState(now);
    }
  }, [streakStart]);

  const startFreshStreak = useCallback(async () => {
    const now = new Date().toISOString();
    await setStr(KEYS.STREAK_START, now);
    setStreakStartState(now);
  }, []);

  const resetStreak = startFreshStreak;

  const logRelapse = useCallback(async (entry: Omit<RelapseEntry, 'id' | 'at' | 'prevDurationMs'>) => {
    const now = Date.now();
    const prevDurationMs = streakStart ? now - new Date(streakStart).getTime() : 0;
    const newBest = Math.max(personalBestMs, prevDurationMs);
    const r: RelapseEntry = { id: newId(), at: new Date(now).toISOString(), prevDurationMs, ...entry };
    const next = [r, ...relapses];
    await Promise.all([
      setJSON(KEYS.RELAPSES, next),
      setStr(KEYS.PERSONAL_BEST, String(newBest)),
      setStr(KEYS.STREAK_START, new Date(now).toISOString()),
    ]);
    setRelapses(next);
    setPersonalBestState(newBest);
    setStreakStartState(new Date(now).toISOString());
  }, [relapses, streakStart, personalBestMs]);

  const addJournal = useCallback(async (entry: Omit<JournalEntry, 'id' | 'at'>) => {
    const j: JournalEntry = { id: newId(), at: new Date().toISOString(), ...entry };
    const next = [j, ...journal];
    await setJSON(KEYS.JOURNAL, next);
    setJournal(next);
  }, [journal]);

  const incUrgesSurfed = useCallback(async () => {
    const next = urgesSurfed + 1;
    await setStr(KEYS.URGES_SURFED, String(next));
    setUrgesSurfed(next);
  }, [urgesSurfed]);

  const incSosUsed = useCallback(async () => {
    const next = sosUsed + 1;
    await setStr(KEYS.SOS_USED, String(next));
    setSosUsed(next);
  }, [sosUsed]);

  const setNotifEnabled = useCallback(async (v: boolean) => {
    await setStr(KEYS.NOTIF_ENABLED, v ? 'true' : 'false');
    setNotifEnabledState(v);
  }, []);

  const setHapticsEnabled = useCallback(async (v: boolean) => {
    await setStr(KEYS.HAPTICS_ENABLED, v ? 'true' : 'false');
    setHapticsEnabledState(v);
  }, []);

  const toggleHabitToday = useCallback(async (habitId: string) => {
    const k = todayKey();
    const current = habitLog[k] ?? [];
    const next = current.includes(habitId)
      ? current.filter((id) => id !== habitId)
      : [...current, habitId];
    const log = { ...habitLog, [k]: next };
    await setJSON(KEYS.HABIT_LOG, log);
    setHabitLog(log);
  }, [habitLog]);

  const incWin = useCallback(async () => {
    const next = wins + 1;
    await setStr(KEYS.WINS, String(next));
    setWins(next);
  }, [wins]);

  const setLockPattern = useCallback(async (pattern: string) => {
    const h = hashPattern(pattern);
    await setStr(KEYS.LOCK_HASH, h);
    setLockHashState(h);
    setUnlockedState(true);
  }, []);

  const clearLock = useCallback(async () => {
    await setStr(KEYS.LOCK_HASH, '');
    setLockHashState('');
    setUnlockedState(true);
  }, []);

  const verifyPattern = useCallback((pattern: string) => {
    if (!lockHash) return true;
    return hashPattern(pattern) === lockHash;
  }, [lockHash]);

  const unlock = useCallback(() => setUnlockedState(true), []);

  const wipe = useCallback(async () => {
    await wipeAll();
    setUserState(null);
    setStreakStartState(null);
    setPersonalBestState(0);
    setJournal([]);
    setRelapses([]);
    setUrgesSurfed(0);
    setSosUsed(0);
    setOnboardedState(false);
    setHabitLog({});
    setHabits(DEFAULT_HABITS);
    setWins(0);
    setLockHashState('');
    setUnlockedState(true);
  }, []);

  const value: ResurgeState = {
    ready, user, streakStart, personalBestMs, journal, relapses,
    urgesSurfed, sosUsed, notifEnabled, hapticsEnabled, onboarded,
    habits, habitLog, wins,
    lockEnabled: !!lockHash, unlocked,
    setOnboarded, setUser, resetStreak, startFreshStreak,
    logRelapse, addJournal, incUrgesSurfed, incSosUsed,
    setNotifEnabled, setHapticsEnabled, toggleHabitToday, incWin,
    setLockPattern, clearLock, verifyPattern, unlock,
    wipe,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useResurge(): ResurgeState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useResurge must be inside ResurgeProvider');
  return v;
}
