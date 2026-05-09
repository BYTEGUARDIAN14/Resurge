# Resurge — Product Requirements

## Vision
A premium, emotionally intelligent sobriety companion for people overcoming compulsive behavioral addiction (PMO recovery). Privacy-first: all sensitive data stays on the device.

## Tech
- **Frontend**: React Native + Expo SDK 54 + Expo Router (file-based) + TypeScript
- **State**: React Context (`ResurgeProvider`) over `@react-native-async-storage/async-storage`
- **Animations**: `react-native-reanimated` v4
- **Backend**: FastAPI (curated public content only — quotes, milestones, brain timeline)
- **Storage**: device-local only; backend never sees user data

## Design — "Obsidian Blue"
- Pure black canvas (#000000) with crisp electric blue (#5B9BFE)
- Teal #4FD1C5 for breathing/healing motifs, gold #F4C77B for wins
- Manrope (heading) + DM Sans (body)

## Screens
- `/onboarding` — 3-step empathetic intake (name → reason → goal days)
- `/(tabs)/home` — hero live ring, daily quote, next milestone, **HabitTracker (6 daily swap habits)**, **TimeReclaimedCard (hours+equivalents)**, **WinButton (log a micro-victory)**, action tiles, SOS, gentle reset
- `/(tabs)/journal` — mood/trigger entries + reset history
- `/(tabs)/tools` — urge surf, emergency, brain timeline, quotes library, log a moment
- `/(tabs)/progress` — stats grid, 7-day mood graph (SVG), **30-day StreakCalendar heatmap**, **TopTriggers insight**, milestone badge grid
- `/urge-surf` (modal) — box-breathing 4·4·4·4 with animated orb, 5-minute timer
- `/emergency` (modal) — SOS menu (breath / cold shock countdown / 20 push-ups tap)
- `/relapse` (modal) — empathetic reset wizard (mood → trigger → reflection → confirm)
- `/journal-entry` (modal) — quick log: mood + trigger tags + note
- `/timeline` (modal) — 9-stage brain rewiring timeline
- `/settings` — toggles, restart streak, erase all data
- `/quotes-library` — full quote browser

## Backend endpoints (`/api`)
- `GET /health` — status, counts
- `GET /quotes/all` — all curated quotes
- `GET /quotes/random` — random quote
- `GET /quotes/daily?seed=YYYY-MM-DD` — deterministic quote of the day
- `GET /milestones` — 9 levels (1d → 365d)
- `GET /milestones/next?days_clean=N` — next/previous milestone
- `GET /brain-timeline` — 9-stage brain rewiring stages

## Key features
- Sobriety counter (live ticking) + 9 milestone badges
- Urge surf (box breathing 4·4·4·4) + Emergency SOS (3 modes)
- Relapse logger (non-judgmental wizard) + Mood/trigger journal
- **HabitTracker** — 6 daily replacement habits, persistent per-day log
- **WinButton** — log micro-victories ("I just won this moment")
- **TimeReclaimedCard** — visualises hours saved + workout/book/win equivalents
- **StreakCalendar** — 30-day heatmap (clean / journaled / reset)
- **TopTriggers** — bar-chart of most frequent triggers across journal+relapses
- **Brain timeline** — research-informed map of brain healing across days

## Privacy
- No auth, no accounts, no analytics, no telemetry.
- All recovery data stored only in AsyncStorage.

## Notifications
Local-only via `expo-notifications`. Three daily encouragements: 8:00, 21:30, 23:30.
