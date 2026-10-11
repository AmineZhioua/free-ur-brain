export interface LapseSummary {
  /** How many times blocking was interrupted during the commitment. */
  count: number;
  /** Total time blocking was off, in milliseconds. */
  totalMs: number;
}