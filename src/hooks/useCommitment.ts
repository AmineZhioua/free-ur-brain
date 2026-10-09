import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { Commitment } from '../core/models/Commitment';
import { loadCommitment } from '../core/commitment/CommitmentManager';

export function useCommitment() {
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setCommitment(await loadCommitment());
    setLoaded(true);
  }, []);

  // Reload whenever the screen gains focus...
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  // ...and whenever the app returns from the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { commitment, loaded, refresh };
}