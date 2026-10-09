import { getJson, setJson, StorageKeys } from "../storage/storage";

export async function loadSelectedPackages(): Promise<string[]> {
  const value = await getJson<unknown>(StorageKeys.selectedPackages);
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

export async function saveSelectedPackages(packages: string[]): Promise<void> {
  await setJson(StorageKeys.selectedPackages, Array.from(new Set(packages)));
}