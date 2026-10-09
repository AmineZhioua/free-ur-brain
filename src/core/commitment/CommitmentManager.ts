import type { Commitment } from '../models/Commitment';
import {
  getJson, removeKey, setJson, StorageKeys
} from '../storage/storage';

export interface StartCommitmentInput {
  packageNames: string[];
  labels: Record<string, string>;
  durationMs: number;
}

function isValidCommitment(value: unknown): value is Commitment {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Partial<Commitment>;
  return (
    Array.isArray(c.packageNames) &&
    c.packageNames.every((p) => typeof p === 'string') &&
    typeof c.labels === 'object' &&
    c.labels !== null &&
    typeof c.startedAt === 'number' &&
    typeof c.endsAt === 'number' &&
    typeof c.durationMs === 'number'
  );
}

export async function loadCommitment(): Promise<Commitment | null> {
  const value = await getJson<unknown>(StorageKeys.commitment);
  return isValidCommitment(value) ? value : null;
}

export function isActive(commitment: Commitment, now = Date.now()): boolean {
  return now < commitment.endsAt;
}

export async function startCommitment(
  input: StartCommitmentInput,
  now = Date.now()
): Promise<Commitment> {
  const packageNames = Array.from(new Set(input.packageNames));

  if (packageNames.length === 0) throw new Error('Select at least one app.');
  if (input.durationMs <= 0) throw new Error('Invalid duration.');

  const existing = await loadCommitment();
  if (existing && isActive(existing, now)) {
    throw new Error('A commitment is already active.');
  }

  const commitment: Commitment = {
    packageNames,
    labels: input.labels,
    startedAt: now,
    endsAt: now + input.durationMs,
    durationMs: input.durationMs,
  };

  await setJson(StorageKeys.commitment, commitment);

  // Milestone 6: AppBlocker.startBlocking(packageNames, commitment.endsAt)
  return commitment;
}

/** Removes a finished commitment. Refuses while it is still running. */
export async function clearExpiredCommitment(now = Date.now()): Promise<void> {
  const existing = await loadCommitment();
  if (!existing) return;
  if (isActive(existing, now)) {
    throw new Error('This commitment cannot be cancelled until the timer expires.');
  }
  await removeKey(StorageKeys.commitment);
}