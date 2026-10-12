import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { LapseSummary } from '../core/models/LapseSummary';
import { AppBlocker } from '../native/AppBlocker';

/**
 * summary: null while loading, or if it could not be read.
 * ready: true once the first attempt has finished (successfully or not).
 */
export function useLapseSummary(commitmentId: number | null) {
  const [summary, setSummary] = useState<LapseSummary | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (commitmentId == null) return;
    try {
      setSummary(await AppBlocker.getLapseSummary(commitmentId));
    } catch {
      setSummary(null);
    } finally {
      setReady(true);
    }
  }, [commitmentId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { summary, ready, refresh };
}