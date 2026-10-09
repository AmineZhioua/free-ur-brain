export interface Commitment {
  /** Packages enforced by the native service (read by Kotlin in Milestone 6). */
  packageNames: string[];
  /** Display names captured at start time, keyed by package name. */
  labels: Record<string, string>;
  /** Epoch milliseconds. */
  startedAt: number;
  /** Epoch milliseconds. The commitment is over when now >= endsAt. */
  endsAt: number;
  durationMs: number;
}