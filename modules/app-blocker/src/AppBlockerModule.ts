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

  storageGetItem(key: string): Promise<string | null>;
  storageSetItem(key: string, value: string): Promise<void>;
  storageRemoveItem(key: string): Promise<void>;

  startBlocking(packageNames: string[], endsAt: number): Promise<void>;
  stopBlocking(): Promise<void>;
}

export default requireNativeModule<AppBlockerNativeModule>('AppBlockerModule');