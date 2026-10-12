import { useEffect, useState } from 'react';
import { AppBlocker } from '../native/AppBlocker';

/**
 * Remaining milliseconds from the native monotonic clock, polled once per second.
 * null = unknown (not loaded yet, or native has no timing for this commitment).
 */
export function useRemainingTime(commitmentId: number | null): number | null {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (commitmentId == null) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = async () => {
      try {
        const ms = await AppBlocker.getRemainingMs(commitmentId);
        if (cancelled) return;
        setRemainingMs(ms < 0 ? null : ms);
        if (ms === 0 && timer) clearInterval(timer); // finished, stop polling
      } catch {
        if (!cancelled) setRemainingMs(null);
      }
    };

    void tick();
    timer = setInterval(tick, 1000);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [commitmentId]);

  return remainingMs;
}