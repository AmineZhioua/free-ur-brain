import NativeAppBlocker from '../../modules/app-blocker';
import type { InstalledApp } from '../core/models/InstalledApp';

export interface AppBlockerApi {
  requestPermission(): Promise<void>;
  isPermissionGranted(): Promise<boolean>;
  getInstalledApps(): Promise<InstalledApp[]>;
  startBlocking(packageNames: string[], endsAt: number): Promise<void>;
  stopBlocking(): Promise<void>;
}

export const AppBlocker: AppBlockerApi = {
  requestPermission: () => NativeAppBlocker.requestPermission(),
  isPermissionGranted: () => NativeAppBlocker.isPermissionGranted(),
  getInstalledApps: () => NativeAppBlocker.getInstalledApps(),
  startBlocking: (packageNames, endsAt) => NativeAppBlocker.startBlocking(packageNames, endsAt),
  stopBlocking: () => NativeAppBlocker.stopBlocking(),
};