import { requireNativeModule } from 'expo';

export interface NativeInstalledApp {
  packageName: string;
  label: string;
  /** PNG data URI, e.g. "data:image/png;base64,..." */
  icon: string;
}

interface AppBlockerNativeModule {
  isPermissionGranted(): Promise<boolean>;
  requestPermission(): Promise<void>;
  getInstalledApps(): Promise<NativeInstalledApp[]>;
}

export default requireNativeModule<AppBlockerNativeModule>('AppBlocker');