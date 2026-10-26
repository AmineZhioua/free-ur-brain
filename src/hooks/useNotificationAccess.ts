import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { AppBlocker } from '../native/AppBlocker';

/**
 * Whether Notification access is on for FreeUrBrain.
 * null = not known yet (or the check failed), so no warning is shown for it.
 * Re-checked whenever the app returns to the foreground, e.g. from Android settings.
 */
export function useNotificationAccess() {
  const [granted, setGranted] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      setGranted(await AppBlocker.isNotificationAccessGranted());
    } catch {
      setGranted(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { granted, refresh };
}
