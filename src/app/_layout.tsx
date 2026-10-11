import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { reconcileBlocking } from '@/core/commitment/CommitmentManager';

export default function RootLayout() {
  // Keep native blocking state consistent with the persisted commitment,
  // on launch and whenever the app returns to the foreground.
  useEffect(() => {
    const run = () => {
      reconcileBlocking().catch((e) => {
        if (__DEV__) console.warn('[reconcile] failed', e);
      });
    };

    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAF7' },
      }}
    />
  );
}