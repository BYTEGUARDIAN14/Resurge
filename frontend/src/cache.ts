/**
 * cache.ts — Offline-first content cache
 *
 * Strategy:
 *   • On first launch (or if cache is empty), fetch all remote content
 *     (quotes, milestones, brain-timeline) from the backend and persist it
 *     permanently in AsyncStorage.
 *   • On every subsequent launch, read directly from AsyncStorage.
 *     The backend is never contacted again after the initial seed.
 *   • If the first-launch fetch fails (no network), ship safe hardcoded
 *     fallbacks so the app is still 100% functional.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Quote, Milestone, BrainStage } from './api';

// ─── Storage keys (scoped to avoid collisions with user data keys) ────────────
const CACHE_KEYS = {
  QUOTES:    'resurge.cache.quotes',
  MILESTONES:'resurge.cache.milestones',
  TIMELINE:  'resurge.cache.brain_timeline',
  SEEDED:    'resurge.cache.seeded',          // 'true' once all 3 are stored
} as const;

// ─── Hardcoded fallbacks (exact copy of backend's static data) ────────────────
// These guarantee the app works even if first launch has zero connectivity.

const FALLBACK_QUOTES: Quote[] = [
  { id: 'q01', text: 'A slip is not a fall. Stand up, brush off, walk on.', author: 'Resurge' },
  { id: 'q02', text: 'You are not your urges. You are the calm beneath them.', author: 'Resurge' },
  { id: 'q03', text: 'Every clean hour is a quiet act of self-respect.', author: 'Resurge' },
  { id: 'q04', text: 'The cave you fear to enter holds the treasure you seek.', author: 'Joseph Campbell' },
  { id: 'q05', text: 'Discipline is choosing what you want most over what you want now.', author: 'Abraham Lincoln' },
  { id: 'q06', text: 'Pain is inevitable. Suffering is optional.', author: 'Haruki Murakami' },
  { id: 'q07', text: 'Be kind to yourself. You\'re rebuilding from inside out.', author: 'Resurge' },
  { id: 'q08', text: 'What you resist persists. What you observe dissolves.', author: 'Carl Jung' },
  { id: 'q09', text: 'The urge is a wave. Don\'t fight it. Surf it.', author: 'Alan Marlatt' },
  { id: 'q10', text: 'Strength does not come from winning. It comes from showing up.', author: 'Resurge' },
  { id: 'q11', text: 'Tomorrow\'s strength is built in tonight\'s restraint.', author: 'Resurge' },
  { id: 'q12', text: 'You are doing the bravest thing — choosing yourself again.', author: 'Resurge' },
  { id: 'q13', text: 'Between stimulus and response there is a space. In that space is your power.', author: 'Viktor Frankl' },
  { id: 'q14', text: 'The wound is the place where the light enters you.', author: 'Rumi' },
  { id: 'q15', text: 'We are what we repeatedly do. Excellence is a habit.', author: 'Aristotle' },
  { id: 'q16', text: 'You don\'t have to be perfect. You just have to be honest.', author: 'Resurge' },
  { id: 'q17', text: 'The chains of habit are too light to be felt until they are too heavy to be broken.', author: 'Warren Buffett' },
  { id: 'q18', text: 'Today, breathe. Tomorrow, breathe. That is enough.', author: 'Resurge' },
  { id: 'q19', text: 'Healing is not linear. Neither is greatness.', author: 'Resurge' },
  { id: 'q20', text: 'What once owned you no longer needs your attention.', author: 'Resurge' },
  { id: 'q21', text: 'Quiet the noise. Hear the version of you that is whole.', author: 'Resurge' },
  { id: 'q22', text: 'Old habits die when you stop feeding them.', author: 'Resurge' },
  { id: 'q23', text: 'Comfort is the enemy of becoming.', author: 'Resurge' },
  { id: 'q24', text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius' },
  { id: 'q25', text: 'You are the one your future self is rooting for.', author: 'Resurge' },
  { id: 'q26', text: 'Fall seven times. Rise eight.', author: 'Japanese Proverb' },
  { id: 'q27', text: 'Triggers are teachers in disguise.', author: 'Resurge' },
  { id: 'q28', text: 'Rest is not retreat. Rest is recovery.', author: 'Resurge' },
  { id: 'q29', text: 'Your past does not negotiate your future.', author: 'Resurge' },
  { id: 'q30', text: 'Tonight you stayed. That matters.', author: 'Resurge' },
];

const FALLBACK_MILESTONES: Milestone[] = [
  { days: 1,   title: 'First Light',  subtitle: 'Day one is the hardest. You did it.',       icon: 'sunrise',      color: '#6B8F71' },
  { days: 3,   title: 'Three Suns',   subtitle: 'Withdrawal eases. Clarity sharpens.',        icon: 'sun',          color: '#7FA386' },
  { days: 7,   title: 'First Week',   subtitle: 'Seven days of choosing yourself.',           icon: 'leaf',         color: '#4A7C59' },
  { days: 14,  title: 'Fortnight',    subtitle: 'New patterns are forming inside you.',       icon: 'trending-up',  color: '#5B937B' },
  { days: 30,  title: 'Resilience',   subtitle: 'A full month. Old self is fading.',          icon: 'shield',       color: '#D4A373' },
  { days: 60,  title: 'Forge',        subtitle: 'Two months — the rewire is real.',           icon: 'anchor',       color: '#C8915F' },
  { days: 90,  title: 'Reborn',       subtitle: 'Ninety days. You are not the same person.',  icon: 'feather',      color: '#E27D60' },
  { days: 180, title: 'Half Year',    subtitle: 'Six months of reclaimed life.',              icon: 'compass',      color: '#E89B6E' },
  { days: 365, title: 'Resurgent',    subtitle: 'One year. You rose.',                        icon: 'award',        color: '#F4F4F5' },
];

const FALLBACK_TIMELINE: BrainStage[] = [
  { days: 1,   title: 'The first quiet hour',   body: 'Dopamine begins recalibrating. The numb fog from constant overstimulation starts to lift.',                               icon: 'moon'        },
  { days: 3,   title: 'Withdrawal peak',         body: 'Mood dips, urges spike. This is the body\'s protest as it loses its old fuel. It always passes.',                        icon: 'activity'    },
  { days: 7,   title: 'Sharper senses',          body: 'Eye contact feels more powerful. Real-life beauty becomes brighter than pixels. The world reopens.',                     icon: 'eye'         },
  { days: 14,  title: 'Mental clarity returns',  body: 'Focus deepens. The constant background hum of craving softens. Decisions get easier.',                                  icon: 'zap'         },
  { days: 30,  title: 'New baseline',            body: 'Your reward system has begun rewiring. Healthy pleasures (food, music, movement) feel meaningful again.',                icon: 'shield'      },
  { days: 60,  title: 'Energy surge',            body: 'Many report a \'flatline\' breaking — drive, ambition, libido normalize and align with real life.',                      icon: 'trending-up' },
  { days: 90,  title: 'Deep rewire',             body: 'Neuroscience suggests significant neuroplastic change. The pull is fundamentally weaker.',                               icon: 'feather'     },
  { days: 180, title: 'A different person',      body: 'Long compulsive loops are largely gone. You spend the energy elsewhere — on people, on craft.',                          icon: 'compass'     },
  { days: 365, title: 'Resurgent',               body: 'A full year of choosing yourself rebuilds identity at a foundational level. You are not who you were.',                  icon: 'award'       },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call once at app startup (inside ResurgeProvider, after fonts load).
 * If the cache is already seeded, returns immediately — no network call.
 * If not seeded, tries to fetch from backend; falls back to hardcoded data
 * on any error, so the app always has content.
 */
