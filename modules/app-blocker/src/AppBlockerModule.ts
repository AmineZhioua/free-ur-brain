import { requireNativeModule } from 'expo';

interface AppBlockerNativeModule {
  isPermissionGranted(): Promise<boolean>;
  requestPermission(): Promise<void>;
}

export default requireNativeModule<AppBlockerNativeModule>('AppBlocker');