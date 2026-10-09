export interface DurationOption {
  id: string;
  label: string;
  durationMs: number;
}

const MINUTE = 60_000;

export const DURATION_OPTIONS: readonly DurationOption[] = [
  // Dev builds only, so expiry can be tested quickly.
  ...(__DEV__ ? [{ id: '1m', label: '1 min (dev only)', durationMs: MINUTE }] : []),
  { id: '15m', label: '15 min', durationMs: 15 * MINUTE },
  { id: '30m', label: '30 min', durationMs: 30 * MINUTE },
  { id: '1h', label: '1 hour', durationMs: 60 * MINUTE },
  { id: '2h', label: '2 hours', durationMs: 120 * MINUTE },
];

export function describeDuration(ms: number): string {
  const minutes = Math.round(ms / MINUTE);
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

/** 3725000 -> "01:02:05". Rounds up so it never shows 00:00:00 before the end. */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}