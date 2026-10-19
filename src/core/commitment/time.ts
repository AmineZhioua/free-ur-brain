export interface DurationOption {
  id: string;
  label: string;
  durationMs: number;
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const CUSTOM_DURATION_ID = 'custom';
export const DEFAULT_CUSTOM_DURATION_MS = 4 * HOUR;

export const DURATION_OPTIONS: readonly DurationOption[] = [
  { id: '1m', label: '1 min', durationMs: MINUTE },
  { id: '3m', label: '3 min', durationMs: 3 * MINUTE },
  { id: '15m', label: '15 min', durationMs: 15 * MINUTE },
  { id: '30m', label: '30 min', durationMs: 30 * MINUTE },
  { id: '1h', label: '1 hour', durationMs: HOUR },
  { id: '2h', label: '2 hours', durationMs: 2 * HOUR },
];

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
}

export function partsToMs(parts: DurationParts): number {
  return (
    Math.max(0, parts.days) * DAY +
    Math.max(0, parts.hours) * HOUR +
    Math.max(0, parts.minutes) * MINUTE
  );
}

export function msToParts(ms: number): DurationParts {
  const totalMinutes = Math.floor(Math.max(0, ms) / MINUTE);
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  return { days, hours, minutes };
}

export function describeDuration(ms: number): string {
  const totalMinutes = Math.round(ms / MINUTE);
  if (totalMinutes < 60) {
    return `${totalMinutes} ${totalMinutes === 1 ? 'minute' : 'minutes'}`;
  }

  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (mins > 0) {
    parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.length > 0 ? parts.join(' ') : '0 minutes';
}

/** Like describeDuration, but handles very short interruptions. */
export function describeInterruption(ms: number): string {
  if (ms < MINUTE) return 'less than a minute';
  return describeDuration(ms);
}

/**
 * 3725000 -> "01:02:05", 90120000 -> "1d 01:02:00".
 * Rounds up so it never shows 00:00:00 before the end.
 */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (d > 0) {
    return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}