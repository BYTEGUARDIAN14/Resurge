/**
 * api.ts — Public API surface for Resurge content.
 *
 * All calls are served from the offline cache (AsyncStorage).
 * The network is only ever used once: during the initial seed in cache.ts.
 * After that, this file never makes a network request.
 */

import { cache } from './cache';

// ─── Shared types (re-exported so callers don't change their imports) ─────────

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export interface Milestone {
  days: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export interface BrainStage {
  days: number;
  title: string;
  body: string;
  icon: string;
}

// ─── API object — same interface as before, now 100% offline ─────────────────

export const api = {
  /** Quote of the day — deterministic per date seed, served from cache. */
  dailyQuote: (seed: string): Promise<Quote> => cache.dailyQuote(seed),

  /** A random quote from cache. */
  randomQuote: (): Promise<Quote> => cache.randomQuote(),

  /** Full quotes list from cache. */
  allQuotes: (): Promise<Quote[]> => cache.quotes(),

  /** All milestones from cache. */
  milestones: (): Promise<Milestone[]> => cache.milestones(),

  /** Brain-timeline stages from cache. */
  brainTimeline: (): Promise<BrainStage[]> => cache.timeline(),
};
