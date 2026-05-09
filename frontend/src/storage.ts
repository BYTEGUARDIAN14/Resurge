import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  USER: 'resurge.user',                    // { name, reason, goalDays, createdAt }
  STREAK_START: 'resurge.streak.start',    // ISO string
  PERSONAL_BEST: 'resurge.streak.best',    // number (ms duration)
  RELAPSES: 'resurge.relapses',            // [{ id, at, trigger, mood, note, prevDuration }]
  JOURNAL: 'resurge.journal',              // [{ id, at, mood (1-5), triggers[], note }]
  URGES_SURFED: 'resurge.urges.surfed',    // number (count)
  SOS_USED: 'resurge.sos.used',            // number (count)
  ONBOARDED: 'resurge.onboarded',          // 'true'
  NOTIF_ENABLED: 'resurge.notif',          // 'true' | 'false'
  HAPTICS_ENABLED: 'resurge.haptics',      // 'true' | 'false'
  WINS: 'resurge.wins',                    // number (count) of "I won this moment" taps
  LOCK_HASH: 'resurge.lock.hash',          // string hash of pattern, '' = lock disabled
  HABITS: 'resurge.habits',                // [{ id, label, icon, color }]
  HABIT_LOG: 'resurge.habit.log',          // { 'YYYY-MM-DD': ['habitId',...] }
};

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setStr(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function getStr(key: string, fallback = ''): Promise<string> {
  return (await AsyncStorage.getItem(key)) ?? fallback;
}

export async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function wipeAll(): Promise<void> {
  const keys = Object.values(KEYS);
  await AsyncStorage.multiRemove(keys);
}
