import { NativeStore } from '../../native/NativeStore';

export const StorageKeys = {
  selectedPackages: 'selected_packages',
  commitment: 'commitment'
} as const;

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await NativeStore.getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted value: behave as if nothing was stored.
    return null;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  await NativeStore.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await NativeStore.removeItem(key);
}