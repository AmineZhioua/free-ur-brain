import NativeAppBlocker from '../../modules/app-blocker';

export interface AppBlockerApi {
  requestPermission(): Promise<void>;
  isPermissionGranted(): Promise<boolean>;
  // getInstalledApps, startBlocking, stopBlocking arrive in later milestones.
}

export const AppBlocker: AppBlockerApi = {
  requestPermission: () => NativeAppBlocker.requestPermission(),
  isPermissionGranted: () => NativeAppBlocker.isPermissionGranted(),
};