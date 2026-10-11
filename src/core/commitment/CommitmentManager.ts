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
    Array.isArray(c.packageNames) &&
    c.packageNames.length > 0 &&
    c.packageNames.every((p) => typeof p === 'string' && p.length > 0) &&
    typeof c.labels === 'object' &&
    c.labels !== null &&
    isPositiveFinite(c.startedAt) &&
    isPositiveFinite(c.endsAt) &&
    isPositiveFinite(c.durationMs) &&
    c.endsAt > c.startedAt
  );
}


/* ---------- queries ---------- */
/*
  Returns null when nothing is stored or the stored value is invalid. 
*/
export async function loadCommitment(): Promise<Commitment | null> {
  const value = await getJson<unknown>(StorageKeys.commitment);
  return isValidCommitment(value) ? value : null;
}

export function isActive(commitment: Commitment, now = Date.now()): boolean {
  return now < commitment.endsAt;
}


/* ---------- commands ---------- */
export function startCommitment(input: StartCommitmentInput, now?: number): Promise<Commitment> {
  return serialize(async () => {
    const t = now ?? Date.now();
    const packageNames = Array.from(new Set(input.packageNames));

    if (packageNames.length === 0) throw new Error('Select at least one app.');
    if (!isPositiveFinite(input.durationMs)) throw new Error('Invalid duration.');

    const existing = await loadCommitment();
    if (existing && isActive(existing, t)) {
      throw new Error('A commitment is already active.');
    }

    const commitment: Commitment = {
      packageNames,
      labels: input.labels,
      startedAt: t,
      endsAt: t + input.durationMs,
      durationMs: input.durationMs,
    };

    await setJson(StorageKeys.commitment, commitment);

    try {
      await AppBlocker.startBlocking(commitment.packageNames, commitment.endsAt);
    } catch (e) {
      // Never keep a commitment the native layer is not enforcing.
      await removeKey(StorageKeys.commitment);
      throw e;
    }

    return commitment;
  });
}

/** Removes a finished commitment. Refuses while it is still running. */
export function clearExpiredCommitment(now?: number): Promise<void> {
  return serialize(async () => {
    const t = now ?? Date.now();
    const existing = await loadCommitment();
    if (!existing) return;

    if (isActive(existing, t)) {
      throw new Error('This commitment cannot be cancelled until the timer expires.');
    }

    await AppBlocker.stopBlocking();
    await removeKey(StorageKeys.commitment);
  });
}

/**
 * Makes the native blocking state agree with the persisted commitment.
 * Safe to call any number of times (launch, foreground, ...).
 */
export function reconcileBlocking(now?: number): Promise<void> {
  return serialize(async () => {
    const t = now ?? Date.now();
    const commitment = await loadCommitment();

    if (commitment && isActive(commitment, t)) {
      await AppBlocker.startBlocking(commitment.packageNames, commitment.endsAt);
      if (__DEV__) console.log(`[reconcile] blocking ${commitment.packageNames.length} apps until ${new Date(commitment.endsAt).toISOString()}`);
    } else {
      await AppBlocker.stopBlocking();
      if (__DEV__) console.log('[reconcile] no active commitment, blocking cleared');
    }
  });
}