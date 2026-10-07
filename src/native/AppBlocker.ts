import NativeAppBlocker from '../../modules/app-blocker';
import type { InstalledApp } from '../core/models/InstalledApp';

export interface AppBlockerApi {
  requestPermission(): Promise<void>;
  isPermissionGranted(): Promise<boolean>;
  getInstalledApps(): Promise<InstalledApp[]>;
  // startBlocking / stopBlocking arrive in Milestone 6.
}

export const AppBlocker: AppBlockerApi = {
  requestPermission: () => NativeAppBlocker.requestPermission(),
  isPermissionGranted: () => NativeAppBlocker.isPermissionGranted(),
  getInstalledApps: () => NativeAppBlocker.getInstalledApps(),
};