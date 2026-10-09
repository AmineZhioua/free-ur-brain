import NativeAppBlocker from '../../modules/app-blocker';

/** Thin boundary over the native key-value store. */
export const NativeStore = {
  getItem: (key: string) => NativeAppBlocker.storageGetItem(key),
  setItem: (key: string, value: string) => NativeAppBlocker.storageSetItem(key, value),
  removeItem: (key: string) => NativeAppBlocker.storageRemoveItem(key),
};