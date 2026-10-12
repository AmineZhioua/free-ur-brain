import { LapseSummary } from '@/core/models/LapseSummary';
import NativeAppBlocker from '../../modules/app-blocker';
import type { InstalledApp } from '../core/models/InstalledApp';

export interface AppBlockerApi {
  requestPermission(): Promise<void>;
  isPermissionGranted(): Promise<boolean>;
  getInstalledApps(): Promise<InstalledApp[]>;
  /** Idempotent per commitmentId: calling again never restarts the clock. */
  startBlocking(packageNames: string[], durationMs: number, commitmentId: number): Promise<void>;
  stopBlocking(): Promise<void>;
  /** Remaining time on the monotonic clock, or -1 if native has no timing for it. */
  getRemainingMs(commitmentId: number): Promise<number>;
  getLapseSummary(commitmentId: number): Promise<LapseSummary>;
}

export const AppBlocker: AppBlockerApi = {
  requestPermission: () => NativeAppBlocker.requestPermission(),
  isPermissionGranted: () => NativeAppBlocker.isPermissionGranted(),
  getInstalledApps: () => NativeAppBlocker.getInstalledApps(),
  startBlocking: (packageNames, durationMs, commitmentId) => NativeAppBlocker.startBlocking(packageNames, durationMs, commitmentId),
  stopBlocking: () => NativeAppBlocker.stopBlocking(),
  getRemainingMs: (commitmentId) => NativeAppBlocker.getRemainingMs(commitmentId),
  getLapseSummary: (commitmentId) => NativeAppBlocker.getLapseSummary(commitmentId),
};