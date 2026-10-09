import { requireNativeModule } from 'expo';

/* 
  This file represents the interface between React Native and our Android native modules (AppBlocker), it tells
  TypeScript how to call the native functions we've created.
*/
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