export async function seedCacheIfNeeded(): Promise<void> {
  const alreadySeeded = await AsyncStorage.getItem(CACHE_KEYS.SEEDED);
  if (alreadySeeded === 'true') return;

  const base = (process.env.EXPO_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');

  let quotes: Quote[]       = FALLBACK_QUOTES;
  let milestones: Milestone[]= FALLBACK_MILESTONES;
  let timeline: BrainStage[] = FALLBACK_TIMELINE;

  if (base) {
    // Fetch all three in parallel; fall back individually on failure
    const [q, m, t] = await Promise.allSettled([
      fetchJSON<Quote[]>(`${base}/api/quotes/all`),
      fetchJSON<Milestone[]>(`${base}/api/milestones`),
      fetchJSON<BrainStage[]>(`${base}/api/brain-timeline`),
    ]);
    if (q.status === 'fulfilled' && q.value?.length > 0) quotes     = q.value;
    if (m.status === 'fulfilled' && m.value?.length > 0) milestones = m.value;
    if (t.status === 'fulfilled' && t.value?.length > 0) timeline   = t.value;
  }

  // Persist everything atomically
  await Promise.all([
    writeJSON(CACHE_KEYS.QUOTES,     quotes),
    writeJSON(CACHE_KEYS.MILESTONES, milestones),
    writeJSON(CACHE_KEYS.TIMELINE,   timeline),
    AsyncStorage.setItem(CACHE_KEYS.SEEDED, 'true'),
  ]);
}

// ─── Cache readers (called by api.ts — never touch the network) ───────────────

export const cache = {
  quotes():    Promise<Quote[]>      { return readJSON(CACHE_KEYS.QUOTES,     FALLBACK_QUOTES);    },
  milestones():Promise<Milestone[]>  { return readJSON(CACHE_KEYS.MILESTONES, FALLBACK_MILESTONES); },
  timeline():  Promise<BrainStage[]> { return readJSON(CACHE_KEYS.TIMELINE,   FALLBACK_TIMELINE);  },

  /** Deterministic quote-of-the-day from cache. Same seed → same quote. */
  async dailyQuote(seed: string): Promise<Quote> {
    const list = await cache.quotes();
    // djb2-style hash to pick index
    let h = 5381;
    for (let i = 0; i < seed.length; i++) h = ((h * 33) ^ seed.charCodeAt(i)) >>> 0;
    return list[h % list.length];
  },

  /** Random quote from cache. */
  async randomQuote(): Promise<Quote> {
    const list = await cache.quotes();
    return list[Math.floor(Math.random() * list.length)];
  },
};
