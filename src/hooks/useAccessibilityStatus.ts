import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppBlocker } from '../native/AppBlocker';

/** granted: true / false, or null while unknown. */
export function useAccessibilityStatus() {
  const [granted, setGranted] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      setGranted(await AppBlocker.isPermissionGranted());
    } catch {
      setGranted(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  // The user typically returns from Android settings, so re-check on foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { granted, refresh };
}