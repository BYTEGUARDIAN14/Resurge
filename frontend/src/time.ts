export interface Breakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function breakdown(fromIso: string | null): Breakdown {
  if (!fromIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  const total = Math.max(0, Date.now() - new Date(fromIso).getTime());
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { days, hours, minutes, seconds, totalMs: total };
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '—';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
