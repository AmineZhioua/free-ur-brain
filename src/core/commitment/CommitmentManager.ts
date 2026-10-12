import { AppBlocker } from '@/native/AppBlocker';
import type { Commitment } from '../models/Commitment';
import {
  getJson, removeKey, setJson, StorageKeys
} from '../storage/storage';


export interface StartCommitmentInput {
  packageNames: string[];
  labels: Record<string, string>;
  durationMs: number;
}

/* ---------- ordering: one commitment operation at a time ---------- */

let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

/* ---------- validation ---------- */

const isPositiveFinite = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0;

function isValidCommitment(value: unknown): value is Commitment {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Partial<Commitment>;

  return (
    isPositiveFinite(c.id) &&
    isPositiveFinite(c.durationMs) &&
    Array.isArray(c.packageNames) &&
    c.packageNames.length > 0 &&
    c.packageNames.every((p) => typeof p === 'string' && p.length > 0) &&
    typeof c.labels === 'object' &&
    c.labels !== null
  );
}

/* ---------- queries ---------- */

/** Returns null when nothing is stored or the stored value is invalid. */
export async function loadCommitment(): Promise<Commitment | null> {
  const value = await getJson<unknown>(StorageKeys.commitment);
  return isValidCommitment(value) ? value : null;
}

/**
 * Remaining time from the native monotonic clock.
 * null means native has no timing for this commitment (yet), which is not the same as 0.
 */
export async function getRemainingMs(commitment: Commitment): Promise<number | null> {
  const ms = await AppBlocker.getRemainingMs(commitment.id);
  return ms < 0 ? null : ms;
}

/* ---------- commands ---------- */

export function startCommitment(input: StartCommitmentInput): Promise<Commitment> {
  return serialize(async () => {
    const packageNames = Array.from(new Set(input.packageNames));

    if (packageNames.length === 0) throw new Error('Select at least one app.');
    if (!isPositiveFinite(input.durationMs)) throw new Error('Invalid duration.');

    const existing = await loadCommitment();
    if (existing && (await getRemainingMs(existing)) !== 0) {
      throw new Error('A commitment is already active.');
    }

    const commitment: Commitment = {
      // Only used as a unique id, never for time calculations.
      id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
      packageNames,
      labels: input.labels,
      durationMs: input.durationMs,
    };

    await setJson(StorageKeys.commitment, commitment);

    try {
      await AppBlocker.startBlocking(commitment.packageNames, commitment.durationMs, commitment.id);
    } catch (e) {
      // Never keep a commitment the native layer is not enforcing.
      await removeKey(StorageKeys.commitment);
      throw e;
    }

    return commitment;
  });
}

/** Removes a finished commitment. Refuses while it is still running. */
export function clearExpiredCommitment(): Promise<void> {
  return serialize(async () => {
    const existing = await loadCommitment();
    if (!existing) return;

    if ((await getRemainingMs(existing)) !== 0) {
      throw new Error('This commitment cannot be cancelled until the timer expires.');
    }

    // JS record first: a crash in between must never revive a finished commitment.
    await removeKey(StorageKeys.commitment);
    await AppBlocker.stopBlocking();
  });
}

/**
 * Makes native blocking agree with the persisted commitment.
 * Idempotent: for the same commitment it keeps the running clock.
 */
export function reconcileBlocking(): Promise<void> {
  return serialize(async () => {
    const commitment = await loadCommitment();

    if (!commitment) {
      await AppBlocker.stopBlocking();
      if (__DEV__) console.log('[reconcile] no commitment, blocking cleared');
      return;
    }

    await AppBlocker.startBlocking(commitment.packageNames, commitment.durationMs, commitment.id);

    if (__DEV__) {
      const ms = await AppBlocker.getRemainingMs(commitment.id);
      console.log(`[reconcile] ${commitment.packageNames.length} apps, ${Math.round(ms / 1000)}s remaining`);
    }
  });
}