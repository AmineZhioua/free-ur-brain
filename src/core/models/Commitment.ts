export interface Commitment {
  /** Unique id. Ties the native clock and the lapse data to this commitment. */
  id: number;
  /** Packages enforced by the native service. */
  packageNames: string[];
  /** Display names captured at start time, keyed by package name. */
  labels: Record<string, string>;
  durationMs: number;
}