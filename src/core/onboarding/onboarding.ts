import {
  getJson, setJson, StorageKeys
} from '../storage/storage';


export async function isOnboardingDone(): Promise<boolean> {
  return (await getJson<boolean>(StorageKeys.onboardingDone)) === true;
}

export async function markOnboardingDone(): Promise<void> {
  await setJson(StorageKeys.onboardingDone, true);
}